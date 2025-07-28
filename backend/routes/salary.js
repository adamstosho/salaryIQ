const express = require('express');
const router = express.Router();

const {
  calculateSalary,
  getMySalaryHistory,
  getAllSalaryHistory,
  getSalaryStats,
  getSalaryBreakdown,
  updateSalaryStatus,
  bulkUpdateSalaryStatus,
  approvePerformanceForSalary,
  getPendingPerformanceRecords
} = require('../controllers/salaryController');

const {
  validateSalaryCalculation,
  validatePagination,
  validateSalaryStatusUpdate,
  validateBulkSalaryStatusUpdate,
  validatePerformanceApproval,
  validatePeriodQuery
} = require('../middleware/validation');

const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Employee routes
router.get('/me', validatePagination, getMySalaryHistory);

// Admin only routes
router.post('/calculate', authorize('admin'), validateSalaryCalculation, calculateSalary);
router.get('/all', authorize('admin'), validatePagination, getAllSalaryHistory);
router.get('/stats', authorize('admin'), getSalaryStats);
router.put('/:id/status', authorize('admin'), validateSalaryStatusUpdate, updateSalaryStatus);
router.put('/bulk-status', authorize('admin'), validateBulkSalaryStatusUpdate, bulkUpdateSalaryStatus);
router.put('/approve-performance', authorize('admin'), validatePerformanceApproval, approvePerformanceForSalary);
router.get('/pending-performance', authorize('admin'), validatePeriodQuery, getPendingPerformanceRecords);

// Routes for both admin and employee
router.get('/breakdown/:period', getSalaryBreakdown);

module.exports = router; 