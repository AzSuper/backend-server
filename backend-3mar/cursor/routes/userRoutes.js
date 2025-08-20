const express = require('express');
const { registerUser, registerNormalUser, registerAdvertiser, loginUser, loginAsUser, loginAsAdvertiser, getUserById, getUserByEmail, upsertUserProfile, getProfileOverview, upsertUserSettings, getUserSettings } = require('../controllers/userController');
const { authenticateToken, requireSelfOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Registration & Login (generic)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Registration & Login (explicit types for separate apps)
router.post('/register/user', registerNormalUser);
router.post('/register/advertiser', registerAdvertiser);
router.post('/login/user', loginAsUser);
router.post('/login/advertiser', loginAsAdvertiser);


// Define the routes for getting user details
// Specific routes must come before parameterized generic routes to avoid shadowing
router.get('/email/:email', getUserByEmail); // Get user by email (optional)
router.get('/:id', getUserById); // Get user by ID

// Profile APIs (protected; user can only access own profile unless admin)
router.get('/:user_id/profile/overview', authenticateToken, requireSelfOrAdmin('user_id'), getProfileOverview);
router.post('/:user_id/profile', authenticateToken, requireSelfOrAdmin('user_id'), upsertUserProfile);

// Settings APIs (protected; user can only access own settings unless admin)
router.get('/:user_id/settings', authenticateToken, requireSelfOrAdmin('user_id'), getUserSettings);
router.post('/:user_id/settings', authenticateToken, requireSelfOrAdmin('user_id'), upsertUserSettings);

module.exports = router;
