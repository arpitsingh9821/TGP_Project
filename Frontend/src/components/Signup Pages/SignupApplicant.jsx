import React from "react";

const SignupApplicant = () => {
  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Applicant Signup</h2>
      <form>
        {/* Name row */}
        <div className="flex items-center mb-6">
          <label htmlFor="name" className="w-36 text-gray-700 font-semibold">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            required
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email row */}
        <div className="flex items-center mb-6">
          <label htmlFor="email" className="w-36 text-gray-700 font-semibold">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password row */}
        <div className="flex items-center mb-8">
          <label htmlFor="password" className="w-36 text-gray-700 font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            required
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit button */}
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

export default SignupApplicant;
