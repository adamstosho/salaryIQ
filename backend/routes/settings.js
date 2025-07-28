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

router.use(protect);
router.use(authorize('admin'));

router.get('/', getSettings);
router.put('/', validateSettingsUpdate, updateSettings);
router.post('/reset', resetSettings);

router.get('/automation', getAutomationSettings);
router.put('/automation', updateAutomationSettings);

router.get('/stats', getSystemStats);
router.get('/health', getSystemHealth);

module.exports = router; 