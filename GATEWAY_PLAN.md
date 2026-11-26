# Plan: learn-as-you-build the WebSocket gateway (Phase 2 of MY_DUTY.md)

## Context
The user owns the realtime part (playlist + next-song vote) of a 3-person project. They have not studied Redis pub/sub, SQLAlchemy transactions or locking, so they start with the WebSocket gateway, the piece that needs the least of those. Redis comes in only at step 5, after the WebSocket and room basics work.

This is a learning project (`.claude/rules/socratic-mentor.md`). Each step below names a concept, a guiding question, a small task for the user to write, and a way to verify it. Claude does not write the implementation. It gives hints, reads the user's code and asks what they expect it to do.

## What the codebase already gives us
- `app/app.py`: `create_app()` and a `lifespan` that runs at startup and shutdown. The Redis subscriber task will start there.
- `app/core/config.py`: `Settings` already has `secret_key`, `algorithm` (HS256) and `redis_url`. Reuse these for token checks.
- `app/core/security.py`: `create_access_token` shows how tokens are made. Verification uses the same `jwt` library with `jwt.decode`.
- `app/api/v1/router.py`: where new routers are registered.
- Module layout (`router.py`, `service.py`, `schema.py`) goes in `app/modules/realtime/`. MY_DUTY.md calls the folder `realtime/`, so the exact placement is for the user to decide. A module inside the existing app is the simplest start.

Gaps to be aware of:
- No Redis service in `docker-compose.yaml`, no `redis` dependency in `pyproject.toml` and no WebSocket code yet.
- `sub` in the current JWT is the **username**, not a UUID. MY_DUTY.md assumes a user id in `sub`. Raise this with the team in Phase 0 (a contract item).
- The DB layer is synchronous (psycopg). The gateway is async. Note this for later and don't mix them yet.

## Steps (each ends with something the user can run)

0. **Concept primer** (a few minutes, no code). WebSocket vs HTTP (one persistent two-way connection) and FastAPI's `WebSocket` (`accept`, `receive_json`, `send_json`, `WebSocketDisconnect`).
   - Question: why can't a normal REST endpoint push a "next song" update to a client?

1. **Echo endpoint + test client.** One `/ws` endpoint that echoes JSON. Write `scripts/ws_client.py` using the `websockets` package.
   - Verify: the client sends a message and prints the echo. Then kill the client and watch the server handle the disconnect.

2. **ConnectionManager with rooms** (in memory, no Redis yet). A `rooms: dict[str, set[WebSocket]]` structure, `join`, `leave` and `broadcast(room, message)`, plus the `join` and `leave` message types.
   - Question: what must happen to the dict when a client disconnects without saying `leave`?
   - Verify: two clients join the same room and a message from one reaches the other. A client in another room sees nothing.

3. **Auth handshake.** The first message must be `{"type":"auth","token":...}` within about 5 seconds (`asyncio.wait_for`), or the server closes the connection. Verify the token with `jwt.decode` and the existing settings. Write `scripts/make_token.py` to mint tokens for alice, bob and carol.
   - Question: what should happen if `sub` is missing, or the token has expired?
   - Verify: valid token OK. Bad token, expired token and timeout are each refused with a close code.

4. **AccessChecker seam.** Define an interface with `can_view(user_id, room)`, plus a `FakeAccessChecker` with hard-coded rules. `join` calls it.
   - Concept: dependency injection and why a stub now makes the real REST check a drop-in later.
   - Verify: alice can join `playlist:1`, bob is refused, and a refused client never receives that room's messages.

5. **Redis pub/sub** (the new concept). First add a `redis` service to `docker-compose.yaml` and `redis` to the dependencies (`uv add redis`). Then write `scripts/fake_publisher.py` and a subscriber background task started in `lifespan`. It uses a pattern subscription on `room:*` and forwards each message to `manager.broadcast`.
   - Learn: publish/subscribe, fire-and-forget (no history, so a missed message is lost), the pattern subscription, and why the REST side publishes while the gateway only forwards.
   - Try `redis-cli SUBSCRIBE` and `PUBLISH` by hand before writing code.
   - Verify: run the publisher and two clients in one room, and both print each event. This is the Phase 2 "done when" test.

6. **Heartbeat and cleanup.** The server pings every ~25 seconds and drops connections that don't answer. Check that rooms are emptied on every exit path (use `try/finally`).
   - Verify: kill a client abruptly and confirm the room set shrinks.

7. **Access revocation.** Handle an `access.revoked` message from Redis: remove that user from the room and send them an `error` message. Optionally add a periodic re-check.

8. **Hardening.** A maximum message size, a limit on rooms per connection, rate limiting of client messages and structured logs. Then tests for bad token, expired token, auth timeout, forbidden room, revoked access and oversized message.

## Open items to settle with the team (Phase 0)
Envelope `{type, room, version, data}`, the event types, the Redis channel names (`room:event:{id}`, `room:playlist:{id}`), the JWT claims (including `sub` = username vs UUID), and the REST endpoint for access checks.

## Verification (end to end)
`make db` (Postgres + Redis) → `make dev` → run `fake_publisher.py` → two `ws_client.py` instances join the same room and both print the same events in order. A third client with a bad token or without access is refused and prints nothing.

## First action for the user
Steps 0 and 1: read the FastAPI WebSockets page, then try to write the echo endpoint and `ws_client.py` on their own.

## Step 0-1 notes

A normal HTTP request goes one way: the client asks, the server answers, and it's over. A WebSocket stays open after the handshake, so either side can send at any time. That is how the server pushes "next song" to every phone.

**Step 1 task:** a `/ws` endpoint that accepts a connection, reads JSON in a loop and sends it back.

- Read the FastAPI WebSockets page: `websocket.accept()`, `receive_json()` / `send_json()`, `WebSocketDisconnect`.
- Put it in `app/modules/realtime/router.py` and register it in `app/api/v1/router.py`.
- Write `scripts/ws_client.py` with the `websockets` package. Run: `uv run --with websockets scripts/ws_client.py`.

**Questions:**
1. If `receive_json()` is in a `while True` loop and the client closes, what happens on the next call? How do you stop the loop cleanly?
2. Your routers sit under `/api/v1`. What full URL does the client connect to?
