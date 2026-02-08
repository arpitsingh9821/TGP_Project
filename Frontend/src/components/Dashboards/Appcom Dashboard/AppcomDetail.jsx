import { useParams, useNavigate } from "react-router-dom";
import CommentSection from "./CommentSection";
import { useState, useEffect } from "react";
import axios from "axios";

const ApplicationDetail = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/upload/application/${uid}`, { withCredentials: true })
      .then(res => {
        console.log("Application data:", res.data.application); // Debug log
        setApplication(res.data.application);
      })
      .catch((err) => {
        console.error("Failed to fetch application details:", err);
        alert("Failed to fetch application details.");
      })
      .finally(() => setLoading(false));
  }, [uid]);

  const handleApprove = async () => {
    if (!window.confirm("Approve this application?")) return;
    try {
      await axios.post(`http://localhost:8080/api/upload/approve/${uid}`, {}, { withCredentials: true });
      alert("Application approved.");
      navigate("/Login/AppcomDash");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to approve application.");
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Reject this application?")) return;
    try {
      await axios.post(`http://localhost:8080/api/upload/reject/${uid}`, {}, { withCredentials: true });
      alert("Application rejected.");
      navigate("/Login/AppcomDash");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reject application.");
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!application) return <div className="text-center p-8">Application not found.</div>;

  return (
    <>
      <div className="max-w-screen-lg mx-auto my-6 p-6 rounded shadow bg-white border">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-3"
          onClick={() => navigate("/Login/AppcomDash")}
        >
          ← Back to Dashboard
        </button>

        {/* Application Header */}
        <div className="mt-6 mb-6">
          <h2 className="font-bold text-2xl mb-3 text-blue-700">{application.paper_title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="mb-2"><strong>Conference:</strong> {application.conference_name}</div>
              {application.conference_acronym && (
                <div className="mb-2"><strong>Acronym:</strong> {application.conference_acronym}</div>
              )}
              {application.core_ranking && (
                <div className="mb-2"><strong>CORE Ranking:</strong> {application.core_ranking}</div>
              )}
            </div>
            
            <div>
              <div className="mb-2"><strong>Author(s):</strong> {application.author}</div>
              <div className="mb-2"><strong>Grant Requested:</strong> ${application.grant_amount_requested}</div>
              <div className="mb-2"><strong>Status:</strong> 
                <span className="ml-2 px-3 py-1 rounded bg-blue-100 text-blue-700 text-sm font-semibold">
                  {application.status}
                </span>
              </div>
            </div>
          </div>

          {application.start_date && application.end_date && (
            <div className="mb-2"><strong>Conference Dates:</strong> {application.start_date} to {application.end_date}</div>
          )}

          {application.justification && (
            <div className="mb-4">
              <strong>Justification:</strong>
              <div className="mt-1 p-3 bg-gray-50 rounded border text-gray-700">
                {application.justification}
              </div>
            </div>
          )}

          <div className="text-gray-500 text-sm">
            <strong>Applicant ID:</strong> {application.ap_id} | 
            <strong> UID:</strong> {application.uid} |
            <strong> Submitted:</strong> {new Date(application.created_at || Date.now()).toLocaleDateString()}
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">Application Document</h3>
          {application.paper_pdf_url ? (
            <div className="border rounded">
              <iframe
                src={application.paper_pdf_url}
                title="Application PDF"
                width="100%"
                height="600px"
                style={{ border: "none" }}
                onError={() => console.error("PDF failed to load")}
              />
              <div className="p-2 bg-gray-50 text-center">
                <a
                  href={application.paper_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Open PDF in new tab
                </a>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center p-4 border rounded">
              No PDF available
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {application.status === "Submitted" && (
          <div className="mt-4 flex gap-3">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleApprove}
            >
              Approve
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleReject}
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <CommentSection applicationId={uid} />
    </>
  );
};

export default ApplicationDetail;