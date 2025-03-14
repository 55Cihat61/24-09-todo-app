const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// PostgreSQL-Datenbankverbindung mit den Umgebungsvariablen
const pool = new Pool({
    user: process.env.DB_USER,         // Benutzername
    host: process.env.DB_HOST,         // Host (localhost)
    database: process.env.DB_NAME,     // Datenbankname
    password: process.env.DB_PASSWORD, // Passwort
    port: process.env.DB_PORT,         // Port (5432)
    ssl: {                             // SSL-Verbindung falls nötig
        rejectUnauthorized: false
    }
});

app.use(cors());                
app.use(bodyParser.json());     


// Alle Items abrufen
app.get('/liste_abrufen', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fehler beim Abrufen der Liste" });
    }
});

// Neues Item hinzufügen
app.post('/add', async (req, res) => {
    try {
        console.log("POST kommt an:", req.body);
        const result = await pool.query('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [req.body.title]);
        res.json(result.rows[0]); // Rückgabe des neuen Eintrags
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fehler beim Hinzufügen des Items" });
    }
});

// Item löschen
app.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: "Item gelöscht" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fehler beim Löschen des Items" });
    }
});

app.listen(3050, "localhost", () => {
    console.log("Server läuft auf Port 3050");
});
