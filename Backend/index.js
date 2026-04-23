console.log("🚀 THIS INDEX.JS IS RUNNING");
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors'); //Allows React (port 5173) to talk to backend (port 8080)
const cookieParser = require('cookie-parser');//Reads cookies from requests (needed for JWT token)
const db = require('./src/Config/dbconfig');  //Connects to SQLite database //not used here 

const app = express();

app.use(cookieParser());
// Without this, req.cookies.userToken in your authenticate function would always be undefined.
//  Must be registered before your routes.

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api/auth', require('./src/Routes/Auth'));
app.use('/api/upload', require('./src/Routes/uploadRoute'));


app.get('/', (req, res) => {
  res.send('TGP Backend API Running');
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
