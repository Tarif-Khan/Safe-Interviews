import React from "react";
import { Link } from "react-router-dom";
import Title from "../Title";

function Home() {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <Title />
      <div className="mt-8 text-center">
        <p className="text-white text-lg mb-6">
          Welcome to Safe Interviews - Practice coding interviews in a safe environment
        </p>
        <Link
          to="/interview"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Start Interview
        </Link>
      </div>
    </div>
  );
}

export default Home; 