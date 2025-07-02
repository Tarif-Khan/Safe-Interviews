from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import secrets
import string
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
from auth import AuthenticatedUser, verify_token, require_interviewer_role, require_candidate_role

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Safe Interviews Backend", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite and React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
interview_rooms: Dict[str, dict] = {}
active_connections: Dict[str, List[WebSocket]] = {}

class CreateRoomRequest(BaseModel):
    pass  # User info will come from authentication

class JoinRoomRequest(BaseModel):
    room_code: str

class EditorUpdate(BaseModel):
    room_code: str
    content: str
    user_id: str
    user_name: str
    cursor_position: Optional[dict] = None

def generate_room_code() -> str:
    """Generate a 6-digit alphanumeric room code"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))

@app.post("/api/create-room")
async def create_room(request: CreateRoomRequest, interviewer: AuthenticatedUser = Depends(require_interviewer_role)):
    """Create a new interview room with a unique 6-digit code"""
    room_code = generate_room_code()
    
    # Ensure unique room code
    while room_code in interview_rooms:
        room_code = generate_room_code()
    
    interview_rooms[room_code] = {
        "code": room_code,
        "interviewer": {
            "id": interviewer.user_id,
            "name": interviewer.name,
            "email": interviewer.email
        },
        "candidate": None,
        "created_at": datetime.utcnow(),
        "status": "waiting_for_candidate",
        "editor_content": "// Welcome to Safe Interviews!\n// Start coding together...\n",
        "participants": []
    }
    
    active_connections[room_code] = []
    
    logger.info(f"Room {room_code} created by interviewer {interviewer.name} ({interviewer.email})")
    
    return {
        "room_code": room_code,
        "status": "success",
        "message": "Room created successfully"
    }

@app.post("/api/join-room")
async def join_room(request: JoinRoomRequest, candidate: AuthenticatedUser = Depends(require_candidate_role)):
    """Join an existing interview room using the 6-digit code"""
    room_code = request.room_code.upper()
    
    if room_code not in interview_rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = interview_rooms[room_code]
    
    if room["candidate"] is not None:
        raise HTTPException(status_code=400, detail="Room already has a candidate")
    
    # Add candidate to room
    room["candidate"] = {
        "id": candidate.user_id,
        "name": candidate.name,
        "email": candidate.email
    }
    room["status"] = "active"
    
    logger.info(f"Candidate {candidate.name} ({candidate.email}) joined room {room_code}")
    
    return {
        "room_code": room_code,
        "status": "success",
        "message": "Joined room successfully",
        "room_info": {
            "interviewer": room["interviewer"],
            "candidate": room["candidate"],
            "editor_content": room["editor_content"]
        }
    }

@app.get("/api/room/{room_code}")
async def get_room_info(room_code: str):
    """Get information about a specific room"""
    room_code = room_code.upper()
    
    if room_code not in interview_rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    room = interview_rooms[room_code]
    return {
        "room_code": room_code,
        "interviewer": room["interviewer"],
        "candidate": room["candidate"],
        "status": room["status"],
        "editor_content": room["editor_content"]
    }

@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    """WebSocket endpoint for real-time collaboration"""
    room_code = room_code.upper()
    
    if room_code not in interview_rooms:
        await websocket.close(code=4004, reason="Room not found")
        return
    
    await websocket.accept()
    
    # Add connection to room
    if room_code not in active_connections:
        active_connections[room_code] = []
    active_connections[room_code].append(websocket)
    
    try:
        # Send current room state to new connection
        room = interview_rooms[room_code]
        await websocket.send_text(json.dumps({
            "type": "room_state",
            "room_info": {
                "interviewer": room["interviewer"],
                "candidate": room["candidate"],
                "status": room["status"],
                "editor_content": room["editor_content"]
            }
        }))
        
        # Notify other participants about new connection
        await broadcast_to_room(room_code, {
            "type": "participant_joined",
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_websocket=websocket)
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "editor_update":
                # Update room content
                room["editor_content"] = message["content"]
                
                # Broadcast to all other connections in the room
                await broadcast_to_room(room_code, {
                    "type": "editor_update",
                    "content": message["content"],
                    "user_id": message.get("user_id"),
                    "user_name": message.get("user_name"),
                    "cursor_position": message.get("cursor_position"),
                    "timestamp": datetime.utcnow().isoformat()
                }, exclude_websocket=websocket)
                
            elif message["type"] == "cursor_update":
                # Broadcast cursor position to other participants
                await broadcast_to_room(room_code, {
                    "type": "cursor_update",
                    "user_id": message.get("user_id"),
                    "user_name": message.get("user_name"),
                    "cursor_position": message.get("cursor_position"),
                    "timestamp": datetime.utcnow().isoformat()
                }, exclude_websocket=websocket)
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected from room {room_code}")
    except Exception as e:
        logger.error(f"WebSocket error in room {room_code}: {e}")
    finally:
        # Remove connection
        if room_code in active_connections:
            try:
                active_connections[room_code].remove(websocket)
                if not active_connections[room_code]:
                    del active_connections[room_code]
            except ValueError:
                pass
        
        # Notify remaining participants
        await broadcast_to_room(room_code, {
            "type": "participant_left",
            "timestamp": datetime.utcnow().isoformat()
        })

async def broadcast_to_room(room_code: str, message: dict, exclude_websocket: WebSocket = None):
    """Broadcast a message to all connections in a room"""
    if room_code not in active_connections:
        return
    
    disconnected_connections = []
    
    for connection in active_connections[room_code]:
        if connection == exclude_websocket:
            continue
            
        try:
            await connection.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send message to connection: {e}")
            disconnected_connections.append(connection)
    
    # Remove disconnected connections
    for connection in disconnected_connections:
        try:
            active_connections[room_code].remove(connection)
        except ValueError:
            pass

@app.delete("/api/room/{room_code}")
async def close_room(room_code: str):
    """Close an interview room"""
    room_code = room_code.upper()
    
    if room_code not in interview_rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Notify all participants that room is closing
    await broadcast_to_room(room_code, {
        "type": "room_closed",
        "message": "The interview room has been closed",
        "timestamp": datetime.utcnow().isoformat()
    })
    
    # Close all WebSocket connections
    if room_code in active_connections:
        for connection in active_connections[room_code]:
            try:
                await connection.close()
            except Exception:
                pass
        del active_connections[room_code]
    
    # Remove room
    del interview_rooms[room_code]
    
    logger.info(f"Room {room_code} closed")
    
    return {"status": "success", "message": "Room closed successfully"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "active_rooms": len(interview_rooms),
        "active_connections": sum(len(connections) for connections in active_connections.values())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 