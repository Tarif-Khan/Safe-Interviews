import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Title from "../Title";
import { UserRole } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import RoleSelector from "../components/RoleSelector";

function SignUp() {
  const { user, profile, signUp, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  
  const [role, setRole] = useState<UserRole>(roleParam === 'interviewer' ? UserRole.INTERVIEWER : UserRole.CANDIDATE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const roleDisplayName = role === UserRole.INTERVIEWER ? 'Interviewer' : 'Candidate';
  const loading = authLoading || localLoading;

  // If user is already authenticated, redirect to home
  if (user && profile) {
    // Using a Navigate component is better for redirects
    // For now, let's keep it simple and just show a message or redirect early.
    // This is handled by the router now, so this check is a fallback.
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await signUp(email, password, role, fullName);
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLocalLoading(false);
    }
  };

  if (success) {
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

        {/* Success message */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <Title />
          
          <div className="mt-8 w-full max-w-md">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-green-400 text-6xl mb-4">✓</div>
              <h1 className="text-white text-2xl font-bold mb-4">
                Account Created Successfully!
              </h1>
              <p className="text-gray-300 mb-6">
                Please check your email for a confirmation link to verify your account.
              </p>
              <div className="space-y-4">
                <Link
                  to={`/signin?role=${role.toLowerCase()}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Go to Sign In
                </Link>
                <Link
                  to="/auth"
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Back to Authentication
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Create Your Account
            </h1>
            <p className="text-gray-300 text-center mb-8">
              Join Safe Interviews as a {roleDisplayName}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <RoleSelector role={role} setRole={setRole} loading={loading} />

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

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
                  placeholder="Enter your password (minimum 6 characters)"
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
                    ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800'
                    : 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800'
                } text-white disabled:opacity-50`}
              >
                {loading ? 'Creating Account...' : `Sign Up as ${roleDisplayName}`}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link
                  to={`/signin?role=${role.toLowerCase()}`}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp; 