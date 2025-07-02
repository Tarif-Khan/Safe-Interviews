from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import jwt
from typing import Optional, Dict, Any
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY) if SUPABASE_URL and SUPABASE_ANON_KEY else None

# Security scheme
security = HTTPBearer()

class AuthenticatedUser:
    def __init__(self, user_id: str, email: str, user_metadata: Dict[str, Any]):
        self.user_id = user_id
        self.email = email
        self.user_metadata = user_metadata
        self.name = user_metadata.get("name", email.split("@")[0])

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> AuthenticatedUser:
    """Verify Supabase JWT token and return user information"""
    token = credentials.credentials
    
    try:
        if not SUPABASE_JWT_SECRET:
            # For development/testing - skip token verification
            logger.warning("No JWT secret configured - skipping token verification")
            return AuthenticatedUser(
                user_id="test_user",
                email="test@example.com",
                user_metadata={"name": "Test User"}
            )
        
        # Decode and verify JWT token
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        user_metadata = payload.get("user_metadata", {})
        
        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user information"
            )
        
        return AuthenticatedUser(user_id, email, user_metadata)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[AuthenticatedUser]:
    """Get user information if token is provided, otherwise return None"""
    if not credentials:
        return None
    
    try:
        return await verify_token(credentials)
    except HTTPException:
        return None

def require_interviewer_role(user: AuthenticatedUser = Depends(verify_token)) -> AuthenticatedUser:
    """Ensure the user has interviewer role (for now, all authenticated users can be interviewers)"""
    # In a real implementation, you might check user roles from the database
    # For now, any authenticated user can be an interviewer
    return user

def require_candidate_role(user: AuthenticatedUser = Depends(verify_token)) -> AuthenticatedUser:
    """Ensure the user has candidate role (for now, all authenticated users can be candidates)"""
    # In a real implementation, you might check user roles from the database
    # For now, any authenticated user can be a candidate
    return user 