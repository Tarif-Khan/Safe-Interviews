import React from "react";
import { Link } from "react-router-dom";
import Title from "../Title";
import { ArrowRight, UserPlus } from "lucide-react";

function Auth() {
  return (
    <div className="min-h-screen w-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <Title />
      
      <div className="mt-12 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight sm:text-5xl">
          Welcome to Safe Interviews
        </h1>
        <p className="mt-6 text-lg text-gray-300 max-w-2xl">
          The secure platform for live coding interviews.
          <br />
          Choose your path to get started.
        </p>
      </div>

      <div className="mt-10 w-full max-w-md">
        <div className="grid grid-cols-1 gap-6">
          {/* Sign In Option */}
          <Link
            to="/signin"
            className="group bg-gray-800 p-8 rounded-xl border border-transparent hover:border-blue-500 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Sign In</h2>
                <p className="mt-2 text-gray-400">
                  Already have an account? Sign in to continue.
                </p>
              </div>
              <ArrowRight className="h-8 w-8 text-gray-500 group-hover:text-blue-400 transition-colors duration-300" />
            </div>
          </Link>

          {/* Sign Up Option */}
          <Link
            to="/signup"
            className="group bg-gray-800 p-8 rounded-xl border border-transparent hover:border-green-500 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Sign Up</h2>
                <p className="mt-2 text-gray-400">
                  New here? Create your account.
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-gray-500 group-hover:text-green-400 transition-colors duration-300" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Auth; 