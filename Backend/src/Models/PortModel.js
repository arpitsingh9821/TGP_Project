// routes/users.js
const express = require('express');
const checkRole = require('../Middleware/Checkrole');
const router = express.Router();

// For Applicants
router.get('/applicant/dashboard', checkRole(['Applicant']), (req, res) => {
  res.send('Welcome to the Applicant Dashboard');
});

// For ApComm users
router.get('/apcomm/dashboard', checkRole(['ApComm']), (req, res) => {
  res.send('Welcome to the ApComm Dashboard');
});

// For DisComm users
router.get('/discomm/dashboard', checkRole(['DisComm']), (req, res) => {
  res.send('Welcome to the DisComm Dashboard');
});

// For Admin users
router.get('/admin/dashboard', checkRole(['Admin']), (req, res) => {
  res.send('Welcome to the Admin Dashboard');
});

module.exports = router;
