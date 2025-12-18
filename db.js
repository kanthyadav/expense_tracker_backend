const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "kantyadav18",
  database: "expense_tracker"
});

db.connect((err) => {
  if (err) {
    console.log("DB error");
    return;
  }
  console.log("MySQL connected");
});

module.exports = db;
