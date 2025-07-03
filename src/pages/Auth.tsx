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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Sign In Section */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-white text-xl font-semibold mb-6 text-center">
                Sign In
              </h2>
              <p className="text-gray-300 text-center mb-6">
                Already have an account? Sign in to continue
              </p>
              <div className="space-y-12">
                <Link 
                  to="/signin?role=interviewer"
                  className="block w-full backdrop-blur-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold py-4 px-6 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-300 text-center mb-8"
                  style={{ WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold mb-1 drop-shadow">Interviewer</span>
                    <span className="text-sm opacity-90 drop-shadow">Conduct interviews and evaluate candidates</span>
                  </div>
                </Link>
                <Link 
                  to="/signin?role=candidate"
                  className="block w-full backdrop-blur-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold py-4 px-6 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-green-300 text-center"
                  style={{ WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold mb-1 drop-shadow">Candidate</span>
                    <span className="text-sm opacity-90 drop-shadow">Practice and take interview sessions</span>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Sign Up Section */}
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
              <h2 className="text-white text-xl font-semibold mb-6 text-center">
                Sign Up
              </h2>
              <p className="text-gray-300 text-center mb-6">
                New to Safe Interviews? Create your account
              </p>
              <div className="space-y-12">
                <Link 
                  to="/signup?role=interviewer"
                  className="block w-full backdrop-blur-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold py-4 px-6 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300 text-center mb-8"
                  style={{ WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold mb-1 drop-shadow">Interviewer</span>
                    <span className="text-sm opacity-90 drop-shadow">Create account to conduct interviews</span>
                  </div>
                </Link>
                
                <Link 
                  to="/signup?role=candidate"
                  className="block w-full backdrop-blur-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold py-4 px-6 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-300 text-center"
                  style={{ WebkitBackdropFilter: 'blur(16px)', backdropFilter: 'blur(16px)' }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold mb-1 drop-shadow">Candidate</span>
                    <span className="text-sm opacity-90 drop-shadow">Create account to practice interviews</span>
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