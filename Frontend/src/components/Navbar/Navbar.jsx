import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSignupClick = (role) => {
    setShowDropdown(false);
    navigate(`/signup/${role.toLowerCase()}`);
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-blue-600">
      
       <span className="hidden md:block text-black font-special">Travel Grants Portal</span>
<span className="block md:hidden text-black font-special">TGP</span>

      </div>

      <div className="relative space-x-4">
        <button
          onClick={toggleDropdown}
          className="px-4 py-2 bg-green-400 text-white rounded-lg hover:bg-green-500 transition"
        >
          Sign Up
        </button>

        {showDropdown && (
          <div className="absolute right-24 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
            {["Applicant", "Appcomm", "Discomm", "Admin"].map((role) => (
              <button
                key={role}
                className="block w-full text-left px-4 py-2 hover:bg-green-100"
                onClick={() => handleSignupClick(role)}
              >
                {role}
              </button>
            ))}
          </div>
        )}

        <Link to="/Login"><button className="px-4 py-2 border border-green-500 text-green-500 rounded-lg hover:bg-blue-100 transition">
          Login
        </button></Link>
      </div>
    </nav>
  );
};

export default Navbar;
