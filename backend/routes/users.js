const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');

const {
  validateUserUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const { protect, authorize, authorizeOwnResource } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), validatePagination, getAllUsers);
router.get('/stats', authorize('admin'), getUserStats);

// Routes for both admin and employee (with own resource protection)
router.get('/:id', validateObjectId, authorizeOwnResource('id'), getUser);
router.put('/:id', validateObjectId, validateUserUpdate, authorizeOwnResource('id'), updateUser);

// Admin only routes
router.delete('/:id', authorize('admin'), validateObjectId, deleteUser);

module.exports = router; 