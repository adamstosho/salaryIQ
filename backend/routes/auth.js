const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken
} = require('../controllers/authController');

const {
  validateUserRegistration,
  validateUserLogin
} = require('../middleware/validation');

const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);
router.post('/refresh', protect, refreshToken);

module.exports = router; 