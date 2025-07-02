import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import patch
from app import app
from auth import AuthenticatedUser

# Test client
client = TestClient(app)

# Mock authenticated user
mock_user = AuthenticatedUser(
    user_id="test_user_123",
    email="test@example.com", 
    user_metadata={"name": "Test User"}
)

@pytest.fixture
def auth_headers():
    """Mock authentication headers"""
    return {"Authorization": "Bearer mock_token"}

def mock_verify_token():
    """Mock token verification to return test user"""
    return mock_user

class TestRoomManagement:
    
    @patch('app.require_interviewer_role', return_value=mock_user)
    def test_create_room(self, mock_auth):
        """Test creating a new interview room"""
        response = client.post(
            "/api/create-room",
            json={},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "room_code" in data
        assert len(data["room_code"]) == 6
    
    @patch('app.require_candidate_role', return_value=mock_user)
    @patch('app.require_interviewer_role', return_value=mock_user)
    def test_join_room(self, mock_interviewer, mock_candidate):
        """Test joining an existing room"""
        # First create a room
        create_response = client.post(
            "/api/create-room",
            json={},
            headers={"Authorization": "Bearer mock_token"}
        )
        room_code = create_response.json()["room_code"]
        
        # Then join the room
        join_response = client.post(
            "/api/join-room",
            json={"room_code": room_code},
            headers={"Authorization": "Bearer mock_token"}
        )
        
        assert join_response.status_code == 200
        data = join_response.json()
        assert data["status"] == "success"
        assert data["room_code"] == room_code
        assert "room_info" in data
    
    def test_join_nonexistent_room(self):
        """Test joining a room that doesn't exist"""
        with patch('app.require_candidate_role', return_value=mock_user):
            response = client.post(
                "/api/join-room",
                json={"room_code": "INVALID"},
                headers={"Authorization": "Bearer mock_token"}
            )
        
        assert response.status_code == 404
        assert "Room not found" in response.json()["detail"]
    
    @patch('app.require_interviewer_role', return_value=mock_user)
    def test_get_room_info(self, mock_auth):
        """Test getting room information"""
        # Create a room
        create_response = client.post(
            "/api/create-room",
            json={},
            headers={"Authorization": "Bearer mock_token"}
        )
        room_code = create_response.json()["room_code"]
        
        # Get room info
        response = client.get(f"/api/room/{room_code}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["room_code"] == room_code
        assert "interviewer" in data
        assert data["status"] == "waiting_for_candidate"

class TestHealthCheck:
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/api/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "active_rooms" in data
        assert "active_connections" in data

class TestAuthentication:
    
    def test_create_room_without_auth(self):
        """Test that creating room requires authentication"""
        response = client.post("/api/create-room", json={})
        assert response.status_code == 403  # No auth header
    
    def test_join_room_without_auth(self):
        """Test that joining room requires authentication"""
        response = client.post("/api/join-room", json={"room_code": "TEST12"})
        assert response.status_code == 403  # No auth header

if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 