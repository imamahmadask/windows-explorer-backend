const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Get all root folders
app.get('/api/folders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM folders WHERE parent_id IS NULL');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching root folders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subfolders of a specific folder
app.get('/api/folders/:id/subfolders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM folders WHERE parent_id = ?', [req.params.id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching subfolders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
