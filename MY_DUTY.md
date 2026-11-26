# My Duty: WebSocket features (playlist + next-song vote)

This plan lets you work end to end without Person 2's code. Your part touches Person 2 at only three points (auth tokens, event/membership lookups, Redis events), and each one gets a stub you control and a swap-in date.

## The 3 seams to isolate

| Seam | What you need | Your stand-in until the real thing exists |
|---|---|---|
| Identity | A user id from the JWT | Verify tokens yourself with the shared `JWT_SECRET`, and write a `make_token.py` script that mints test tokens for fake users. |
| Access to events | "Can user X see event Y?" for event rooms | An `AccessChecker` interface with a `FakeAccessChecker` (in-memory rules) now, and an `HttpAccessChecker` later that asks the REST service. |
| Events in | Messages published by the REST service | A `fake_publisher.py` that pushes the agreed events into Redis. |

Playlists are fully yours, so they need none of this. They have their own tables, their own invitations table (`playlist_invites`), and their own routes, so you don't depend on Person 2's friends system.

## Phase 0: with the team (day 1 to 2), only what you need

Get these written down before you split:

- Message envelope: `{ "type", "room", "version", "data" }`.
- Event types and the data shape for each, for example `queue.updated`, `playlist.updated`, `access.revoked`, `error`.
- Redis channel names: `room:event:{id}` and `room:playlist:{id}`.
- JWT claims: `sub`, `exp`, `plan`, and the signing algorithm (HS256 with the shared secret is simplest).
- How the gateway asks about event access: agree on one REST endpoint, for example `GET /events/{id}`, which returns 200 if the caller may see it and 403/404 otherwise.
- Ownership: the `playlists`, `playlist_tracks`, `playlist_invites` tables are yours. Use a separate Alembic branch or schema so migrations never collide with Person 2's.

## Phase 1: standalone harness (days 1 to 3)

Build the tooling first. Everything later depends on it.

- `docker-compose.yml` with Postgres and Redis (or your own copy if the shared one isn't ready).
- Folder layout inside your area: `realtime/` (gateway) and `playlists/` (router, service, models).
- `scripts/make_token.py`: creates valid JWTs for users alice, bob, carol.
- `scripts/fake_publisher.py`: publishes sample `queue.updated` events to Redis on a timer.
- `scripts/ws_client.py`: a small test client that connects, authenticates, joins a room, and prints what it receives.
- Dev-only user bypass on your playlist routes (`X-Dev-User` header), disabled when `ENV=production`.
- Makefile targets: `make up`, `make realtime`, `make playlists`, `make test`.

**Done when:** you can start Redis, run the fake publisher, and watch `ws_client.py` print events.

## Phase 2: WebSocket gateway (week 1 to 2)

Build in this order, testing each step with your client:

1. Connection endpoint and a `ConnectionManager` holding `rooms: dict[room_id, set[connection]]`.
2. Auth handshake: the first message must be `{ "type": "auth", "token": "..." }` within about 5 seconds, or the server closes the connection. Verify signature and expiry locally. Never put the token in the URL.
3. Join and leave messages: `{ "type": "join", "room": "playlist:123" }`. Each join goes through `AccessChecker.can_view(user_id, room)`.
4. Redis subscriber: one background task subscribing to the room channels (use a pattern subscription like `room:*`) and forwarding each message to the connections in that room.
5. Heartbeat: the server pings every ~25 seconds, and drops connections that don't answer. Clean up rooms on disconnect, so there are no leaks.
6. Access revocation: support a Redis message `access.revoked` (user_id, room) that removes the user from the room and sends them an error, plus a periodic re-check for long-lived connections.
7. Versions: the gateway doesn't invent versions, it forwards the publisher's. Clients detect a gap (they saw 41, now got 43) and refetch over REST.
8. Hardening: a maximum message size, a limit on rooms per connection, rate limiting of client messages, and structured logs (user, room, event).

**Done when:** two test clients in one room both receive an event published to Redis, and a client who isn't allowed in a room is refused and never sees its messages.

## Phase 3: Playlist Editor service (week 2 to 3)

### Schema

- `playlists(id, owner_id, name, visibility, edit_license, version, created_at)`
- `playlist_tracks(id, playlist_id, track_ref, title, artist, position, added_by)` with an index on `(playlist_id, position)`
- `playlist_invites(playlist_id, user_id, can_edit)`

Store `owner_id` and `user_id` as plain UUIDs, not foreign keys, until integration. Add the foreign keys after you've joined the real users table.

### Endpoints

- `POST /playlists`, `GET /playlists` (only what the caller may see), `GET /playlists/{id}`
- `PATCH /playlists/{id}` (visibility, license), invites add/remove
- `POST /playlists/{id}/tracks` (add), `DELETE .../tracks/{track_id}`, `POST .../tracks/{track_id}/move`

### Permissions, kept as one reusable function

- `can_view`: public, or owner, or invited.
- `can_edit`: if license is `everyone`, anyone who can view; if `invited`, only invited editors and the owner.
- Return **404 (not 403)** for playlists a user can't see, so private playlists don't leak.

### Edit transaction pattern

```python
with session.begin():
    pl = session.execute(
        select(Playlist).where(Playlist.id == pid).with_for_update()
    ).scalar_one()
    # check permission and optional base_version
    # change tracks, assign position on the server
    pl.version += 1
# after commit:
redis.publish(f"room:playlist:{pid}", json.dumps(envelope))
```

### Move semantics

The request says "move track X after track Y" (or to the start), not "to index 3", because indexes change under concurrent edits. The server finds the neighbors and picks a position.

### Position scheme

Gaps (1024, 2048, ...) and take the midpoint when inserting between two tracks. If the gap between neighbors drops below 1, rebalance the whole playlist inside the same locked transaction. Write down why you chose this over renumbering or fractional indexing.

### Base version rule (decide and defend one)

- **Simple:** the lock serializes edits, and every operation is applied to the latest state. Moves are relative to tracks, so they stay meaningful.
- **Stricter:** the client sends `base_version`, and on mismatch the server returns 409 with the current state.

Start with the simple one and mention the stricter one in the defense.

### Publish after commit

If the process dies between commit and publish, a message is lost, but versions let clients notice the gap and refetch, which is why the version counter matters.

**Done when:** all endpoints work through the Swagger page with your dev header, and your test client sees `playlist.updated` events with increasing versions.

## Phase 4: Concurrency and robustness tests (week 3 to 4)

These are your strongest evidence in the evaluation.

- 50 parallel move calls on one playlist, then assert that positions are unique and ordered, the version equals the number of successful edits, and no track is lost or duplicated.
- Parallel add and delete of the same track.
- A permission matrix test: public/private x owner/invited/stranger x license everyone/invited, for both view and edit.
- Several WebSocket clients in one room all receive the same sequence of versions.
- Kill a client mid-session and reconnect: it should refetch and match the server state.
- Gateway tests: bad token, expired token, auth timeout, joining a forbidden room, revoked access, oversized message.
- A small Locust or k6 script for WebSocket connections and playlist edits, which feeds Person 2's ramp-up section. Report numbers with your machine specs.

## Phase 5: Integration swaps (end of week 2, then end of week 4)

- **Real auth:** replace `make_token.py` with real tokens from Person 2's login. If you verify with the same secret and claims, this should be a no-op, and you only remove the dev header.
- **Real access checks:** swap `FakeAccessChecker` for `HttpAccessChecker`, which calls the REST event endpoint with the user's token and caches the answer for a few seconds. Event rooms start working with real events.
- **Real events:** Person 2's vote service publishes to Redis, and your gateway forwards it with no changes if the envelope was frozen on day 1.
- **Foreign keys:** add them to the real users table.
- **Full flow with Person 1:** two phones, one playlist, one event, live updates.

## Phase 6: Bonuses (after the mandatory freeze, on branches)

### Offline sync (server side)

- `POST /playlists/{id}/sync` takes a list of queued operations, each with a client id, operation type, and client timestamp.
- Apply them in order inside one locked transaction, using your conflict rule (for example, a move whose target track no longer exists is rejected).
- Respond with the new state, the new version, and a list of rejected operations with reasons.
- Make it idempotent with the client operation id, so a retry after a dropped connection doesn't apply twice.

### iBeacon (server side)

- Table `event_beacons(uuid, major, minor, event_id)`.
- `GET /beacons/{uuid}/{major}/{minor}` returns public event info only, never anything private.
- This touches Person 2's events table, so agree the read-only join with them first.

### Subscription

Attach `require_plan("premium")` to the playlist routes. Stub it with a fake dependency until Person 2's plan field exists.

## Weekly view

| Week | Focus | Checkpoint |
|---|---|---|
| 0 | Contract items (day 1 to 2) | Frozen envelope, channels, JWT claims |
| 1 | Harness, gateway auth, rooms, Redis fan-out | Two test clients receive a published event |
| 2 | Heartbeat, join checks, revocation, playlist schema and CRUD | Playlist works via Swagger with dev header. Integration 1: real tokens |
| 3 | Add/remove/move with locking, publish, versions | Live updates in a room |
| 4 | Concurrency tests, gateway security tests, load script. Integration 2: real access checks | Full flow with Person 1 |
| 5 | Docs, cleanup, fresh-clone test | Mandatory freeze |
| 6 | Offline sync endpoint, then beacon endpoint | Bonuses on branches |

## Things to be ready to explain in the defense

- Why the REST side writes and the gateway only forwards (no races in the gateway).
- Why Redis sits in between (multiple workers, separate scaling, and decoupling).
- Why clients refetch on reconnect and how versions reveal gaps.
- Why relative moves and row locks give a correct order under concurrency.
- Why 404 instead of 403 for private playlists.
