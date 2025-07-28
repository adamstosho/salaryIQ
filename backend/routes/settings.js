const express = require('express');
const router = express.Router();

const {
  getSettings,
  updateSettings,
  getSystemStats,
  resetSettings,
  getSystemHealth,
  getAutomationSettings,
  updateAutomationSettings
} = require('../controllers/settingsController');

const {
  validateSettingsUpdate
} = require('../middleware/validation');

const { protect, authorize } = require('../middleware/auth');

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

// Settings management
router.get('/', getSettings);
router.put('/', validateSettingsUpdate, updateSettings);
router.post('/reset', resetSettings);

// Automation settings
router.get('/automation', getAutomationSettings);
router.put('/automation', updateAutomationSettings);

// System statistics and health
router.get('/stats', getSystemStats);
router.get('/health', getSystemHealth);

module.exports = router; 