import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { roomAPI } from '../lib/api';
import Title from '../Title';
import { UserRole } from '../lib/supabase';

function JoinRoom() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is a candidate
  const isCandidate = profile?.role === UserRole.CANDIDATE;

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) return;
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await roomAPI.joinRoom(roomCode.trim().toUpperCase());
      // Successfully joined room, navigate to it
      navigate(`/room/${roomCode.trim().toUpperCase()}?role=candidate`);
    } catch (error) {
      console.error('Failed to join room:', error);
      setError(error instanceof Error ? error.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setRoomCode(value);
    if (error) setError(null); // Clear error when user starts typing
  };

  // Redirect if not authenticated
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Please sign in to join a room</p>
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

  // Show error if not a candidate
  if (!isCandidate) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Only candidates can join rooms</p>
          <p className="text-gray-400 mb-6">Your current role: {profile.role}</p>
          <div className="space-x-4">
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Go Home
            </Link>
            {profile.role === UserRole.INTERVIEWER && (
              <Link
                to="/create-room"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Create Room Instead
              </Link>
            )}
          </div>
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
          <h1 className="text-white text-3xl font-bold mb-6">Join Interview Room</h1>
          <p className="text-gray-300 text-lg mb-8">
            Enter the 6-digit room code provided by your interviewer
          </p>

          <div className="bg-gray-800 rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-white text-xl font-semibold mb-4">Candidate Information</h2>
              <div className="bg-gray-700 rounded p-4 text-left">
                <p className="text-white font-medium">Name</p>
                <p className="text-gray-300">{profile.full_name || profile.email}</p>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div>
                <label htmlFor="roomCode" className="block text-white text-lg font-medium mb-4">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={handleRoomCodeChange}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-gray-700 border border-gray-600 text-white text-center text-2xl font-mono font-bold py-4 px-6 rounded-lg focus:outline-none focus:border-blue-500 tracking-wider"
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-gray-400 text-sm mt-2">
                  Example: ABC123
                </p>
              </div>

              {error && (
                <div className="bg-red-600 text-white p-3 rounded-lg">
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || roomCode.length !== 6}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Joining Room...
                  </span>
                ) : (
                  'Join Room'
                )}
              </button>
            </form>

            <div className="mt-8 bg-blue-600 text-white p-4 rounded-lg">
              <h3 className="font-semibold mb-2">💡 What to Expect</h3>
              <ul className="text-sm text-left list-disc list-inside space-y-1">
                <li>Real-time collaborative coding environment</li>
                <li>Multiple programming languages supported</li>
                <li>Live cursor tracking with your interviewer</li>
                <li>Secure, private interview session</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom; 