const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const router = express.Router();

// Initialize DB
const db = new sqlite3.Database(path.resolve(__dirname, "../../../database/tgp.db"));

// Multer Config – Save files temporarily to uploads/
const upload = multer({ dest: "uploads/" });

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// 🔐 Auth Middleware
function authenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // Attach user info
    next();
  });
}

// 📤 Upload API
router.post("/upload", authenticate, upload.single("file"), async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (file.size > 200 * 1024) {
    fs.unlinkSync(file.path); // remove oversized file
    return res.status(400).json({ message: "File size exceeds 200KB" });
  }

  try {
    const cloudRes = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });

    fs.unlinkSync(file.path); // remove local file after upload

    db.run(
      `INSERT INTO Applications (title, pdf_url, user_id) VALUES (?, ?, ?)`,
      [title, cloudRes.secure_url, req.user.id],
      function (err) {
        if (err) {
          console.error("DB insert error:", err);
          return res.status(500).json({ message: "Database error" });
        }

        return res.status(201).json({
          message: "Application submitted successfully",
          data: {
            id: this.lastID,
            title,
            pdf_url: cloudRes.secure_url,
            user_id: req.user.id,
          },
        });
      }
    );
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;
