import React from "react";

const SignupAdmin = () => {
  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Admin Signup</h2>
      <form>
        <div className="flex items-center mb-6">
          <label htmlFor="name" className="w-36 text-gray-700 font-semibold">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Name"
            required
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center mb-6">
          <label htmlFor="email" className="w-36 text-gray-700 font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            required
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center mb-8">
          <label htmlFor="password" className="w-36 text-gray-700 font-semibold">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            required
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="px-12 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition"
          >
            Signup
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupAdmin;
