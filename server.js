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

// Create a new folder
app.post('/api/folders', async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const [result] = await pool.query('INSERT INTO folders (name, parent_id) VALUES (?, ?)', [name, parent_id]);
    const [newFolder] = await pool.query('SELECT * FROM folders WHERE id = ?', [result.insertId]);
    res.status(201).json(newFolder[0]);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a folder
app.put('/api/folders/:id', async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query('UPDATE folders SET name = ? WHERE id = ?', [name, req.params.id]);
    const [updatedFolder] = await pool.query('SELECT * FROM folders WHERE id = ?', [req.params.id]);
    res.json(updatedFolder[0]);
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a folder
app.delete('/api/folders/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM folders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
