const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const router = express.Router();
const db = new sqlite3.Database(path.resolve(__dirname, "../../../database/tgp.db"));

// Signup Route
router.post("/signup/:role", async (req, res) => {
    const { name, email, password } = req.body;
    const role = req.params.role.toLowerCase();

    const allowedRoles = ["applicant", "appcomm", "discomm", "admin"];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, user) => {
            if (err) return res.status(500).json({ success: false, message: "Database error", err });

            if (user) {
                return res.status(400).json({ success: false, message: "User already exists" });
            }

            db.run(
                `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                [name, email, hashedPassword, role],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: "Insert error", err });

                    const token = jwt.sign({ id: this.lastID, role }, process.env.JWT_SECRET, {
                        expiresIn: "1h",
                    });

                    res.status(201).json({
                        success: true,
                        message: `${role} registered successfully`,
                        token,
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Signup error", error });
    }
});

// Login Route
router.post("/login/:role", (req, res) => {
    const { email, password } = req.body;
    const role = req.params.role.toLowerCase();

    db.get(`SELECT * FROM Users WHERE email = ? AND role = ?`, [email, role], async (err, user) => {
        if (err) return res.status(500).json({ success: false, message: "Database error", err });

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({
            success: true,
            message: `${role} logged in successfully`,
            token,
        });
    });
});

module.exports = router;
