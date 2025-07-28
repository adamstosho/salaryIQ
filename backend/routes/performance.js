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

router.use(protect);

router.get('/', validatePagination, getPerformanceRecords);
router.get('/stats', getPerformanceStats);

router.post('/', validatePerformanceCreate, createPerformanceRecord);
router.get('/:id', validateObjectId, getPerformanceRecord);
router.put('/:id', validateObjectId, validatePerformanceUpdate, updatePerformanceRecord);
router.delete('/:id', validateObjectId, deletePerformanceRecord);

router.put('/:id/approve', authorize('admin'), validateObjectId, approvePerformanceRecord);

module.exports = router; 