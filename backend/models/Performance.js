const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee ID is required']
  },
  taskName: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [200, 'Task name cannot exceed 200 characters']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: [true, 'Difficulty level is required']
  },
  clientFeedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Client feedback cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
performanceSchema.index({ employeeId: 1, date: -1 });
performanceSchema.index({ date: -1 });

// Virtual for difficulty multiplier
performanceSchema.virtual('difficultyMultiplier').get(function() {
  const multipliers = {
    easy: 1.0,
    medium: 1.2,
    hard: 1.5
  };
  return multipliers[this.difficulty] || 1.0;
});

// Virtual for weighted score
performanceSchema.virtual('weightedScore').get(function() {
  return this.score * this.difficultyMultiplier;
});

// Pre-save middleware to ensure employee exists
performanceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const employee = await User.findById(this.employeeId);
    if (!employee) {
      return next(new Error('Employee not found'));
    }
  }
  next();
});

module.exports = mongoose.model('Performance', performanceSchema); 