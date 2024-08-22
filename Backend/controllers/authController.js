const bcrypt  = requrire('bcrypt');
const jwt = require ('jsonwebtoken');
const pool = require ('../db/connect');


/*
* Handles user registration
* - Checl if the email is already registred.
* - Hashes the password.
* - Stores the new user in the database.
* - Returns a JWT token.
*/

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0 ) {
      return res.status(400).json({ error: 'Email already exist'});
    }

    const hashedPassword = await bcrypt.hash(password, 9);

    const queryText = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at';
    const values = [username, email, hashedPassword];
    const result = await pool.query(queryText, values);
    const user = result.rows[0];

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      messgae: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at:

      }
    })
  }
}