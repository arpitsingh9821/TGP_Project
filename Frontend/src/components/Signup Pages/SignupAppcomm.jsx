import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


const SignupAppcomm = () => {
   const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:8080/api/auth/signup/appcomm", formData);
    setMessage(res.data.message || "Signup successful");
       
  } catch (error) {
    console.error(error);
    setMessage(error.response?.data?.message || "Signup failed");
  }
};
 return (<>
    <div className="mb-4 text-center text-sm font-medium"> 
      <Link to="/">
      <button className="absolute top-4 left-3 px-7 py-2 rounded-full text-white border-green-300 border-2 
            flex items-center text-xl gap-1 bg-gradient-to-r from-green-300 to-green-600 
            hover:border-green-100 hover:scale-110 transition-all duration-500 
            hover:shadow-[0_0_20px_5px_rgba(134,239,172,0.8)]">Back</button>
    </Link>
    </div>
    <div className="max-w-lg mx-auto mt-20 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">APPCOMM Signup</h2>

      {message && (
  <div className="mb-4 text-center text-sm text-red-600 font-medium">{message}</div>
)}

      <form onSubmit={handleSubmit}>
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
            value={formData.name}
            onChange={handleChange}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
            value={formData.email}
            onChange={handleChange}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
            value={formData.password}
            onChange={handleChange}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* Submit button */}
        <div className="text-center">
          <button
            type="submit"
            className="px-12 py-3 bg-green-600 text-cyan-50 font-semibold rounded-md shadow-md hover:bg-green-500 transition"
          >
            Signup
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default SignupAppcomm;
