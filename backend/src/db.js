const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "db.sqlite3");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("SQLite Connection Error:", err.message);
  } else {
    console.log("SQLite Connected:", dbPath);
  }
});

module.exports = db;

