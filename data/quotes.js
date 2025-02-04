const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("data/quotes.db");
db.exec("PRAGMA foreign_keys = ON");

module.exports = db;
