const pool = require('../db/connect');
const bcrypt = require('bcrypt');

/**
 * Handles updating user settings
 * - Updates user's language preference.
 * - Updates user's appearance settings (theme: light or dark mode).
 * - Updates user's personal information (email, name, password).
 * - Optimized to construct SQL queries dynamically based on provided fields.
 */
const updateSettings = async (req, res) => {
    const { userId, language, theme, email, name, password } = req.body;

    try {
        let queryText = 'UPDATE users SET ';
        const queryValues = [];
        let updateFields = [];

        // Dynamically build the update query based on provided fields
        if (language) {
            queryValues.push(language);
            updateFields.push(`language = $${queryValues.length}`);
        }

        if (theme) {
            queryValues.push(theme);
            updateFields.push(`theme = $${queryValues.length}`);
        }

        if (email) {
            queryValues.push(email);
            updateFields.push(`email = $${queryValues.length}`);
        }

        if (name) {
            queryValues.push(name);
            updateFields.push(`name = $${queryValues.length}`);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 9);
            queryValues.push(hashedPassword);
            updateFields.push(`password = $${queryValues.length}`);
        }

        if (updateFields.length > 0) {
            queryText += updateFields.join(', ');
            queryText += `, updated_at = NOW() WHERE id = $${queryValues.length + 1} RETURNING id, language, theme, email, name`;
            queryValues.push(userId);

            const result = await pool.query(queryText, queryValues);
            res.status(200).json({
                message: 'Settings updated successfully',
                settings: result.rows[0],
            });
        } else {
            res.status(400).json({ error: 'No valid fields provided for update' });
        }
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Retrieves the user's current settings
 * - Returns the user's language, appearance settings, and personal information.
 * - Optimized to return only necessary data.
 */
const getUserSettings = async (req, res) => {
    const { userId } = req.params;

    try {
        const queryText = 'SELECT id, language, theme, email, name FROM users WHERE id = $1';
        const result = await pool.query(queryText, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            settings: result.rows[0],
        });
    } catch (err) {
        console.error('Error retrieving settings:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    updateSettings,
    getUserSettings,
};
