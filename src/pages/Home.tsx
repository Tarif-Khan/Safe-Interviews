import React from "react";
import { Link } from "react-router-dom";
import Title from "../Title";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  const { user, profile, signOut, loading } = useAuth();

  // If user is authenticated, show welcome message and sign out option
  if (user && (profile || !loading)) {
    return (
      <div className="min-h-screen w-screen bg-gray-900 relative">
        {/* Top right sign out button for authenticated users */}
        <div className="absolute top-4 right-4">
          <button
            onClick={signOut}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>

        {/* Main content centered */}
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Title />
          <div className="mt-8 text-center">
            <p className="text-white text-lg mb-4">
              Welcome back, {profile?.full_name || profile?.email || user.email}!
            </p>
            <p className="text-gray-300 text-md mb-8">
              You are signed in as: <span className="font-semibold capitalize">{profile?.role || 'User'}</span>
            </p>
            
            <Link
              to="/interview"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              🚀 Start Interview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 relative">
      {/* Main content centered */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Title />
        <div className="mt-8 text-center">
          <p className="text-white text-lg mb-8">
            Welcome to Safe Interviews - Practice coding interviews in a safe environment
          </p>
          
          <p className="text-gray-300 text-md mb-8">
            Sign in or sign up to get started with personalized interview sessions
          </p>
          
          {/* Practice Interview Button */}
          <Link
            to="/interview"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mb-6"
          >
            🚀 Start Practice Interview
          </Link>
          
          {/* Link to dedicated auth page */}
          <div className="mt-6">
            <Link
              to="/auth"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Sign In / Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 