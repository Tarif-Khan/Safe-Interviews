import React from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CollaborativeRoom from '../components/CollaborativeRoom';

function Room() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [searchParams] = useSearchParams();
  const { user, profile, loading } = useAuth();
  
  const role = searchParams.get('role');
  const isInterviewer = role === 'interviewer';

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Validate room code
  if (!roomCode || roomCode.length !== 6) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Invalid Room Code</h1>
          <p className="text-gray-400 mb-6">The room code must be 6 characters long.</p>
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <CollaborativeRoom 
      roomCode={roomCode.toUpperCase()} 
      isInterviewer={isInterviewer}
    />
  );
}

export default Room; 