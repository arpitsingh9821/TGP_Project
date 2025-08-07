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
  });
});


module.exports = router;
