import React from "react";
import { Link, Navigate } from "react-router-dom";
import Title from "../Title";
import { UserRole } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

function Auth() {
  const { user, profile } = useAuth();

  // If user is already authenticated, redirect to home
  if (user && profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 flex flex-col">
      {/* Header with back link */}
      <div className="p-4">
        <Link
          to="/"
          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Title />
        
        <div className="mt-8 max-w-4xl mx-auto">
          <h1 className="text-white text-2xl font-bold text-center mb-8">
            Choose Your Authentication Method
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sign In Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-6 text-center">
                Sign In
              </h2>
              <p className="text-gray-300 text-center mb-6">
                Already have an account? Sign in to continue
              </p>
              
              <div className="space-y-4">
                <Link 
                  to="/signin?role=interviewer"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 border-2 border-blue-600 hover:border-blue-500 text-center"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold mb-1">Interviewer</span>
                    <span className="text-sm opacity-90">Conduct interviews and evaluate candidates</span>
                  </div>
                </Link>
                
                <Link 
                  to="/signin?role=candidate"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 border-2 border-green-600 hover:border-green-500 text-center"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold mb-1">Candidate</span>
                    <span className="text-sm opacity-90">Practice and take interview sessions</span>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Sign Up Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-white text-xl font-semibold mb-6 text-center">
                Sign Up
              </h2>
              <p className="text-gray-300 text-center mb-6">
                New to Safe Interviews? Create your account
              </p>
              
              <div className="space-y-4">
                <Link 
                  to="/signup?role=interviewer"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 border-2 border-purple-600 hover:border-purple-500 text-center"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold mb-1">Interviewer</span>
                    <span className="text-sm opacity-90">Create account to conduct interviews</span>
                  </div>
                </Link>
                
                <Link 
                  to="/signup?role=candidate"
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 border-2 border-orange-600 hover:border-orange-500 text-center"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold mb-1">Candidate</span>
                    <span className="text-sm opacity-90">Create account to practice interviews</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Safe Interviews provides a secure environment for coding interview practice
            </p>
            <div className="mt-4">
              <Link
                to="/interview"
                className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
              >
                Try a practice interview without signing up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth; 