import React, { useEffect, useState } from "react";
import { TbLogout, TbFileTypePdf, TbEye } from "react-icons/tb";
import { useAuth } from "../../../../context/authContext.jsx";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const AppcomDash = () => {
  const { logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(""); // user name
  const [searchBy, setSearchBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
        const apps = res.data.applications || [];
        setApplications(apps);
        setFilteredApplications(apps);
      })
      .catch((err) => {
        console.error("Failed to fetch applications:", err.response?.data || err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper function to safely convert to string and search
  const safeStringSearch = (value, query) => {
    if (value == null) return false;
    return String(value).toLowerCase().includes(query);
  };

  // Search and filter functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredApplications(applications);
      return;
    }

    const filtered = applications.filter((app) => {
      const query = searchQuery.toLowerCase();
      
      switch (searchBy) {
        case "uid":
          return safeStringSearch(app.uid, query);
        case "paper_title":
          return safeStringSearch(app.paper_title, query);
        case "conference":
          return safeStringSearch(app.conference_name, query) || 
                 safeStringSearch(app.conference_acronym, query);
        case "author":
          return safeStringSearch(app.author, query);
        case "status":
          return safeStringSearch(app.status, query);
        case "core_ranking":
          return safeStringSearch(app.core_ranking, query);
        case "all":
        default:
          return (
            safeStringSearch(app.uid, query) ||
            safeStringSearch(app.paper_title, query) ||
            safeStringSearch(app.conference_name, query) ||
            safeStringSearch(app.conference_acronym, query) ||
            safeStringSearch(app.author, query) ||
            safeStringSearch(app.status, query) ||
            safeStringSearch(app.core_ranking, query) ||
            safeStringSearch(app.grant_amount_requested, query)
          );
      }
    });

    setFilteredApplications(filtered);
  }, [searchQuery, searchBy, applications]);

  const getStatusBadge = (status) => {
    const statusColors = {
      'submitted': 'bg-blue-100 text-blue-700',
      'under_review': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'pending': 'bg-gray-100 text-gray-700'
    };
    
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-blue-50 py-8 relative">
      <button
        className="absolute top-4 right-4 sm:right-40 px-4 sm:px-7 py-2 rounded-full text-white border-green-300 border-2 
          flex items-center text-sm sm:text-xl gap-1 bg-gradient-to-r from-green-300 to-green-600 
          hover:border-green-100 hover:scale-110 transition-all duration-500 
          hover:shadow-[0_0_20px_5px_rgba(134,239,172,0.8)]"
        onClick={logout}
      >
        <TbLogout className="sm:block" /> 
        <span className="hidden sm:inline">Logout</span>
        <span className="sm:hidden">Exit</span>
      </button>

      <h1 className="text-xl sm:text-3xl font-bold text-center text-blue-700 mb-4 sm:mb-8 px-4">Appcom Dashboard</h1>

      {loading ? (
        <div className="text-center text-blue-600 text-lg font-semibold">Loading applications...</div>
      ) : (
        <div className="max-w-full mx-auto px-2 sm:px-4">
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center w-full">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Search by:</label>
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[140px]"
                >
                  <option value="all">All Fields</option>
                  <option value="uid">UID</option>
                  <option value="paper_title">Paper Title</option>
                  <option value="conference">Conference</option>
                  <option value="author">Author</option>
                  <option value="status">Status</option>
                  <option value="core_ranking">CORE Ranking</option>
                </select>
                
                <div className="flex-1 w-full sm:max-w-md">
                  <input
                    type="text"
                    placeholder={`Search ${searchBy === 'all' ? 'applications' : searchBy.replace('_', ' ')}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {searchQuery && (
              <div className="mt-3 text-sm text-gray-600">
                Found {filteredApplications.length} result{filteredApplications.length !== 1 ? 's' : ''} 
                {searchBy !== 'all' && ` in ${searchBy.replace('_', ' ')}`}
              </div>
            )}
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-gray-500 text-center bg-white p-8 rounded-lg shadow">
              {searchQuery ? 'No applications found matching your search.' : 'No submitted applications found.'}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Mobile responsive notice */}
              <div className="block sm:hidden bg-blue-100 p-3 text-sm text-blue-700 text-center">
                Scroll horizontally to view all columns
              </div>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
                <table className="w-full table-auto min-w-[1200px]">
                  <thead className="bg-blue-700 text-white sticky top-0">
                    <tr>
                      <th className="px-2 sm:px-3 py-3 text-left font-semibold text-xs sm:text-sm whitespace-nowrap">UID</th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm min-w-[200px] sm:min-w-[250px]">Paper Title</th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm min-w-[180px] sm:min-w-[200px]">Conference</th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm min-w-[150px] sm:min-w-[180px]">Author(s)</th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm whitespace-nowrap">Grant Amount</th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm whitespace-nowrap">Conference Dates</th>
                      <th className="px-2 sm:px-3 py-3 text-left font-semibold text-xs sm:text-sm whitespace-nowrap">CORE</th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm whitespace-nowrap">Status</th>
                      <th className="px-3 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm whitespace-nowrap">Submitted</th>
                      <th className="px-2 sm:px-3 py-3 text-center font-semibold text-xs sm:text-sm whitespace-nowrap">PDF</th>
                      <th className="px-3 sm:px-4 py-3 text-center font-semibold text-xs sm:text-sm whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app, index) => (
                      <tr 
                        key={app.uid} 
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <td className="px-3 py-4 text-xs font-mono text-gray-600">
                          {app.uid}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-blue-700 text-sm leading-tight">
                            {app.paper_title}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 leading-tight">{app.conference_name}</div>
                            {app.conference_acronym && (
                              <div className="text-gray-600 text-xs mt-1">({app.conference_acronym})</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          <div className="max-w-[180px] truncate" title={app.author}>
                            {app.author}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-green-700">
                          ₹{Number(app.grant_amount_requested).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {app.start_date && app.end_date ? (
                            <div className="text-xs">
                              <div>{new Date(app.start_date).toLocaleDateString()}</div>
                              <div className="text-gray-500">to {new Date(app.end_date).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Not specified</span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center">
                          {app.core_ranking ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                              {app.core_ranking}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(app.status)}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          <div className="text-xs">
                            {new Date(app.created_at || Date.now()).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(app.created_at || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          {app.paper_pdf_url ? (
                            <a
                              href={app.paper_pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors hover:scale-110"
                              title="View PDF"
                            >
                              <TbFileTypePdf size={18} />
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium"
                            onClick={() => navigate(`/Login/AppcomDash/application/${app.uid}`)}
                            title="View Application Details"
                          >
                            <TbEye size={12} />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Summary Footer */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600">
                  <div>
                    Showing {filteredApplications.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
                    {searchQuery && (
                      <span className="ml-2 text-blue-600">
                        (filtered by: {searchQuery})
                      </span>
                    )}
                  </div>
                  {name && (
                    <div>
                      Welcome, <span className="font-medium text-blue-700">{name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppcomDash;