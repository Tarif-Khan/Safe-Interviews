# Frontend-Backend Integration Guide

This guide explains how to integrate your React frontend with the Python FastAPI backend for collaborative coding interviews.

## Setup Instructions

### 1. Backend Setup

First, set up the Python backend:

```bash
cd backend
python setup.py
# Edit .env with your Supabase configuration
python start.py
```

The backend will run on `http://localhost:8000`

### 2. Frontend Environment Configuration

Add the backend API URL to your frontend environment variables. Create or update your `.env` file in the project root:

```bash
# Supabase Configuration (existing)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API Configuration (new)
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start Frontend

```bash
npm run dev
```

## How It Works

### Authentication Flow
1. Users sign in using your existing Supabase authentication
2. JWT tokens are automatically passed to the backend for API calls
3. Backend verifies tokens and manages room permissions

### Interview Flow

**For Interviewers:**
1. Sign in with interviewer role
2. Navigate to "Create Interview Room"
3. Get a 6-digit room code (e.g., "ABC123")
4. Share code with candidate
5. Enter the collaborative room

**For Candidates:**
1. Sign in with candidate role  
2. Navigate to "Join Interview Room"
3. Enter the 6-digit code from interviewer
4. Join the collaborative room

### Real-time Collaboration
- Both users see live code changes
- Cursor positions are shared in real-time
- Multiple programming languages supported
- Secure WebSocket connections

## API Integration

The frontend now calls these backend endpoints:

- `POST /api/create-room` - Create interview room
- `POST /api/join-room` - Join existing room
- `GET /api/room/{code}` - Get room information
- `WS /ws/{code}` - WebSocket for real-time collaboration

## File Structure

```
src/
├── lib/
│   └── api.ts                 # Backend API integration
├── components/
│   └── CollaborativeRoom.tsx  # Real-time collaboration
├── pages/
│   ├── CreateRoom.tsx         # Create interview room
│   ├── JoinRoom.tsx          # Join interview room
│   └── Room.tsx              # Collaborative room host
└── ...
```

## Features Added

✅ **Room Management**: Create and join rooms with 6-digit codes
✅ **Real-time Collaboration**: Live code editing via WebSocket
✅ **Authentication Integration**: Uses existing Supabase auth
✅ **Role-based Access**: Interviewers create, candidates join
✅ **Multi-language Support**: Python, Java, C++, C
✅ **Live Cursor Sharing**: See where others are editing
✅ **Connection Status**: Visual feedback for WebSocket state

## Development

### Testing the Integration

1. Start backend: `cd backend && python start.py`
2. Start frontend: `npm run dev`
3. Sign up as interviewer and candidate (different emails)
4. Test creating and joining rooms
5. Test real-time collaboration

### Troubleshooting

**Backend not connecting:**
- Check `VITE_API_BASE_URL` is set correctly
- Ensure backend is running on port 8000
- Check CORS configuration in backend

**Authentication errors:**
- Verify Supabase configuration in backend `.env`
- Check JWT token format in browser dev tools
- Ensure user profiles exist in Supabase

**WebSocket issues:**
- Check browser console for connection errors
- Verify room exists before connecting
- Test with multiple browser tabs/windows

## Production Deployment

For production deployment:

1. **Backend**: Deploy to cloud service (AWS, GCP, Heroku)
2. **Frontend**: Update `VITE_API_BASE_URL` to production URL
3. **WebSocket**: Ensure WSS (secure WebSocket) support
4. **Database**: Replace in-memory storage with persistent database

## Security Notes

- All API endpoints require authentication
- Room codes are cryptographically secure
- WebSocket connections are validated
- User roles are enforced at the backend level 