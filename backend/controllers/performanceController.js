const Performance = require('../models/Performance');
const User = require('../models/User');

// @desc    Get all performance records (admin) or user's own records (employee)
// @route   GET /api/performance
// @access  Private
const getPerformanceRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    // If employee, only show their own records
    if (req.user.role === 'employee') {
      query.employeeId = req.user.id;
    }

    // Add date filter if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const records = await Performance.find(query)
      .populate('employeeId', 'name email department')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Performance.countDocuments(query);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get performance records error:', error);
    res.status(500).json({
      message: 'Error fetching performance records',
      error: error.message
    });
  }
};

// @desc    Get single performance record
// @route   GET /api/performance/:id
// @access  Private
const getPerformanceRecord = async (req, res) => {
  try {
    const record = await Performance.findById(req.params.id)
      .populate('employeeId', 'name email department');

    if (!record) {
      return res.status(404).json({
        message: 'Performance record not found'
      });
    }

    // Check if user can access this record
    if (req.user.role === 'employee' && record.employeeId._id.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized to access this record'
      });
    }

    res.json({
      success: true,
      data: { record }
    });
  } catch (error) {
    console.error('Get performance record error:', error);
    res.status(500).json({
      message: 'Error fetching performance record',
      error: error.message
    });
  }
};

// @desc    Create performance record
// @route   POST /api/performance
// @access  Private
const createPerformanceRecord = async (req, res) => {
  try {
    const { taskName, score, difficulty, clientFeedback, date, notes } = req.body;

    // Set employeeId based on user role
    const employeeId = req.user.role === 'admin' && req.body.employeeId 
      ? req.body.employeeId 
      : req.user.id;

    // Verify employee exists if admin is creating for someone else
    if (req.user.role === 'admin' && req.body.employeeId) {
      const employee = await User.findById(req.body.employeeId);
      if (!employee || employee.role !== 'employee') {
        return res.status(400).json({
          message: 'Invalid employee ID'
        });
      }
    }

    const record = await Performance.create({
      employeeId,
      taskName,
      score,
      difficulty,
      clientFeedback,
      date: date || new Date(),
      notes
    });

    const populatedRecord = await Performance.findById(record._id)
      .populate('employeeId', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Performance record created successfully',
      data: { record: populatedRecord }
    });
  } catch (error) {
    console.error('Create performance record error:', error);
    res.status(500).json({
      message: 'Error creating performance record',
      error: error.message
    });
  }
};

// @desc    Update performance record
// @route   PUT /api/performance/:id
// @access  Private
const updatePerformanceRecord = async (req, res) => {
  try {
    const record = await Performance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: 'Performance record not found'
      });
    }

    // Check if user can update this record
    if (req.user.role === 'employee' && record.employeeId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized to update this record'
      });
    }

    const updatedRecord = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('employeeId', 'name email department');

    res.json({
      success: true,
      message: 'Performance record updated successfully',
      data: { record: updatedRecord }
    });
  } catch (error) {
    console.error('Update performance record error:', error);
    res.status(500).json({
      message: 'Error updating performance record',
      error: error.message
    });
  }
};

// @desc    Delete performance record
// @route   DELETE /api/performance/:id
// @access  Private
const deletePerformanceRecord = async (req, res) => {
  try {
    const record = await Performance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: 'Performance record not found'
      });
    }

    // Check if user can delete this record
    if (req.user.role === 'employee' && record.employeeId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized to delete this record'
      });
    }

    await Performance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Performance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete performance record error:', error);
    res.status(500).json({
      message: 'Error deleting performance record',
      error: error.message
    });
  }
};

// @desc    Approve performance record (admin only)
// @route   PUT /api/performance/:id/approve
// @access  Private/Admin
const approvePerformanceRecord = async (req, res) => {
  try {
    const record = await Performance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: 'Performance record not found'
      });
    }

    // Update the record to approved
    const updatedRecord = await Performance.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true, runValidators: true }
    ).populate('employeeId', 'name email department');

    res.json({
      success: true,
      message: 'Performance record approved successfully',
      data: { record: updatedRecord }
    });
  } catch (error) {
    console.error('Approve performance record error:', error);
    res.status(500).json({
      message: 'Error approving performance record',
      error: error.message
    });
  }
};

// @desc    Get performance statistics
// @route   GET /api/performance/stats
// @access  Private
const getPerformanceStats = async (req, res) => {
  try {
    let matchQuery = {};
    
    // If employee, only show their stats
    if (req.user.role === 'employee') {
      matchQuery.employeeId = req.user.id;
    }

    // Add date filter if provided
    if (req.query.startDate && req.query.endDate) {
      matchQuery.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const stats = await Performance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          avgScore: { $avg: '$score' },
          totalScore: { $sum: '$score' },
          avgWeightedScore: { $avg: { $multiply: ['$score', '$difficultyMultiplier'] } },
          totalWeightedScore: { $sum: { $multiply: ['$score', '$difficultyMultiplier'] } }
        }
      }
    ]);

    const difficultyStats = await Performance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    const monthlyStats = await Performance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          totalScore: { $sum: '$score' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalRecords: 0,
          avgScore: 0,
          totalScore: 0,
          avgWeightedScore: 0,
          totalWeightedScore: 0
        },
        byDifficulty: difficultyStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    console.error('Get performance stats error:', error);
    res.status(500).json({
      message: 'Error fetching performance statistics',
      error: error.message
    });
  }
};

module.exports = {
  getPerformanceRecords,
  getPerformanceRecord,
  createPerformanceRecord,
  updatePerformanceRecord,
  deletePerformanceRecord,
  approvePerformanceRecord,
  getPerformanceStats
}; 