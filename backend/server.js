// backend/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Error opening database:', err.message);
  else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  // 1. Applications (Master User List)
  const createApplicationsTable = `
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      usn VARCHAR(20),
      name VARCHAR(100),
      contact VARCHAR(20),
      email VARCHAR(100),
      branch VARCHAR(10),
      year VARCHAR(5),
      section VARCHAR(5),
      type VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 2. Core Team (Linked to specific events)
  const createCoreTable = `
    CREATE TABLE IF NOT EXISTS core_team (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      usn VARCHAR(20),
      name VARCHAR(100),
      contact VARCHAR(20),
      role VARCHAR(20) DEFAULT 'CORE',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3. Volunteers (Linked to specific events)
  const createVolunteersTable = `
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      usn VARCHAR(20),
      name VARCHAR(100),
      contact VARCHAR(20),
      role VARCHAR(20) DEFAULT 'VOLUNTEER',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 4. Events Dictionary
  const createEventsTable = `
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(100),
      date VARCHAR(50),
      location VARCHAR(100),
      description TEXT,
      image_url VARCHAR(255)
    );
  `;

  db.serialize(() => {
    db.run(createMembersTable); // Note: This variable might be legacy, but safe to keep if defined or remove if not used.
    db.run(createApplicationsTable);
    db.run(createCoreTable);
    db.run(createVolunteersTable);
    db.run(createEventsTable);

    // Seed Events (Only if empty)
    db.get("SELECT count(*) as count FROM events", (err, row) => {
      if (row && row.count === 0) {
        console.log("Seeding 6 events...");
        const stmt = db.prepare("INSERT INTO events (title, date, location, description, image_url) VALUES (?, ?, ?, ?, ?)");
        stmt.run("Pokemon Championship", "January 01, 2026", "FET-JU E-Sports Arena", "Gotta catch 'em all!", "/assets/event-food.jpg");
        stmt.run("Decibel - Music Competition", "April 25, 2026", "FET-JU Amphitheatre", "Rock the stage.", "/assets/event-music.jpg");
        stmt.run("Ignite Your Campus Spirit", "May 8, 2026", "FET-JU Grand Auditorium", "Showcase your talent.", "/assets/event-workshop.jpg");
        stmt.run("Style Showdown", "June 25, 2026", "FET-JU Grand Auditorium", "High-fashion duels.", "/assets/event-networking.jpg");
        stmt.run("Tech Innovation Summit 2025", "July 15, 2026", "JAIN University - FET", "Future of technology.", "/assets/event-tech.jpg");
        stmt.run("GRI Inauguration", "August 18, 2026", "FET-JU Convention Center", "Grand opening of GRI.", "/assets/event-sports.jpg");
        stmt.finalize();
      }
    });
    console.log("Database tables initialized.");
  });
}

// Helper to safely run createMembersTable if needed, defining it here just in case
const createMembersTable = `CREATE TABLE IF NOT EXISTS members (usn VARCHAR(20) PRIMARY KEY, name VARCHAR(100), role VARCHAR(20));`;


// --- ROUTES ---

app.post('/api/check-usn', (req, res) => {
  const { usn } = req.body;
  db.get(`SELECT * FROM applications WHERE usn = ? LIMIT 1`, [usn], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row ? { exists: true, name: row.name } : { exists: false });
  });
});

app.post('/api/apply', (req, res) => {
  const { eventId, userType, usn, name, contact, email, branch, year, section } = req.body;

  // New Registration (Saves to 'applications')
  if (userType === 'new') {
    const sql = `INSERT INTO applications (event_id, usn, name, contact, email, branch, year, section, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW')`;
    db.run(sql, [eventId, usn, name, contact, email, branch, year, section], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
  } 
  // Existing Member (Core/Volunteer) -> Copies to specific table
  else {
    db.get("SELECT * FROM applications WHERE usn = ? ORDER BY created_at DESC LIMIT 1", [usn], (err, row) => {
      if (err) return res.status(500).json({ error: "DB Error" });
      if (!row) return res.status(404).json({ error: "User details not found. Please register as New first." });

      const targetTable = (userType === 'core') ? 'core_team' : 'volunteers';
      
      // Save the specific Event ID they are applying for
      const insertSql = `INSERT INTO ${targetTable} (event_id, usn, name, contact) VALUES (?, ?, ?, ?)`;
      
      db.run(insertSql, [eventId, row.usn, row.name, row.contact], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
      });
    });
  }
});

// --- DATA FETCHING ROUTES ---

app.get('/api/events', (req, res) => {
  db.all("SELECT * FROM events", [], (err, rows) => res.json(rows));
});

// 1. Applications: Just User Data (NO JOIN with Events)
app.get('/api/applications', (req, res) => {
  db.all("SELECT * FROM applications ORDER BY created_at DESC", [], (err, rows) => res.json(rows));
});

// 2. Core Team: Show Event Names
app.get('/api/core-team', (req, res) => {
  const sql = `
    SELECT c.*, e.title as event_title 
    FROM core_team c 
    LEFT JOIN events e ON c.event_id = e.id 
    ORDER BY c.joined_at DESC
  `;
  db.all(sql, [], (err, rows) => res.json(rows));
});

// 3. Volunteers: Show Event Names
app.get('/api/volunteers', (req, res) => {
  const sql = `
    SELECT v.*, e.title as event_title 
    FROM volunteers v 
    LEFT JOIN events e ON v.event_id = e.id 
    ORDER BY v.joined_at DESC
  `;
  db.all(sql, [], (err, rows) => res.json(rows));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));