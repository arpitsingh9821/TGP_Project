//This file handles 2 things — creating new accounts and logging in
const express = require("express");
/* Express is a tool (library) in Node.js that helps you:
create APIs(communication between frontend & backend) easily
define routes like /login, /signup */
const bcrypt = require("bcrypt"); //encrypts passwords (so they are not stored in plain text
const jwt = require("jsonwebtoken");//creates login tokens (for authentication)
const sqlite3 = require("sqlite3").verbose();//connects to your database
const path = require("path");

const router = express.Router();//it collects all your routes (/signup, /login) and exports them together.
const db = new sqlite3.Database(path.resolve(__dirname, "../../../database/tgp.db"));
/* can be used like this 
const db = require('../Config/dbconfig'); 
*/

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
            if (err) {
                
                return res.status(500).json({ success: false, message: "Database error", err });
            }
 
            if (user) {
                return res.status(400).json({ success: false, message: "User already exists" });
            }
            db.run(
                `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                [name, email, hashedPassword, role],
                function (err) {
                    if (err) return res.status(500).json({ success: false, message: "Insert error", err });

                    const token = jwt.sign({ id: this.lastID, role }, process.env.JWT_SECRET, {
                        expiresIn: "7d",
                    });

                    res.status(201).json({
                        success: true,
                        message: `${role} registered successfully`,
                        token,
                        role,
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Signup error", error });
    }
});

// Login Route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM Users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Database error", err });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: "Incorrect password" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        success: true,
        message: `${user.role} logged in successfully`,
        token,
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Internal server error", error });
    }
  });
});



module.exports = router;
//it makes a router instance defined in one file accessible to other files in your application