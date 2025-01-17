const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require ('dotenv').config();

const app = express();
app.use(express.json());

// Configure PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// JWT Secret Key
const JWT_SECRET = ''; 
// Signup Route
app.post('/auth/signup', async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const result = await pool.query(
      'INSERT INTO users (fullName, email, password) VALUES ($1, $2, $3) RETURNING id, fullName, email',
      [fullName, email, hashedPassword]
    );

    res.status(201).json({ message: 'User created', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login Route
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Get Current User Route
app.get('/auth/user', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
