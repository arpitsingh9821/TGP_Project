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
      .then(res => setApplication(res.data.application))
      .catch(() => alert("Failed to fetch application details."))
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

  if (loading) return <div>Loading...</div>;
  if (!application) return <div>Not found.</div>;

  return (
    <>
      <div className="max-w-screen-lg mx-auto my-6 p-6 rounded shadow bg-white border">
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-3"
          onClick={() => navigate("/Login/AppcomDash")}
        >
          ← Back to Dashboard
        </button>

        <h2 className="font-bold text-2xl mb-3 mt-4">{application.title}</h2>
        <div className="mb-2"><strong>Status:</strong> {application.status}</div>
        <div className="mb-2"><strong>Applicant ID:</strong> {application.ap_id}</div>

        <div className="mt-6">
          <iframe
            src={application.pdf_url}
            title="Application PDF"
            width="100%"
            height="800px"
            style={{ border: "none" }}
          />
        </div>

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

      {/* ✅ Pass uid to CommentSection */}
      <CommentSection applicationId={uid} />
    </>
  );
};

export default ApplicationDetail;
