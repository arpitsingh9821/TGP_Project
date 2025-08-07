import React, { useEffect, useState } from "react";
import { TbLogout } from "react-icons/tb";
import { useAuth } from "../../../../context/authContext.jsx";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const AppcomDash = () => {
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(""); // user name
  const navigate = useNavigate();

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        setName(JSON.parse(userCookie).name || "");
      } catch {
        setName("");
      }
    }
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/upload/submitted", { withCredentials: true })
      .then((res) => {
        setApplications(res.data.applications || []);
      })
      .catch((err) => {
        console.error("Failed to fetch applications:", err.response?.data || err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Approve is not handled here: will happen on detail page.

  return (
    <div className="min-h-screen bg-blue-50 py-8 relative">
      <button
        className="absolute top-4 right-40 px-7 py-2 rounded-full text-white border-green-300 border-2 
          flex items-center text-xl gap-1 bg-gradient-to-r from-green-300 to-green-600 
          hover:border-green-100 hover:scale-110 transition-all duration-500 
          hover:shadow-[0_0_20px_5px_rgba(134,239,172,0.8)]"
        onClick={logout}
      >
        <TbLogout /> Logout
      </button>

      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Appcom Dashboard</h1>

      {loading ? (
        <div className="text-center text-blue-600 text-lg font-semibold">Loading applications...</div>
      ) : (
        <div className="max-w-2xl mx-auto grid gap-6">
          {applications.length === 0 ? (
            <div className="text-gray-500 text-center">No submitted applications found.</div>
          ) : (
            applications.map((app) => (
              <div key={app.uid} className="p-6 rounded-lg shadow bg-white border-l-4 border-blue-300">
                <div className="font-bold text-blue-700 text-xl mb-2">{app.title}</div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-sm font-semibold">
                    {app.status}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-gray-600">UID: {app.uid}</span>
                  <a
                    href={app.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline text-blue-700 hover:text-blue-900"
                  >
                    View PDF
                  </a>
                </div>
                <div className="mt-3 flex gap-6 items-center">
                  <button
                    className="underline text-blue-700 hover:text-blue-900 text-sm"
                    onClick={() => navigate(`/Login/AppcomDash/application/${app.uid}`)}
                  >
                    View Details
                  </button>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Submitted by: {name} <br />
                  Applicant ID: {app.ap_id}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AppcomDash;
