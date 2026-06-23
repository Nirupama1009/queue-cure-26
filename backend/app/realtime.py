from __future__ import annotations

import json
from collections.abc import Callable

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self.connections.discard(websocket)

    async def broadcast(self, event_type: str, payload: dict) -> None:
        dead_connections: list[WebSocket] = []
        message = json.dumps({"type": event_type, "payload": payload}, default=str)
        for connection in list(self.connections):
            try:
                await connection.send_text(message)
            except Exception:
                dead_connections.append(connection)
        for connection in dead_connections:
            self.disconnect(connection)


manager = ConnectionManager()
