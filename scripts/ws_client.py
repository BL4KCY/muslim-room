"""Test client: auth, heartbeat, reconnect with backoff. Prints what it receives.

Run:
  uv run --with websockets scripts/ws_client.py --token TOKEN --room playlist:1
"""

import argparse
import asyncio
import contextlib
import json

import websockets


def reconnect_delays(
  base: int = 5, factor: int = 2, cap: int = 60, attempts: int = 5
) -> list[int]:
  """5s, then exponentially longer (10, 20, 40...), capped."""
  return [min(base * factor**i, cap) for i in range(attempts)]


async def send(ws, message: dict) -> None:
  await ws.send(json.dumps(message))


async def heartbeat_loop(ws, interval: float) -> None:
  while True:
    await asyncio.sleep(interval)
    await send(ws, {"type": "heartbeat"})


async def session(url: str, token: str, rooms: list[str], interval: float) -> bool:
  """Run one connection. Returns True if it authenticated at least once."""
  authenticated = False
  beat = None
  async with websockets.connect(url) as ws:
    await send(ws, {"type": "auth", "token": token})
    try:
      async for raw in ws:
        msg = json.loads(raw)
        kind = msg.get("type")
        if kind == "authenticated":
          authenticated = True
          for room in rooms:  # (re-)join after every (re)connect
            await send(ws, {"type": "join", "room": room})
          if beat:
            beat.cancel()
          beat = asyncio.create_task(heartbeat_loop(ws, interval))
        elif kind == "ping":
          await send(ws, {"type": "heartbeat"})  # any message proves we are alive
        if kind != "heartbeat_ack":
          print("<-", raw)
    finally:
      if beat:
        beat.cancel()
  return authenticated


async def run(args: argparse.Namespace) -> None:
  delays = reconnect_delays()
  attempt = 0
  while True:
    try:
      was_connected = await session(
        args.url, args.token, args.room, args.heartbeat_interval
      )
      print("connection closed")
    except (OSError, websockets.exceptions.WebSocketException) as exc:
      was_connected = False
      print("connection error:", exc)

    if was_connected:
      attempt = 0  # it worked for a while: restart the backoff
    if attempt >= len(delays):
      print("giving up")
      return
    delay = delays[attempt]
    attempt += 1
    print(f"reconnecting in {delay}s (attempt {attempt}/{len(delays)})")
    await asyncio.sleep(delay)


def main() -> None:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument("--url", default="ws://localhost:8000/api/v1/ws/rooms")
  parser.add_argument("--token", required=True)
  parser.add_argument("--room", action="append", default=[], help="repeatable")
  parser.add_argument("--heartbeat-interval", type=float, default=30)
  args = parser.parse_args()
  with contextlib.suppress(KeyboardInterrupt):
    asyncio.run(run(args))


if __name__ == "__main__":
  main()
