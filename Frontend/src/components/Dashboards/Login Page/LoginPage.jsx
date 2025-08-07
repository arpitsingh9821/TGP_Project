import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../../context/authContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", formData);
      setMessage(res.data.message || "Login successful");

    
      login(res.data.token, res.data.user); 

      
      const role = res.data.role;
      if (role === "applicant") {
  console.log("Navigating to Applicant Dashboard");
  navigate("/Login/AppcntDash");


}
 else if (role === "discomm") {
        navigate("/Login/DiscommDash");
      } else if (role === "admin") {
        navigate("/Login/AdminDash");
      } else if (role === "appcomm") {
        navigate("/Login/AppcomDash");
      } else {
        setMessage("Invalid user role");
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Login failed");
    }
  };
  return (
    <>
      <Link to="/">
        <button className="absolute top-4 left-3 px-7 py-2 rounded-full text-white border-green-300 border-2 
              flex items-center text-xl gap-1 bg-gradient-to-r from-green-300 to-green-600 
              hover:border-green-100 hover:scale-110 transition-all duration-500 
              hover:shadow-[0_0_20px_5px_rgba(134,239,172,0.8)]">
          Back
        </button>
      </Link>

      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Login</h2>

          {message && (
            <div className="mb-4 text-center text-sm font-medium text-red-500">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter email"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter password"
              />
            </div>

            <div className="ml-56 text-left">
              <button
                type="submit"
                className="px-12 py-3 bg-green-600 text-white font-semibold border-green-300 border-2 
                rounded-md shadow-md bg-gradient-to-r from-green-300 to-green-600 
                hover:border-green-100 hover:scale-110 transition-all duration-500 
                hover:shadow-[0_0_20px_5px_rgba(134,239,172,0.8)]">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
