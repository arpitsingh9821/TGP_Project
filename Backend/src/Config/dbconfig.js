require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database connection
const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
  if (err) {
    console.error('❌ Could not connect to database', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

module.exports = db;
