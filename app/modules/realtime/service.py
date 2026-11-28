import asyncio
from dataclasses import dataclass

import jwt
from fastapi import WebSocket
from jwt.exceptions import InvalidTokenError

from app.core.config import get_settings
from app.modules.realtime.exceptions import (
  AuthenticationFailed,
  UnresponsiveConnection,
)

AUTH_TIMEOUT_SECONDS = 5
HEARTBEAT_TIMEOUT_SECONDS = 30
# After 30s of silence: probe, wait 5s, probe, wait 10s, ... then kick (75s grace).
PROBE_DELAYS_SECONDS = (5, 10, 20, 40)


@dataclass(frozen=True)
class AuthenticatedUser:
  uid: int
  username: str


def verify_token(token: str) -> AuthenticatedUser:
  settings = get_settings()
  try:
    payload = jwt.decode(
      token, settings.secret_key.get_secret_value(), settings.algorithm
    )
  except InvalidTokenError as exc:  # bad signature, expired, malformed...
    raise AuthenticationFailed("invalid or expired token") from exc

  uid = payload.get("uid")
  username = payload.get("sub")
  if isinstance(uid, bool) or not isinstance(uid, int) or not isinstance(username, str):
    raise AuthenticationFailed("token is missing uid or sub")
  return AuthenticatedUser(uid=uid, username=username)


async def authenticate(websocket: WebSocket) -> AuthenticatedUser:
  """Read the first message and turn it into a user, or raise."""
  try:
    first = await asyncio.wait_for(websocket.receive_json(), AUTH_TIMEOUT_SECONDS)
  except TimeoutError as exc:
    raise UnresponsiveConnection from exc
  except ValueError as exc:  # the client sent something that is not JSON
    raise AuthenticationFailed("first message must be JSON") from exc

  if not isinstance(first, dict) or first.get("type") != "auth":
    raise AuthenticationFailed("first message must be an auth message")
  token = first.get("token")
  if not isinstance(token, str):
    raise AuthenticationFailed("auth message needs a token")
  return verify_token(token)


async def receive_alive(websocket: WebSocket) -> dict:
  """Receive the next message, probing a silent client before giving up.

  Any message counts as proof of life, not only "heartbeat".
  """
  try:
    return await asyncio.wait_for(websocket.receive_json(), HEARTBEAT_TIMEOUT_SECONDS)
  except TimeoutError:
    pass

  for attempt, delay in enumerate(PROBE_DELAYS_SECONDS, start=1):
    await websocket.send_json({"type": "ping", "attempt": attempt})
    try:
      return await asyncio.wait_for(websocket.receive_json(), delay)
    except TimeoutError:
      continue
  raise UnresponsiveConnection("heartbeat timeout")
