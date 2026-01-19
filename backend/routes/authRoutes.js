const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Will create this next

// POST /auth/signup - Create a new user
router.post('/signup', authController.signup);

// POST /auth/login - Login user
router.post('/login', authController.login);

// GET /auth/me - Get current user info
router.get('/me', authController.getMe);

module.exports = router;
