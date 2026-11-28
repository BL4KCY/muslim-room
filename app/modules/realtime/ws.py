from contextlib import suppress
from typing import Annotated

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from fastapi.responses import HTMLResponse

from app.modules.realtime.access import AccessChecker, get_access_checker
from app.modules.realtime.exceptions import (
  AuthenticationFailed,
  UnresponsiveConnection,
)
from app.modules.realtime.manager import manager
from app.modules.realtime.service import authenticate, receive_alive

router = APIRouter(prefix="/ws", tags=["realtime"])

# Tiny test page: open /api/v1/ws/ in two tabs, join the same room, and chat.
html = """
<!DOCTYPE html>
<html>
  <head><title>WS rooms</title></head>
  <body>
    <h1>WebSocket rooms</h1>
    <form onsubmit="connect(event)">
      <input type="text" id="token" placeholder="access token" autocomplete="off"/>
      <button>Connect</button>
    </form>
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
      var ws = null;
      var room = null;
      var joined = [];              // rooms to re-join after a reconnect
      var heartbeat = null;
      var attempt = 0;
      var DELAYS = [5, 10, 20, 40, 60];   // seconds between reconnect attempts
      function log(text) {
        var li = document.createElement("li");
        li.textContent = text;
        document.getElementById("messages").appendChild(li);
      }
      function send(obj) {
        if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
      }
      function connect(event) {
        if (event) { event.preventDefault(); attempt = 0; }
        ws = new WebSocket("ws://localhost:8000/api/v1/ws/rooms");
        ws.onopen = function() {
          // the first message must be the auth message
          send({type: "auth", token: document.getElementById("token").value});
        };
        ws.onmessage = function(e) {
          var msg = JSON.parse(e.data);
          if (msg.type === "authenticated") {
            attempt = 0;
            clearInterval(heartbeat);
            heartbeat = setInterval(function() { send({type: "heartbeat"}); }, 30000);
            joined.forEach(function(r) { send({type: "join", room: r}); });
          } else if (msg.type === "ping") {
            send({type: "heartbeat"});   // any message proves we are alive
          } else if (msg.type === "joined" && joined.indexOf(msg.room) < 0) {
            joined.push(msg.room);
          } else if (msg.type === "left") {
            joined = joined.filter(function(r) { return r !== msg.room; });
          }
          if (msg.type !== "heartbeat_ack") log(e.data);
        };
        ws.onclose = function(e) {
          clearInterval(heartbeat);
          log("closed: " + e.code);
          if (attempt >= DELAYS.length) { log("giving up"); return; }
          var delay = DELAYS[attempt++];
          log("reconnecting in " + delay + "s (attempt " + attempt + ")");
          setTimeout(connect, delay * 1000);
        };
      }
      function joinRoom(event) {
        event.preventDefault();
        room = document.getElementById("roomName").value;
        send({type: "join", room: room});
      }
      function leaveRoom() {
        send({type: "leave", room: room});
      }
      function sendMessage(event) {
        event.preventDefault();
        var input = document.getElementById("messageText");
        send({type: "message", room: room, data: input.value});
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
async def rooms(
  websocket: WebSocket,
  checker: Annotated[AccessChecker, Depends(get_access_checker)],
):
  await manager.connect(websocket)
  try:
    # Authenticate once, before the loop. Only authenticated users get past here.
    user = await authenticate(websocket)
    await websocket.send_json({"type": "authenticated", "uid": user.uid})

    while True:
      msg = await receive_alive(websocket)
      kind = msg.get("type")
      room = msg.get("room")

      if kind == "heartbeat":
        await websocket.send_json({"type": "heartbeat_ack"})
      elif not isinstance(room, str) or not room:
        await websocket.send_json({"type": "error", "detail": "room is required"})
      elif kind == "join":
        # Same answer for "forbidden" and "does not exist": don't leak private rooms.
        if await checker.can_view(user.uid, room):
          manager.join(websocket, room)
          await websocket.send_json({"type": "joined", "room": room})
        else:
          await websocket.send_json(
            {"type": "error", "detail": "cannot join this room"}
          )
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
  except (UnresponsiveConnection, AuthenticationFailed) as exc:
    # The socket may already be dead (heartbeat timeout): don't let that raise.
    with suppress(Exception):
      await websocket.send_json({"type": "error", "detail": str(exc)})
      await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
  finally:
    manager.disconnect(websocket)
