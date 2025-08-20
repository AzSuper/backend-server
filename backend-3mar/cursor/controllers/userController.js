const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

// User Registration (generic - defaults to role "user")
exports.registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;

    // Basic validation to avoid hashing undefined and to provide clear feedback
    if (!name || !email || !phone || !password || typeof password !== 'string') {
        return res.status(400).json({
            error: 'Missing or invalid required fields',
            required_fields: ['name', 'email', 'phone', 'password']
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        // Log the error for diagnostics
        logger.error(`User registration failed: code=${error && error.code} detail=${error && (error.detail || error.message)}`);
        // Unique violation (e.g., duplicate email)
        if (error && error.code === '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'User registration failed' });
    }
};

// User Registration: explicit normal user
exports.registerNormalUser = async (req, res) => {
    return exports.registerUser(req, res);
};

// User Registration: explicit advertiser
exports.registerAdvertiser = async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password || typeof password !== 'string') {
        return res.status(400).json({
            error: 'Missing or invalid required fields',
            required_fields: ['name', 'email', 'phone', 'password']
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, 'advertiser') RETURNING *",
            [name, email, phone, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        logger.error(`User registration failed: code=${error && error.code} detail=${error && (error.detail || error.message)}`);
        if (error && error.code === '23505') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'User registration failed' });
    }
};

// User Authentication
// User Authentication
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            // Generate JWT
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

// Login as normal user only
exports.loginAsUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        if (!(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (user.role !== 'user') {
            return res.status(403).json({ error: 'Account is not a normal user' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

// Login as advertiser only (admins allowed)
exports.loginAsAdvertiser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        if (!(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        if (!['advertiser', 'admin'].includes(user.role)) {
            return res.status(403).json({ error: 'Account is not an advertiser' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};
// Get user by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
};

// Get user by email (optional)
exports.getUserByEmail = async (req, res) => {
    const { email } = req.params;

    try {
        const result = await pool.query('SELECT id, name, email, phone, role, created_at FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
};

// Create or update user profile
exports.upsertUserProfile = async (req, res) => {
    const userId = parseInt(req.params.user_id);
    const { display_name, avatar_url, bio, website, company_name, location, social_links, metadata } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO user_profiles (user_id, display_name, avatar_url, bio, website, company_name, location, social_links, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb)
            ON CONFLICT (user_id) DO UPDATE SET
                display_name = EXCLUDED.display_name,
                avatar_url = EXCLUDED.avatar_url,
                bio = EXCLUDED.bio,
                website = EXCLUDED.website,
                company_name = EXCLUDED.company_name,
                location = EXCLUDED.location,
                social_links = EXCLUDED.social_links,
                metadata = EXCLUDED.metadata,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [userId, display_name, avatar_url, bio, website, company_name, location, social_links || null, metadata || null]);

        res.status(200).json({ profile: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upsert profile' });
    }
};

// Get profile overview (uses view)
exports.getProfileOverview = async (req, res) => {
    const userId = parseInt(req.params.user_id);
    try {
        const result = await pool.query('SELECT * FROM v_user_profile_overview WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile overview' });
    }
};

// Upsert user settings
exports.upsertUserSettings = async (req, res) => {
    const userId = parseInt(req.params.user_id);
    const { notifications_email, notifications_push, language, timezone, profile_visibility, marketing_opt_in } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO user_settings (user_id, notifications_email, notifications_push, language, timezone, profile_visibility, marketing_opt_in)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (user_id) DO UPDATE SET
                notifications_email = EXCLUDED.notifications_email,
                notifications_push = EXCLUDED.notifications_push,
                language = EXCLUDED.language,
                timezone = EXCLUDED.timezone,
                profile_visibility = EXCLUDED.profile_visibility,
                marketing_opt_in = EXCLUDED.marketing_opt_in,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `, [userId, notifications_email, notifications_push, language, timezone, profile_visibility, marketing_opt_in]);
        res.json({ settings: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upsert settings' });
    }
};

// Get user settings
exports.getUserSettings = async (req, res) => {
    const userId = parseInt(req.params.user_id);
    try {
        const result = await pool.query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Settings not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};
