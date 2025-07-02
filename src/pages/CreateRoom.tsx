import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { roomAPI } from '../lib/api';
import Title from '../Title';
import { UserRole } from '../lib/supabase';

function CreateRoom() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  // Check if user is an interviewer
  const isInterviewer = profile?.role === UserRole.INTERVIEWER;

  const handleCreateRoom = async () => {
    if (!user || !profile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await roomAPI.createRoom();
      setRoomCode(result.room_code);
    } catch (error) {
      console.error('Failed to create room:', error);
      setError(error instanceof Error ? error.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomCode) {
      navigate(`/room/${roomCode}?role=interviewer`);
    }
  };

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      alert('Room code copied to clipboard!');
    }
  };

  // Redirect if not authenticated
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Please sign in to create a room</p>
          <Link
            to="/auth"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Show error if not an interviewer
  if (!isInterviewer) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Only interviewers can create rooms</p>
          <p className="text-gray-400 mb-6">Your current role: {profile.role}</p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto text-center">
        <Title />
        
        <div className="mt-8">
          <h1 className="text-white text-3xl font-bold mb-6">Create Interview Room</h1>
          <p className="text-gray-300 text-lg mb-8">
            Create a secure room for conducting coding interviews with real-time collaboration
          </p>

          {!roomCode ? (
            /* Room creation */
            <div className="bg-gray-800 rounded-lg p-8">
              <div className="mb-6">
                <h2 className="text-white text-xl font-semibold mb-4">Room Details</h2>
                <div className="text-left space-y-3">
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-white font-medium">Interviewer</p>
                    <p className="text-gray-300">{profile.full_name || profile.email}</p>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-white font-medium">Features</p>
                    <ul className="text-gray-300 text-sm list-disc list-inside">
                      <li>Real-time collaborative code editor</li>
                      <li>Multiple programming languages supported</li>
                      <li>Secure 6-digit room code</li>
                      <li>Live cursor sharing</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-600 text-white p-3 rounded mb-4">
                  <p>{error}</p>
                </div>
              )}

              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Room...
                  </span>
                ) : (
                  'Create Room'
                )}
              </button>
            </div>
          ) : (
            /* Room created successfully */
            <div className="bg-gray-800 rounded-lg p-8">
              <div className="mb-6">
                <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
                  <h2 className="text-xl font-bold mb-2">🎉 Room Created Successfully!</h2>
                  <p>Your interview room is ready for collaboration</p>
                </div>

                <div className="bg-gray-700 rounded-lg p-6 mb-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Room Code</h3>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="bg-blue-600 text-white text-3xl font-mono font-bold py-4 px-8 rounded-lg tracking-wider">
                      {roomCode}
                    </div>
                    <button
                      onClick={copyRoomCode}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-600 text-white p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-2">📋 Share with Candidate</h3>
                  <p className="text-sm">
                    Share this room code with your candidate. They can join using the "Join Room" option.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleJoinRoom}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                >
                  Enter Room
                </button>
                
                <div>
                  <button
                    onClick={() => {
                      setRoomCode(null);
                      setError(null);
                    }}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Create Another Room
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateRoom; 