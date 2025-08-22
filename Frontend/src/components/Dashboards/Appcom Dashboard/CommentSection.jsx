import React, { useState, useEffect } from "react";
import axios from "axios";
import { Reply } from "lucide-react";

const CommentSection = ({ applicationId, currentUserId }) => {
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editInput, setEditInput] = useState("");

  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true,
  });

  useEffect(() => {
    if (!applicationId) return;
    const fetchComments = async () => {
      try {
        const { data } = await api.get(`/upload/comments/${applicationId}`);
        setComments(data.comments || []);
      } catch (err) {
        setError("Failed to load comments.");
        console.error("Error fetching comments:", err.response?.data || err.message);
      }
    };
    fetchComments();
  }, [applicationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/upload/comment", {
        application_id: applicationId,
        comment_text: commentInput,
        parent_id: null,
      });
      const { data } = await api.get(`/upload/comments/${applicationId}`);
      setComments(data.comments || []);
      setCommentInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit comment");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditInput(c.comment_text);
  };

  const saveEdit = async (id) => {
    if (!editInput.trim()) return;
    try {
      await api.put(`/upload/comment/${id}`, { comment_text: editInput });
      const { data } = await api.get(`/upload/comments/${applicationId}`);
      setComments(data.comments || []);
      setEditingId(null);
      setEditInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleReplyClick = (c) => {
    alert(`Replying to comment by ${c.user_name || "Anonymous"}`);
  };

  return (
    <div className="max-w-screen-lg mx-auto my-6 p-6 rounded shadow bg-white border">
      <h2 className="text-2xl font-semibold mb-4">Comments</h2>

      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        <textarea
          className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a comment..."
          rows="3"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="self-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Comment"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div className="mt-4 space-y-2">
        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {comments.map((c) => (
              <li
                key={c.id}
                className="relative p-3 border rounded bg-gray-50 flex justify-between items-start"
              >
                <div className="flex-1">
                  {editingId === c.id ? (
                    <>
                      <textarea
                        className="w-full p-2 border rounded"
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                      />
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-400 text-white rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>{c.user_name || "Anonymous"}:</strong> {c.comment_text}
                      <div className="text-xs text-gray-500">
                        {new Date(c.created_at).toLocaleString("en-IN")}
                      </div>
                    </>
                  )}
                </div>

                {/* Reply button, always visible */}
                <div className="mr-4 flex items-center">
                  <button
                    className="flex items-center px-3 py-1 text-sm text-blue-600 hover:underline"
                    onClick={() => handleReplyClick(c)}
                  >
                    <Reply size={14} className="mr-1" /> Reply
                  </button>
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
