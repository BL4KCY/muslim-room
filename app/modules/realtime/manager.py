from fastapi import WebSocket


class ConnectionManager:
  """Keeps track of which connections are in which rooms (in memory)."""

  def __init__(self):
    # room name -> connections in that room (used for broadcasting)
    self.rooms: dict[str, set[WebSocket]] = {}
    # connection -> rooms it joined (used to clean up on disconnect)
    self.memberships: dict[WebSocket, set[str]] = {}

  async def connect(self, websocket: WebSocket) -> None:
    await websocket.accept()
    self.memberships[websocket] = set()

  def disconnect(self, websocket: WebSocket) -> None:
    # Safe to call twice: pop() returns an empty set the second time.
    for room in self.memberships.pop(websocket, set()):
      self._remove_from_room(websocket, room)

  def join(self, websocket: WebSocket, room: str) -> None:
    self.rooms.setdefault(room, set()).add(websocket)
    self.memberships[websocket].add(room)

  def leave(self, websocket: WebSocket, room: str) -> None:
    self.memberships[websocket].discard(room)
    self._remove_from_room(websocket, room)

  def is_member(self, websocket: WebSocket, room: str) -> bool:
    return room in self.memberships.get(websocket, set())

  async def broadcast(self, room: str, message: dict) -> None:
    # Iterate over a copy: disconnect() may change the set while we loop.
    for connection in list(self.rooms.get(room, ())):
      try:
        await connection.send_json(message)
      except Exception:
        # Dead socket: drop it so it doesn't stay in the room forever.
        self.disconnect(connection)

  def _remove_from_room(self, websocket: WebSocket, room: str) -> None:
    connections = self.rooms.get(room)
    if connections is None:
      return
    connections.discard(websocket)
    if not connections:
      del self.rooms[room]


manager = ConnectionManager()
