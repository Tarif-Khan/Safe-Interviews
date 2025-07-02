import React, { useState } from "react";
import { Link } from "react-router-dom";
import Title from "../Title";
import AuthModal from "../components/AuthModal";
import { UserRole } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

function Home() {
  const { user, profile, signOut } = useAuth();
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'signin' | 'signup';
    role: UserRole;
  }>({
    isOpen: false,
    mode: 'signin',
    role: UserRole.CANDIDATE
  });

  const openAuthModal = (mode: 'signin' | 'signup', role: UserRole) => {
    setAuthModal({ isOpen: true, mode, role });
  };

  const closeAuthModal = () => {
    setAuthModal({ ...authModal, isOpen: false });
  };

  // If user is authenticated, show welcome message and sign out option
  if (user && profile) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-900 p-4">
        <Title />
        <div className="mt-8 text-center">
          <p className="text-white text-lg mb-4">
            Welcome back, {profile.full_name || profile.email}!
          </p>
          <p className="text-gray-300 text-md mb-8">
            You are signed in as: <span className="font-semibold capitalize">{profile.role}</span>
          </p>
          
          <div className="space-y-4">
            <Link
              to="/interview"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 mr-4"
            >
              🚀 Start Interview
            </Link>
            
            <button
              onClick={signOut}
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <Title />
      <div className="mt-8 text-center">
        <p className="text-white text-lg mb-8">
          Welcome to Safe Interviews - Practice coding interviews in a safe environment
        </p>
        
        {/* Authentication Buttons Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white text-xl font-semibold mb-6">Choose Your Role</h2>
          
          {/* Sign In Section */}
          <div className="mb-8">
            <h3 className="text-gray-300 text-lg mb-4">Sign In</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => openAuthModal('signin', UserRole.INTERVIEWER)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 border-2 border-blue-600 hover:border-blue-500"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg">👨‍💼</span>
                  <span>Sign In as Interviewer</span>
                </div>
              </button>
              
              <button 
                onClick={() => openAuthModal('signin', UserRole.CANDIDATE)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 border-2 border-green-600 hover:border-green-500"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg">👨‍💻</span>
                  <span>Sign In as Candidate</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Sign Up Section */}
          <div className="mb-8">
            <h3 className="text-gray-300 text-lg mb-4">Sign Up</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => openAuthModal('signup', UserRole.INTERVIEWER)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 border-2 border-purple-600 hover:border-purple-500"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg">👨‍💼</span>
                  <span>Sign Up as Interviewer</span>
                </div>
              </button>
              
              <button 
                onClick={() => openAuthModal('signup', UserRole.CANDIDATE)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 border-2 border-orange-600 hover:border-orange-500"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg">👨‍💻</span>
                  <span>Sign Up as Candidate</span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-600 my-8"></div>
          
          {/* Existing Start Interview Button */}
          <Link
            to="/interview"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            🚀 Start Practice Interview
          </Link>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        role={authModal.role}
      />
    </div>
  );
}

export default Home; 