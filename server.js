require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves frontend files

// Database Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: 5432,
});

// API: Get snippet by keyword
app.get('/api/snippet/:keyword', async (req, res) => {
    try {
        const { keyword } = req.params;
        const result = await pool.query(
            'SELECT code_content FROM snippets WHERE trigger_keyword = $1', 
            [keyword]
        );

        if (result.rows.length > 0) {
            res.json({ success: true, code: result.rows[0].code_content });
        } else {
            res.json({ success: false, message: 'Snippet not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// API: Add new snippet (Optional, for easy feeding)
app.post('/api/snippet', async (req, res) => {
    try {
        const { keyword, code } = req.body;
        await pool.query(
            'INSERT INTO snippets (trigger_keyword, code_content) VALUES ($1, $2)', 
            [keyword, code]
        );
        res.json({ success: true, message: 'Snippet added!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/snippet', async (req, res) => {
    try {
        const { keyword, code } = req.body;
        
        // Basic validation
        if (!keyword || !code) {
            return res.status(400).json({ success: false, message: 'Keyword and code are required.' });
        }

        const newSnippet = await pool.query(
            'INSERT INTO snippets (trigger_keyword, code_content) VALUES ($1, $2) RETURNING *',
            [keyword, code]
        );

        res.json({ success: true, message: 'Snippet saved successfully!' });
    } catch (err) {
        // Handle duplicate keyword error (Postgres error code 23505)
        if (err.code === '23505') {
            return res.status(409).json({ success: false, message: 'This keyword already exists!' });
        }
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});