// backend/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Allow GH Pages frontend to talk to backend
app.use(cors({
  origin: ['https://Nitin-Thakur-00.github.io'], // <-- your GH Pages URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Enable Foreign Key Constraints in SQLite (must be set per connection)
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Error opening database:', err.message);
  else {
    console.log('Connected to the SQLite database.');
    // CRITICAL: Enable foreign key enforcement
    db.run("PRAGMA foreign_keys = ON;");
    initializeDatabase();
  }
});

function initializeDatabase() {
  // 1. Events Dictionary (Master Table)
  const createEventsTable = `
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(100) UNIQUE NOT NULL, 
      date VARCHAR(50),
      location VARCHAR(100),
      description TEXT,
      image_url VARCHAR(255)
    );
  `;

  // 2. Applications (Master User List / Transaction Log)
  const createApplicationsTable = `
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      usn VARCHAR(20) NOT NULL,
      name VARCHAR(100) NOT NULL,
      contact VARCHAR(20),
      email VARCHAR(100),
      branch VARCHAR(10),
      year VARCHAR(5),
      section VARCHAR(5),
      type VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- CONSTRAINT: A user can only register as a 'NEW' participant ONCE per event
      UNIQUE (usn, event_id), 
      -- FOREIGN KEY: Ensures event_id refers to a valid row in the events table
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `;

  // 3. Core Team (Staff Roster)
  const createCoreTable = `
    CREATE TABLE IF NOT EXISTS core_team (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      usn VARCHAR(20) NOT NULL,
      name VARCHAR(100) NOT NULL,
      contact VARCHAR(20),
      role VARCHAR(20) DEFAULT 'CORE',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- CONSTRAINT: A Core member can only apply for one role ONCE per event
      UNIQUE (usn, event_id), 
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `;

  // 4. Volunteers (Staff Roster)
  const createVolunteersTable = `
    CREATE TABLE IF NOT EXISTS volunteers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      usn VARCHAR(20) NOT NULL,
      name VARCHAR(100) NOT NULL,
      contact VARCHAR(20),
      role VARCHAR(20) DEFAULT 'VOLUNTEER',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- CONSTRAINT: A Volunteer can only apply for one role ONCE per event
      UNIQUE (usn, event_id), 
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    );
  `;

  // Legacy/Helper table (not strictly needed but kept for completeness)
  const createMembersTable = `CREATE TABLE IF NOT EXISTS members (usn VARCHAR(20) PRIMARY KEY, name VARCHAR(100), role VARCHAR(20));`;


  db.serialize(() => {
    db.run(createMembersTable);
    db.run(createEventsTable); // Note: Events table must be created before applications/staff
    db.run(createApplicationsTable);
    db.run(createCoreTable);
    db.run(createVolunteersTable);
    
    // Seed Events
    db.get("SELECT count(*) as count FROM events", (err, row) => {
      if (row && row.count === 0) {
        console.log("Seeding 6 events...");
        const stmt = db.prepare("INSERT INTO events (title, date, location, description, image_url) VALUES (?, ?, ?, ?, ?)");
        
        stmt.run("Pokemon Championship", "January 01, 2026", "FET-JU E-Sports Arena", "Gotta catch 'em all! Battle, trade, and prove yourself as the ultimate Pokemon Master on campus.", "/assets/event-food.jpg");
        stmt.run("Decibel - Music Competition", "April 25, 2026", "FET-JU Amphitheatre", "Rock the stage. Solo or band - electrify the crowd and compete for the title of Musical Champion.", "/assets/event-music.jpg");
        stmt.run("Rhythmic Fusion - Dance Battle", "May 8, 2026", "FET-JU Grand Auditorium", "Own the stage. Show your moves and battle for glory in the most explosive dance competition of the year.", "/assets/event-workshop.jpg");
        stmt.run("Canvas - Modeling Showcase", "June 25, 2026", "FET-JU Main Hall", "Walk with attitude. Showcase your style and confidence in our high-fashion runway competition.", "/assets/event-networking.jpg");
        stmt.run("Tech Innovation Summit 2025", "July 15, 2026", "JAIN University - FET", "Code | Build | Disrupt. Join the brightest minds for a deep dive into AI, Web3, and tech's next big revolution.", "/assets/event-tech.jpg");
        stmt.run("GRI Inauguration", "August 18, 2026", "FET-JU Convention Center", "The future starts here. Be part of the grand opening of our groundbreaking GRI initiative.", "/assets/event-sports.jpg");
        stmt.finalize();
      }
    });
    console.log("Database tables initialized.");
  });
}

// ... (API routes remain the same, relying on these new constraints)
// ... (omitted for brevity, but all routes are kept here)

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

  // Ensure eventId is treated as a number
  const eId = parseInt(eventId);

  // New Registration (Saves to 'applications')
  if (userType === 'new') {
    const sql = `INSERT INTO applications (event_id, usn, name, contact, email, branch, year, section, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW')`;
    db.run(sql, [eId, usn, name, contact, email, branch, year, section], function(err) {
      // Handle the unique constraint violation for duplicate new registration
      if (err && err.message.includes('UNIQUE constraint failed')) {
         return res.status(409).json({ error: "You have already registered for this event." });
      }
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
      
      const insertSql = `INSERT INTO ${targetTable} (event_id, usn, name, contact) VALUES (?, ?, ?, ?)`;
      
      db.run(insertSql, [eId, row.usn, row.name, row.contact], function(err) {
         // Handle the unique constraint violation for duplicate staff application
         if (err && err.message.includes('UNIQUE constraint failed')) {
           return res.status(409).json({ error: `You have already applied for a role in this event.` });
         }
         if (err) return res.status(500).json({ error: err.message });
        
        console.log(`Saved ${row.name} to ${targetTable}`);
        res.json({ success: true, id: this.lastID });
      });
    });
  }
});

// --- DATA FETCHING ROUTES ---

app.get('/api/events', (req, res) => {
  db.all("SELECT * FROM events", [], (err, rows) => res.json(rows));
});

app.get('/api/applications', (req, res) => {
  db.all("SELECT * FROM applications ORDER BY created_at DESC", [], (err, rows) => res.json(rows));
});

app.get('/api/core-team', (req, res) => {
  const sql = `
    SELECT c.*, e.title as event_title 
    FROM core_team c 
    LEFT JOIN events e ON c.event_id = e.id 
    ORDER BY c.joined_at DESC
  `;
  db.all(sql, [], (err, rows) => res.json(rows));
});

app.get('/api/volunteers', (req, res) => {
  const sql = `
    SELECT v.*, e.title as event_title 
    FROM volunteers v 
    LEFT JOIN events e ON v.event_id = e.id 
    ORDER BY v.joined_at DESC
  `;
  db.all(sql, [], (err, rows) => res.json(rows));
});

app.get('/api/events/:eventId/applications', (req, res) => {
  db.all(`SELECT * FROM applications WHERE event_id = ? ORDER BY created_at DESC`, [req.params.eventId], (err, rows) => res.json(rows));
});

// Serve frontend build
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));