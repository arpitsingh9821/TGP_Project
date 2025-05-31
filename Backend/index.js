require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const db = require('./src/Config/dbconfig');  

const app = express();

app.use(cors()); // ✅ Use CORS before routes
app.use(express.json());

app.use('/api/auth', require('./src/Routes/Auth'));

app.get('/', (req, res) => {
  res.send('TGP Backend API Running');
});

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT)");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
