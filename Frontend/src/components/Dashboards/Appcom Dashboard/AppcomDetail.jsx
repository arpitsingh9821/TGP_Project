import { useParams, useNavigate } from "react-router-dom";
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
      navigate("/Login/AppcomDash"); // Back to dashboard after approval
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to approve application.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!application) return <div>Not found.</div>;

  return (
    <div className="max-w-lg mx-auto my-10 p-6 rounded shadow bg-white border">
      <button className="mb-4 text-blue-600 underline" onClick={() => navigate("/Login/AppcomDash")}>
        ← Back to Dashboard
      </button>

      <h2 className="font-bold text-2xl mb-3">{application.title}</h2>
      <div className="mb-2"><strong>Status:</strong> {application.status}</div>
      <div className="mb-2"><strong>Applicant ID:</strong> {application.ap_id}</div>
      <div className="mb-2">
        <a href={application.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">
          View PDF
        </a>
      </div>

      {application.status === "Submitted" && (
        <button
          className="px-4 py-2 bg-green-600 text-white rounded mt-4"
          onClick={handleApprove}
        >
          Approve
        </button>
      )}
    </div>
  );
};

export default ApplicationDetail;
