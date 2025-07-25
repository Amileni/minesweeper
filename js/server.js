// --- Serveur Express/SQLite pour l'API scores ---
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
// Autoriser CORS pour le front Next.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
const db = new sqlite3.Database(path.join(__dirname, '../../highscores.db'));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../public')));

db.run(`CREATE TABLE IF NOT EXISTS highscores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  score INTEGER
)`);

app.post('/api/highscores', (req, res) => {
  const { name, score } = req.body;
  db.run('INSERT INTO highscores (name, score) VALUES (?, ?)', [name, score], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

app.get('/api/highscores', (req, res) => {
  db.all('SELECT name, score FROM highscores ORDER BY score ASC LIMIT 10', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur Minesweeper lancé sur http://localhost:${PORT}`);
});
