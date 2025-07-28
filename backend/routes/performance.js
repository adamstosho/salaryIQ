const express = require('express');
const router = express.Router();

const {
  getPerformanceRecords,
  getPerformanceRecord,
  createPerformanceRecord,
  updatePerformanceRecord,
  deletePerformanceRecord,
  approvePerformanceRecord,
  getPerformanceStats
} = require('../controllers/performanceController');

const {
  validatePerformanceCreate,
  validatePerformanceUpdate,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Get all performance records (admin sees all, employee sees own)
router.get('/', validatePagination, getPerformanceRecords);

// Get performance statistics
router.get('/stats', getPerformanceStats);

// CRUD operations for performance records
router.post('/', validatePerformanceCreate, createPerformanceRecord);
router.get('/:id', validateObjectId, getPerformanceRecord);
router.put('/:id', validateObjectId, validatePerformanceUpdate, updatePerformanceRecord);
router.delete('/:id', validateObjectId, deletePerformanceRecord);

// Admin only routes
router.put('/:id/approve', authorize('admin'), validateObjectId, approvePerformanceRecord);

module.exports = router; 