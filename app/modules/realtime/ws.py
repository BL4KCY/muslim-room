from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

from app.modules.realtime.manager import manager

router = APIRouter(prefix="/ws", tags=["realtime"])

# Tiny test page: open /api/v1/ws/ in two tabs, join the same room, and chat.
html = """
<!DOCTYPE html>
<html>
  <head><title>WS rooms</title></head>
  <body>
    <h1>WebSocket rooms</h1>
    <form onsubmit="joinRoom(event)">
      <input type="text" id="roomName" placeholder="room" autocomplete="off"/>
      <button>Join</button>
      <button type="button" onclick="leaveRoom()">Leave</button>
    </form>
    <form onsubmit="sendMessage(event)">
      <input type="text" id="messageText" placeholder="message" autocomplete="off"/>
      <button>Send</button>
    </form>
    <ul id="messages"></ul>
    <script>
      var ws = new WebSocket("ws://localhost:8000/api/v1/ws/rooms");
      var room = null;
      ws.onmessage = function(event) {
        var li = document.createElement("li");
        li.textContent = event.data;
        document.getElementById("messages").appendChild(li);
      };
      function joinRoom(event) {
        event.preventDefault();
        room = document.getElementById("roomName").value;
        ws.send(JSON.stringify({type: "join", room: room}));
      }
      function leaveRoom() {
        ws.send(JSON.stringify({type: "leave", room: room}));
      }
      function sendMessage(event) {
        event.preventDefault();
        var input = document.getElementById("messageText");
        ws.send(JSON.stringify({type: "message", room: room, data: input.value}));
        input.value = "";
      }
    </script>
  </body>
</html>
"""


@router.get("/")
async def test_page():
  return HTMLResponse(html)


@router.websocket("/echo")
async def echo(websocket: WebSocket):
  await websocket.accept()
  try:
    while True:
      data = await websocket.receive_json()
      await websocket.send_json(data)
  except WebSocketDisconnect:
    print("client left")


@router.websocket("/rooms")
async def rooms(websocket: WebSocket):
  await manager.connect(websocket)
  try:
    while True:
      msg = await websocket.receive_json()
      kind = msg.get("type")
      room = msg.get("room")

      if not isinstance(room, str) or not room:
        await websocket.send_json({"type": "error", "detail": "room is required"})
      elif kind == "join":
        manager.join(websocket, room)
        await websocket.send_json({"type": "joined", "room": room})
      elif kind == "leave":
        manager.leave(websocket, room)
        await websocket.send_json({"type": "left", "room": room})
      elif kind == "message":
        if not manager.is_member(websocket, room):
          await websocket.send_json({"type": "error", "detail": "join the room first"})
        else:
          await manager.broadcast(
            room, {"type": "message", "room": room, "data": msg.get("data")}
          )
      else:
        await websocket.send_json({"type": "error", "detail": "unknown type"})
  except WebSocketDisconnect:
    pass
  finally:
    manager.disconnect(websocket)
