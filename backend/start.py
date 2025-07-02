#!/usr/bin/env python3
"""
Startup script for Safe Interviews Backend
"""
import os
import uvicorn
from dotenv import load_dotenv

def main():
    # Load environment variables
    load_dotenv()
    
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    print(f"Starting Safe Interviews Backend on {host}:{port}")
    print("Press Ctrl+C to stop the server")
    
    # Run the server
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload for development
        log_level="info"
    )

if __name__ == "__main__":
    main() 