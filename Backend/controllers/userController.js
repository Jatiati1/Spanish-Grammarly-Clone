const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/connect');

/*
* Handles user registration
* - Checks if the email is already registered.
* - Hashes the password.
* - Stores the new user in the database.
* - Returns a JWT token.
*/
const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 9);

    const queryText = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at';
    const values = [username, email, hashedPassword];
    const result = await pool.query(queryText, values);
    const user = result.rows[0];

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Error signing up user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Handles user login.
 * - Validates user credentials.
 * - Returns a JWT token if successful.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const queryText = 'SELECT id, username, email, password, created_at FROM users WHERE email = $1';
    const result = await pool.query(queryText, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
};
