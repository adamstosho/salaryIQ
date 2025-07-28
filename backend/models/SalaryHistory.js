const mongoose = require('mongoose');

const salaryHistorySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee ID is required']
  },
  period: {
    type: String,
    required: [true, 'Period is required'],
    match: [/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format']
  },
  totalScore: {
    type: Number,
    required: [true, 'Total score is required'],
    min: [0, 'Total score cannot be negative']
  },
  calculatedSalary: {
    type: Number,
    required: [true, 'Calculated salary is required'],
    min: [0, 'Calculated salary cannot be negative']
  },
  baseSalary: {
    type: Number,
    required: [true, 'Base salary is required'],
    min: [0, 'Base salary cannot be negative']
  },
  multiplier: {
    type: Number,
    required: [true, 'Multiplier is required'],
    min: [0, 'Multiplier cannot be negative']
  },
  breakdown: {
    baseSalary: {
      type: Number,
      required: true
    },
    performanceBonus: {
      type: Number,
      required: true
    },
    totalSalary: {
      type: Number,
      required: true
    }
  },
  performanceRecords: [{
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Performance'
    },
    taskName: String,
    score: Number,
    difficulty: String,
    weightedScore: Number
  }],
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
});

salaryHistorySchema.index({ employeeId: 1, period: 1 }, { unique: true });
salaryHistorySchema.index({ period: 1 });
salaryHistorySchema.index({ calculatedAt: -1 });

salaryHistorySchema.virtual('periodDisplay').get(function() {
  const [year, month] = this.period.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
});

salaryHistorySchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const employee = await User.findById(this.employeeId);
    if (!employee) {
      return next(new Error('Employee not found'));
    }
  }
  next();
});

module.exports = mongoose.model('SalaryHistory', salaryHistorySchema); 