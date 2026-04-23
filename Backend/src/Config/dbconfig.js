require('dotenv').config();  //dotenv is library and config read the file ".env"
const sqlite3 = require('sqlite3').verbose();
//require('sqlite3') import the package sqlite3 
//.verbose() means if something goes wrong, it shows detailed error messages with file name and line 

const db = new sqlite3.Database(process.env.DB_PATH , (err)=>{
//process.env = a special object that holds all environment variables
//second arg (err) runs immediately after connection refused 
if(err){
  console.error("could nto connect to database" , err.message);
  }
else{
  console.log("connected to SQLite database ");
  //log → normal messages
  //error → problems (often shown in red 🚨)
    }
});

module.exports=db
//make available outside this file 
/*
In Node.js, every file is a separate module.

👉 So:
Variables in one file ❌ are NOT automatically available in another file
You must export them to share
*/