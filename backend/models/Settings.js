const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  salaryMultiplier: {
    type: Number,
    required: true,
    default: 100,
    min: [0, 'Multiplier cannot be negative']
  },
  lastSalaryCalculation: {
    type: Date,
    default: null
  },
  automatedSalaryCalculation: {
    type: Boolean,
    default: false
  },
  salaryCalculationDay: {
    type: Number,
    default: 1,
    min: [1, 'Calculation day must be at least 1'],
    max: [28, 'Calculation day cannot exceed 28']
  },
  lastAutomatedCalculation: {
    type: Date,
    default: null
  },
  nextScheduledCalculation: {
    type: Date,
    default: null
  },
  systemStats: {
    totalEmployees: {
      type: Number,
      default: 0
    },
    totalPerformanceRecords: {
      type: Number,
      default: 0
    },
    totalSalariesGenerated: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

settingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne({ isActive: true });
  if (!settings) {
    settings = await this.create({
      salaryMultiplier: process.env.DEFAULT_SALARY_MULTIPLIER || 100
    });
  }
  return settings;
};

settingsSchema.methods.updateStats = async function() {
  const User = mongoose.model('User');
  const Performance = mongoose.model('Performance');
  const SalaryHistory = mongoose.model('SalaryHistory');
  
  const currentMonth = new Date().toISOString().slice(0, 7); 
  
  const [totalEmployees, totalPerformanceRecords, totalSalariesGenerated] = await Promise.all([
    User.countDocuments({ role: 'employee', isActive: true }),
    Performance.countDocuments(),
    SalaryHistory.countDocuments({ period: currentMonth })
  ]);
  
  this.systemStats = {
    totalEmployees,
    totalPerformanceRecords,
    totalSalariesGenerated,
    lastUpdated: new Date()
  };
  
  return this.save();
};

module.exports = mongoose.model('Settings', settingsSchema); 