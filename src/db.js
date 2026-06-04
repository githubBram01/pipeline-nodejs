const Database = require('better-sqlite3');
const path = require('path');

let db;

function getDb() {
  if (!db) {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'vehicles.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      vin TEXT UNIQUE,
      mileage INTEGER DEFAULT 0,
      condition TEXT CHECK(condition IN ('excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      evaluator_name TEXT NOT NULL,
      score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 10),
      notes TEXT,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { getDb, closeDb };
