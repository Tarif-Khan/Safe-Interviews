import React, { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Title from "../Title";
import { UserRole } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

function SignIn() {
  const { user, profile, signIn } = useAuth();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const role = roleParam === 'interviewer' ? UserRole.INTERVIEWER : UserRole.CANDIDATE;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleDisplayName = role === UserRole.INTERVIEWER ? 'Interviewer' : 'Candidate';

  // If user is already authenticated, redirect to home
  if (user && profile) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        setError(result.error.message);
      } else {
        // Success - will be automatically redirected by the Navigate above
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-900 flex flex-col">
      {/* Header with back link */}
      <div className="p-4">
        <Link
          to="/auth"
          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
        >
          ← Back to Authentication
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Title />
        
        <div className="mt-8 w-full max-w-md">
          <div className="bg-gray-800 rounded-lg p-8">
            <h1 className="text-white text-2xl font-bold text-center mb-2">
              Sign In as {roleDisplayName}
            </h1>
            <p className="text-gray-300 text-center mb-8">
              {role === UserRole.INTERVIEWER 
                ? "Access your interviewer dashboard" 
                : "Continue your interview practice"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                  role === UserRole.INTERVIEWER
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800'
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-green-800'
                } text-white disabled:opacity-50`}
              >
                {loading ? 'Signing In...' : `Sign In as ${roleDisplayName}`}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link
                  to={`/signup?role=${role.toLowerCase()}`}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/auth"
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors duration-200"
              >
                Choose a different role
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn; 