const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'db.sqlite3');
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Run migrations (init tables) if not existing
const initSql = fs.readFileSync(path.join(__dirname, 'migrations', 'init.sql'), 'utf8');
db.exec(initSql);

module.exports = db;