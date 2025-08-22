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
  const { title } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (file.size > 200 * 1024) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ message: "File size exceeds 200KB" });
  }

  try {
    const cloudRes = await cloudinary.uploader.upload(file.path, { resource_type: "auto" });
    fs.unlinkSync(file.path);

    db.run(
      `INSERT INTO Applications (ap_id, title, status, pdf_url) VALUES (?, ?, ?, ?)`,
      [req.user.id, title, 'Submitted', cloudRes.secure_url],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Database error", detail: err.message });
        }
        return res.status(201).json({
          message: "Application submitted successfully",
          data: {
            uid: this.lastID,
            ap_id: req.user.id,
            title,
            status: 'Submitted',
            pdf_url: cloudRes.secure_url
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

// Fetch comments for an application
router.get('/comments/:applicationId', authenticate, (req, res) => {
  const { applicationId } = req.params;

  const query = `
    SELECT c.id, c.comment_text, c.created_at, u.name AS user_name
    FROM AppComments c
    LEFT JOIN Users u ON c.user_id = u.id
    WHERE c.application_id = ?
    ORDER BY c.created_at DESC
  `;

  db.all(query, [applicationId], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Failed to fetch comments", detail: err.message });
    }
    const comments = rows.map(row => ({
      ...row,
      created_at: row.created_at.replace(' ', 'T') + 'Z' 
    }));
    res.json({ comments });
  });
});

// Add a comment
router.post('/comment', authenticate, (req, res) => {
  const { application_id, parent_id, comment_text } = req.body;
  const user_id = req.user.id; // user from JWT

  if (!application_id || !comment_text) {
    return res.status(400).json({ message: "application_id and comment_text are required" });
  }

  const query = `
    INSERT INTO AppComments (application_id, user_id, parent_id, comment_text)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [application_id, user_id, parent_id || null, comment_text], function(err) {
    if (err) {
      return res.status(500).json({ message: "Failed to add comment", detail: err.message });
    }

    // Return the inserted comment so React can update instantly
    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: this.lastID,
        application_id,
        user_id,
        parent_id: parent_id || null,
        comment_text,
        created_at: new Date().toISOString(),
        user_name: req.user.name || "Anonymous"
      }
    });
  });
});

module.exports = router;
