const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();

const db = new sqlite3.Database(path.resolve(__dirname, "../../../database/tgp.db"));

const upload = multer({ dest: "uploads/" });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

function authenticate(req, res, next) {
  const token = req.cookies.userToken;
  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// Upload application
router.post("/upload", authenticate, upload.single("file"), async (req, res) => {
  const { 
    conferenceName,
    conferenceAcronym, 
    coreRanking,
    startDate,
    endDate,
    paperTitle,
    author,
    grantAmountRequested,
    justification
  } = req.body;
  
  const file = req.file;

  // Validation
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!conferenceName || !paperTitle || !author || !grantAmountRequested || !justification || !startDate || !endDate) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (file.size > 200 * 1024) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ message: "File size exceeds 200KB" });
  }

  try {
    const cloudRes = await cloudinary.uploader.upload(file.path, { resource_type: "auto" });
    fs.unlinkSync(file.path);

    // Insert with all the form fields
    db.run(
      `INSERT INTO Applications (
        ap_id,
        conference_name, 
        conference_acronym, 
        core_ranking, 
        start_date, 
        end_date, 
        paper_title, 
        author, 
        grant_amount_requested, 
        justification, 
        paper_pdf_url, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, 
        conferenceName, 
        conferenceAcronym || null, 
        coreRanking || null, 
        startDate, 
        endDate, 
        paperTitle, 
        author, 
        parseFloat(grantAmountRequested), 
        justification, 
        cloudRes.secure_url, 
        'Submitted'
      ],
      function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error", detail: err.message });
        }
        
        return res.status(201).json({
          message: "Application submitted successfully",
          data: {
            uid: this.lastID,
            ap_id: req.user.id,
            conference_name: conferenceName,
            conference_acronym: conferenceAcronym,
            core_ranking: coreRanking,
            start_date: startDate,
            end_date: endDate,
            paper_title: paperTitle,
            author: author,
            grant_amount_requested: parseFloat(grantAmountRequested),
            justification: justification,
            paper_pdf_url: cloudRes.secure_url,
            status: 'Submitted'
          }
        });
      }
    );
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// Fetch all submitted applications
router.get('/submitted', authenticate, (req, res) => {
  db.all(
    `SELECT * FROM Applications WHERE status = 'Submitted' ORDER BY uid DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error", detail: err.message });
      }
      res.json({ applications: rows });
    }
  );
});

// Fetch all approved applications
router.get('/approved', authenticate, (req, res) => {
  db.all(
    `SELECT * FROM Applications WHERE status = 'Approved' ORDER BY uid DESC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Database error", detail: err.message });
      }
      res.json({ applications: rows });
    }
  );
});

// Approve application by uid
router.post('/approve/:uid', authenticate, (req, res) => {
  const uid = req.params.uid;
  db.run(
    `UPDATE Applications SET status = 'Approved' WHERE uid = ?`,
    [uid],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Approval failed", detail: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json({ message: "Application approved" });
    }
  );
});

// Fetch application by UID
router.get('/application/:uid', authenticate, (req, res) => {
  const uid = req.params.uid;
  db.get(`SELECT * FROM Applications WHERE uid = ?`, [uid], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', detail: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ application: row });
    console.log("Application details fetched successfully");
    console.log(row); 
  });
});

// Reject application by uid
router.post('/reject/:uid', authenticate, (req, res) => {
  const uid = req.params.uid;
  db.run(
    `UPDATE Applications SET status = 'Rejected' WHERE uid = ?`,
    [uid],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Rejection failed", detail: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json({ message: "Application rejected" });
    }
  );
});

// Fetch comments for an application (improved to handle replies better)
router.get('/comments/:applicationId', authenticate, (req, res) => {
  const { applicationId } = req.params;

  const query = `
    SELECT c.id, c.application_id, c.user_id, c.parent_id, c.comment_text, c.created_at, u.name AS user_name
    FROM AppComments c
    LEFT JOIN Users u ON c.user_id = u.id
    WHERE c.application_id = ?
    ORDER BY 
      CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END ASC,
      c.parent_id ASC,
      c.created_at ASC
  `;

  db.all(query, [applicationId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch comments", detail: err.message });
    }
    
    // Format timestamps properly
    const comments = rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at).toISOString()
    }));
    
    res.json({ comments });
  });
});

// Add a comment or reply (improved)
router.post('/comment', authenticate, (req, res) => {
  const { application_id, parent_id, comment_text } = req.body;
  const user_id = req.user.id;

  if (!application_id || !comment_text) {
    return res.status(400).json({ message: "application_id and comment_text are required" });
  }

  // Validate that the application exists
  db.get('SELECT uid FROM Applications WHERE uid = ?', [application_id], (err, app) => {
    if (err) {
      return res.status(500).json({ message: "Database error", detail: err.message });
    }
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    // If parent_id is provided, validate that the parent comment exists
    if (parent_id) {
      db.get('SELECT id FROM AppComments WHERE id = ? AND application_id = ?', [parent_id, application_id], (err, parentComment) => {
        if (err) {
          return res.status(500).json({ message: "Database error", detail: err.message });
        }
        if (!parentComment) {
          return res.status(404).json({ message: "Parent comment not found" });
        }
        insertComment();
      });
    } else {
      insertComment();
    }

    function insertComment() {
      const query = `
        INSERT INTO AppComments (application_id, user_id, parent_id, comment_text, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `;

      db.run(query, [application_id, user_id, parent_id || null, comment_text], function(err) {
        if (err) {
          return res.status(500).json({ message: "Failed to add comment", detail: err.message });
        }

        // Fetch the inserted comment with user name for immediate display
        db.get(
          `SELECT c.id, c.application_id, c.user_id, c.parent_id, c.comment_text, c.created_at, u.name AS user_name
           FROM AppComments c
           LEFT JOIN Users u ON c.user_id = u.id
           WHERE c.id = ?`,
          [this.lastID],
          (err, row) => {
            if (err) {
              return res.status(500).json({ message: "Failed to fetch inserted comment", detail: err.message });
            }

            res.status(201).json({
              message: parent_id ? 'Reply added successfully' : 'Comment added successfully',
              comment: {
                ...row,
                created_at: new Date(row.created_at).toISOString()
              }
            });
          }
        );
      });
    }
  });
});

// Get comment count for an application
router.get('/comments/count/:applicationId', authenticate, (req, res) => {
  const { applicationId } = req.params;

  db.get(
    'SELECT COUNT(*) as count FROM AppComments WHERE application_id = ?',
    [applicationId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Failed to get comment count", detail: err.message });
      }
      res.json({ count: row.count });
    }
  );
});

// Update/Edit a comment
router.put('/comment/:commentId', authenticate, (req, res) => {
  const { commentId } = req.params;
  const { comment_text } = req.body;
  const userId = req.user.id;

  if (!comment_text || !comment_text.trim()) {
    return res.status(400).json({ message: "comment_text is required" });
  }

  // First check if the comment belongs to the user
  db.get('SELECT user_id FROM AppComments WHERE id = ?', [commentId], (err, comment) => {
    if (err) {
      return res.status(500).json({ message: "Database error", detail: err.message });
    }
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.user_id !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    // Update the comment
    db.run(
      'UPDATE AppComments SET comment_text = ? WHERE id = ?',
      [comment_text.trim(), commentId],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Failed to update comment", detail: err.message });
        }
        res.json({ message: "Comment updated successfully" });
      }
    );
  });
});

// Delete a comment (bonus feature - only comment owner or admin can delete)
router.delete('/comment/:commentId', authenticate, (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  // First check if the comment belongs to the user
  db.get('SELECT user_id FROM AppComments WHERE id = ?', [commentId], (err, comment) => {
    if (err) {
      return res.status(500).json({ message: "Database error", detail: err.message });
    }
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.user_id !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Delete the comment and its replies
    db.run('DELETE FROM AppComments WHERE id = ? OR parent_id = ?', [commentId, commentId], function(err) {
      if (err) {
        return res.status(500).json({ message: "Failed to delete comment", detail: err.message });
      }
      res.json({ message: "Comment deleted successfully", deletedCount: this.changes });
    });
  });
});

module.exports = router;