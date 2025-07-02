# Safe Interviews Backend

Python FastAPI backend for real-time collaborative coding interviews.

## Features

- **Authentication**: Integrated with Supabase authentication
- **Room Management**: Create and join interview rooms with 6-digit codes
- **Real-time Collaboration**: WebSocket-based live code editing
- **Role-based Access**: Separate interviewer and candidate roles

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp config.example.env .env
# Edit .env with your Supabase configuration
```

## Configuration

Create a `.env` file with the following variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
PORT=8000
HOST=0.0.0.0
```

You can find these values in your Supabase project dashboard:
- Go to Settings > API
- Copy the Project URL (SUPABASE_URL)
- Copy the anon/public key (SUPABASE_ANON_KEY)
- Copy the JWT Secret (SUPABASE_JWT_SECRET)

## Running the Server

### Development Mode
```bash
python start.py
```

### Production Mode
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000`

## API Endpoints

### Authentication Required
All endpoints require a valid Supabase JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Room Management

#### Create Room
```http
POST /api/create-room
Content-Type: application/json
Authorization: Bearer <interviewer_token>

{}
```

Response:
```json
{
  "room_code": "ABC123",
  "status": "success", 
  "message": "Room created successfully"
}
```

#### Join Room
```http
POST /api/join-room
Content-Type: application/json
Authorization: Bearer <candidate_token>

{
  "room_code": "ABC123"
}
```

#### Get Room Info
```http
GET /api/room/{room_code}
```

#### Close Room
```http
DELETE /api/room/{room_code}
```

### Real-time Collaboration

#### WebSocket Connection
```
ws://localhost:8000/ws/{room_code}
```

WebSocket message types:

**Editor Update:**
```json
{
  "type": "editor_update",
  "content": "// Updated code content",
  "user_id": "user_123",
  "user_name": "John Doe",
  "cursor_position": {"line": 5, "column": 10}
}
```

**Cursor Update:**
```json
{
  "type": "cursor_update", 
  "user_id": "user_123",
  "user_name": "John Doe",
  "cursor_position": {"line": 5, "column": 10}
}
```

### Health Check
```http
GET /api/health
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Supabase      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Auth & DB)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         └───────────────────────┘
              WebSocket
         (Real-time collaboration)
```

## Development

### Adding New Features

1. Define new API endpoints in `app.py`
2. Add authentication decorators for protected routes
3. Update WebSocket message handlers for real-time features
4. Add corresponding frontend integration

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

## Production Deployment

1. Set up a production environment with proper secrets
2. Use a production WSGI server like Gunicorn:
```bash
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker
```
3. Set up reverse proxy (nginx)
4. Configure SSL/TLS certificates
5. Use a proper database instead of in-memory storage

## Security Considerations

- All API endpoints require authentication
- JWT tokens are verified against Supabase
- Room codes are cryptographically secure
- WebSocket connections validate room membership
- CORS is configured for specific origins

## Troubleshooting

**Token verification errors:**
- Ensure SUPABASE_JWT_SECRET is correctly set
- Check that tokens are valid and not expired
- Verify Supabase project configuration

**WebSocket connection issues:**
- Check CORS configuration
- Ensure room exists before connecting
- Verify authentication before WebSocket upgrade 