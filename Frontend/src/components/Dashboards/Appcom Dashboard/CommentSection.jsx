import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Reply } from "lucide-react";

const CommentSection = ({ applicationId, currentUserId }) => {
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const api = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true,
  });

  // Organize comments into parent-child structure - memoized to prevent recreations
  const organizeComments = useCallback((commentsList) => {
    if (!commentsList || commentsList.length === 0) return [];
    
    const commentMap = {};
    const rootComments = [];

    // First pass: create a map of all comments
    commentsList.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Second pass: organize into parent-child structure
    commentsList.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        // This is a reply
        commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
      } else if (!comment.parent_id) {
        // This is a root comment
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  }, []);

  const fetchComments = useCallback(async () => {
    if (!applicationId) return;
    
    try {
      const { data } = await api.get(`/upload/comments/${applicationId}`);
      setComments(organizeComments(data.comments || []));
    } catch (err) {
      setError("Failed to load comments.");
      console.error("Error fetching comments:", err.response?.data || err.message);
    }
  }, [applicationId, organizeComments, api]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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
      await fetchComments();
      setCommentInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit comment");
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = useCallback(async (e, parentId) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    
    setSubmittingReply(true);
    setError("");
    
    try {
      await api.post("/upload/comment", {
        application_id: applicationId,
        comment_text: replyInput,
        parent_id: parentId,
      });
      
      // Clear reply state
      setReplyInput("");
      setReplyingTo(null);
      
      // Refresh comments
      await fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit reply");
    } finally {
      setSubmittingReply(false);
    }
  }, [applicationId, api, replyInput, fetchComments]);

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditInput(c.comment_text);
  };

  const saveEdit = async (id) => {
    if (!editInput.trim()) return;
    try {
      await api.put(`/upload/comment/${id}`, { comment_text: editInput });
      await fetchComments();
      setEditingId(null);
      setEditInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleReplyClick = useCallback((comment) => {
    if (replyingTo === comment.id) {
      setReplyingTo(null);
      setReplyInput("");
    } else {
      setReplyingTo(comment.id);
      setReplyInput("");
    }
  }, [replyingTo]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Component to render individual comment with replies
  const CommentItem = ({ comment, isReply = false }) => (
    <li className={`relative p-3 border rounded ${isReply ? 'ml-8 bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {editingId === comment.id ? (
            <div>
              <label htmlFor={`edit-textarea-${comment.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                Edit your comment
              </label>
              <textarea
                id={`edit-textarea-${comment.id}`}
                name={`edit-comment-${comment.id}`}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                autoFocus
                rows={3}
                aria-describedby={`edit-help-${comment.id}`}
              />
              <p id={`edit-help-${comment.id}`} className="text-xs text-gray-500 mt-1">
                Press Escape to cancel or click Cancel button
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => saveEdit(comment.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                  aria-describedby={`save-help-${comment.id}`}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong className="text-gray-800">{comment.user_name || "Anonymous"}:</strong>
                  <span className="ml-2 text-gray-700">{comment.comment_text}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(comment.created_at)}
                {comment.replies && comment.replies.length > 0 && (
                  <span className="ml-3 text-blue-600">
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reply button - only show for root comments */}
        {!isReply && (
          <div className="ml-4 flex items-center">
            <button
              type="button"
              className={`flex items-center px-3 py-1 text-sm rounded transition-colors focus:ring-2 focus:ring-blue-500 ${
                replyingTo === comment.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              onClick={() => handleReplyClick(comment)}
              aria-expanded={replyingTo === comment.id}
              aria-controls={replyingTo === comment.id ? `reply-form-${comment.id}` : undefined}
            >
              <Reply size={14} className="mr-1" aria-hidden="true" />
              {replyingTo === comment.id ? 'Cancel Reply' : 'Reply'}
            </button>
          </div>
        )}
      </div>

      {/* Reply form */}
      {replyingTo === comment.id && (
        <div id={`reply-form-${comment.id}`} className="mt-3 p-3 bg-white border rounded">
          <form onSubmit={(e) => handleReplySubmit(e, comment.id)}>
            <label htmlFor={`reply-textarea-${comment.id}`} className="block text-sm font-medium text-gray-700 mb-2">
              Reply to {comment.user_name || "Anonymous"}
            </label>
            <textarea
              id={`reply-textarea-${comment.id}`}
              name={`reply-text-${comment.id}`}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Write your reply to ${comment.user_name || "Anonymous"}...`}
              rows={3}
              value={replyInputs[comment.id] || ""}
              onChange={(e) => handleReplyInputChange(comment.id, e.target.value)}
              disabled={submittingReply}
              autoFocus
              aria-describedby={`reply-help-${comment.id}`}
            />
            <p id={`reply-help-${comment.id}`} className="text-xs text-gray-500 mt-1">
              Your reply will be posted publicly. Press Escape to cancel.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
                disabled={submittingReply || !(replyInputs[comment.id] || "").trim()}
              >
                {submittingReply ? "Posting Reply..." : "Post Reply"}
              </button>
              <button
                type="button"
                onClick={() => handleCancelReply(comment.id)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <ul className="mt-3 space-y-2" role="list" aria-label="Replies">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <div className="max-w-screen-lg mx-auto my-6 p-6 rounded shadow bg-white border">
      <h2 className="text-2xl font-semibold mb-4">
        Comments {comments.length > 0 && `(${comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)})`}
      </h2>

      {/* Main comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col space-y-4">
          <label htmlFor="main-comment-textarea" className="block text-sm font-medium text-gray-700">
            Add a comment
          </label>
          <textarea
            id="main-comment-textarea"
            name="main-comment-text"
            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your thoughts about this application..."
            rows={4}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            disabled={loading}
            aria-describedby="main-comment-help"
            required
          />
          <p id="main-comment-help" className="text-xs text-gray-500">
            Your comment will be posted publicly and visible to all users.
          </p>
          <button
            type="submit"
            className="self-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500"
            disabled={loading || !commentInput.trim()}
          >
            {loading ? "Submitting Comment..." : "Submit Comment"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Comments list */}
      <div>
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No comments yet.</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <ul className="space-y-4" role="list" aria-label="Comments">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CommentSection;