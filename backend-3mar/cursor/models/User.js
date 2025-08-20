const { pool } = require('../config/db');

class User {
    static async createUser(name, email, phone, password_hash) {
        const result = await pool.query(
            'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone, password_hash]
        );
        return result.rows[0];
    }

    static async findUserByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async findUserById(id) {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }
}

module.exports = User;
