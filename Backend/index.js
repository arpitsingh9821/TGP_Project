require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const cookieParser = require('cookie-parser');
const db = require('./src/Config/dbconfig');  

const app = express();

app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());


app.use('/api/auth', require('./src/Routes/Auth'));
app.use('/api/upload', require('./src/Routes/uploadRoute')); 


app.get('/', (req, res) => {
  res.send('TGP Backend API Running');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
