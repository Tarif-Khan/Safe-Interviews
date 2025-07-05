import React from 'react';
import { UserRole } from '../lib/supabase';

interface RoleSelectorProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  loading?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ role, setRole, loading }) => {
  const inactiveClasses = "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600";
  const activeClasses = {
    [UserRole.INTERVIEWER]: "border-blue-500 bg-blue-600 text-white",
    [UserRole.CANDIDATE]: "border-green-500 bg-green-600 text-white"
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        I am a...
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={loading}
          onClick={() => setRole(UserRole.INTERVIEWER)}
          className={`w-full text-center font-semibold py-3 px-4 rounded-lg border-2 transition-colors duration-200 disabled:opacity-50 ${
            role === UserRole.INTERVIEWER ? activeClasses[UserRole.INTERVIEWER] : inactiveClasses
          }`}
        >
          Interviewer
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => setRole(UserRole.CANDIDATE)}
          className={`w-full text-center font-semibold py-3 px-4 rounded-lg border-2 transition-colors duration-200 disabled:opacity-50 ${
            role === UserRole.CANDIDATE ? activeClasses[UserRole.CANDIDATE] : inactiveClasses
          }`}
        >
          Candidate
        </button>
      </div>
    </div>
  );
};

export default RoleSelector; 