const Settings = require('../models/Settings');
const User = require('../models/User');
const Performance = require('../models/Performance');
const SalaryHistory = require('../models/SalaryHistory');


const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    
    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      message: 'Error fetching settings',
      error: error.message
    });
  }
};


const updateSettings = async (req, res) => {
  try {
    const { salaryMultiplier } = req.body;
    
    const settings = await Settings.getInstance();
    
    if (salaryMultiplier !== undefined) {
      settings.salaryMultiplier = salaryMultiplier;
    }
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      message: 'Error updating settings',
      error: error.message
    });
  }
};


const getSystemStats = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    
    await settings.updateStats();
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const [totalUsers, totalPerformanceRecords, totalSalariesGenerated, recentPerformance] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Performance.countDocuments(),
      SalaryHistory.countDocuments({ period: currentMonth }),
      Performance.find().sort({ createdAt: -1 }).limit(5).populate('employeeId', 'name')
    ]);
    
    const departmentStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgBaseSalary: { $avg: '$baseSalary' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const performanceStats = await Performance.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          avgScore: { $avg: '$score' },
          totalScore: { $sum: '$score' }
        }
      }
    ]);
    
    const salaryStats = await SalaryHistory.aggregate([
      {
        $group: {
          _id: null,
          totalSalaries: { $sum: 1 },
          totalAmount: { $sum: '$calculatedSalary' },
          avgSalary: { $avg: '$calculatedSalary' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        settings: settings.systemStats,
        additional: {
          totalUsers,
          totalPerformanceRecords,
          totalSalariesGenerated,
          recentPerformance,
          departmentStats,
          performanceStats: performanceStats[0] || {
            totalRecords: 0,
            avgScore: 0,
            totalScore: 0
          },
          salaryStats: salaryStats[0] || {
            totalSalaries: 0,
            totalAmount: 0,
            avgSalary: 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      message: 'Error fetching system statistics',
      error: error.message
    });
  }
};


const resetSettings = async (req, res) => {
  try {
    const defaultMultiplier = process.env.DEFAULT_SALARY_MULTIPLIER || 100;
    
    const settings = await Settings.getInstance();
    settings.salaryMultiplier = defaultMultiplier;
    settings.lastSalaryCalculation = null;
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Settings reset to defaults successfully',
      data: { settings }
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      message: 'Error resetting settings',
      error: error.message
    });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {}
    };
    
    try {
      await User.findOne();
      health.checks.database = 'connected';
    } catch (error) {
      health.checks.database = 'disconnected';
      health.status = 'unhealthy';
    }
    
    try {
      const settings = await Settings.getInstance();
      health.checks.settings = 'available';
      health.settings = {
        salaryMultiplier: settings.salaryMultiplier,
        lastSalaryCalculation: settings.lastSalaryCalculation
      };
    } catch (error) {
      health.checks.settings = 'error';
      health.status = 'unhealthy';
    }
    
    try {
      const [userCount, performanceCount, salaryCount] = await Promise.all([
        User.countDocuments(),
        Performance.countDocuments(),
        SalaryHistory.countDocuments()
      ]);
      
      health.checks.collections = 'accessible';
      health.collections = {
        users: userCount,
        performance: performanceCount,
        salaryHistory: salaryCount
      };
    } catch (error) {
      health.checks.collections = 'error';
      health.status = 'unhealthy';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.status === 'healthy',
      data: health
    });
  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking system health',
      error: error.message
    });
  }
};

const getAutomationSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    
    res.json({
      success: true,
      data: {
        automatedSalaryCalculation: settings.automatedSalaryCalculation || false,
        salaryCalculationDay: settings.salaryCalculationDay || 1,
        lastAutomatedCalculation: settings.lastAutomatedCalculation,
        nextScheduledCalculation: settings.nextScheduledCalculation
      }
    });
  } catch (error) {
    console.error('Get automation settings error:', error);
    res.status(500).json({
      message: 'Error fetching automation settings',
      error: error.message
    });
  }
};

const updateAutomationSettings = async (req, res) => {
  try {
    const { automatedSalaryCalculation, salaryCalculationDay } = req.body;
    
    const settings = await Settings.getInstance();
    
    if (automatedSalaryCalculation !== undefined) {
      settings.automatedSalaryCalculation = automatedSalaryCalculation;
    }
    
    if (salaryCalculationDay !== undefined) {
      if (salaryCalculationDay < 1 || salaryCalculationDay > 28) {
        return res.status(400).json({
          message: 'Salary calculation day must be between 1 and 28'
        });
      }
      settings.salaryCalculationDay = salaryCalculationDay;
    }
    
    if (automatedSalaryCalculation) {
      const now = new Date();
      const nextCalculation = new Date(now.getFullYear(), now.getMonth(), salaryCalculationDay);
      
      if (nextCalculation <= now) {
        nextCalculation.setMonth(nextCalculation.getMonth() + 1);
      }
      
      settings.nextScheduledCalculation = nextCalculation;
    } else {
      settings.nextScheduledCalculation = null;
    }
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'Automation settings updated successfully',
      data: {
        automatedSalaryCalculation: settings.automatedSalaryCalculation,
        salaryCalculationDay: settings.salaryCalculationDay,
        nextScheduledCalculation: settings.nextScheduledCalculation
      }
    });
  } catch (error) {
    console.error('Update automation settings error:', error);
    res.status(500).json({
      message: 'Error updating automation settings',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
  getSystemStats,
  getSystemHealth,
  getAutomationSettings,
  updateAutomationSettings
}; 