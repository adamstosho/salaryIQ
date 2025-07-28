const SalaryHistory = require('../models/SalaryHistory');
const Performance = require('../models/Performance');
const User = require('../models/User');
const Settings = require('../models/Settings');


const calculateSalary = async (req, res) => {
  try {
    const { period } = req.body;
    
    const targetPeriod = period || new Date().toISOString().slice(0, 7);
    
    const existingSalary = await SalaryHistory.findOne({ period: targetPeriod });
    if (existingSalary) {
      return res.status(400).json({
        message: `Salary for period ${targetPeriod} has already been calculated`
      });
    }

    const settings = await Settings.getInstance();
    const multiplier = settings.salaryMultiplier;

    const employees = await User.find({ role: 'employee', isActive: true });

    const [year, month] = targetPeriod.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const salaryResults = [];

    for (const employee of employees) {
      const performanceRecords = await Performance.find({
        employeeId: employee._id,
        date: { $gte: startDate, $lte: endDate },
        isApproved: true
      });

      console.log(`Employee ${employee.name}: Found ${performanceRecords.length} approved performance records`);

      const totalScore = performanceRecords.reduce((sum, record) => {
        const weightedScore = record.score * record.difficultyMultiplier;
        console.log(`Record: ${record.taskName}, Score: ${record.score}, Difficulty: ${record.difficulty}, Multiplier: ${record.difficultyMultiplier}, Weighted: ${weightedScore}`);
        return sum + weightedScore;
      }, 0);

      console.log(`Employee ${employee.name}: Total weighted score: ${totalScore}`);

      const performanceBonus = totalScore * multiplier;
      const calculatedSalary = employee.baseSalary + performanceBonus;

      console.log(`Employee ${employee.name}: Base salary: ${employee.baseSalary}, Bonus: ${performanceBonus}, Total: ${calculatedSalary}`);

      const breakdown = {
        baseSalary: employee.baseSalary,
        performanceBonus: performanceBonus,
        totalSalary: calculatedSalary
      };

      const salaryHistory = await SalaryHistory.create({
        employeeId: employee._id,
        period: targetPeriod,
        totalScore,
        calculatedSalary,
        baseSalary: employee.baseSalary,
        multiplier,
        breakdown,
        performanceRecords: performanceRecords.map(record => ({
          recordId: record._id,
          taskName: record.taskName,
          score: record.score,
          difficulty: record.difficulty,
          weightedScore: record.score * record.difficultyMultiplier
        }))
      });

      salaryResults.push({
        employeeId: employee._id,
        employeeName: employee.name,
        period: targetPeriod,
        totalScore,
        calculatedSalary,
        breakdown
      });
    }

    settings.lastSalaryCalculation = new Date();
    await settings.save();

    res.status(201).json({
      success: true,
      message: `Salary calculated successfully for ${targetPeriod}`,
      data: {
        period: targetPeriod,
        multiplier,
        totalEmployees: employees.length,
        results: salaryResults
      }
    });
  } catch (error) {
    console.error('Calculate salary error:', error);
    res.status(500).json({
      message: 'Error calculating salary',
      error: error.message
    });
  }
};


const getMySalaryHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const salaryHistory = await SalaryHistory.find({ employeeId: req.user.id })
      .populate('employeeId', 'name email department')
      .skip(skip)
      .limit(limit)
      .sort({ period: -1 });

    const total = await SalaryHistory.countDocuments({ employeeId: req.user.id });

    res.json({
      success: true,
      data: {
        salaryHistory,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my salary history error:', error);
    res.status(500).json({
      message: 'Error fetching salary history',
      error: error.message
    });
  }
};


const getAllSalaryHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.query.period) {
      query.period = req.query.period;
    }

    if (req.query.employeeId) {
      query.employeeId = req.query.employeeId;
    }

    const salaryHistory = await SalaryHistory.find(query)
      .populate('employeeId', 'name email department')
      .skip(skip)
      .limit(limit)
      .sort({ period: -1, createdAt: -1 });

    const total = await SalaryHistory.countDocuments(query);

    res.json({
      success: true,
      data: {
        salaryHistory,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all salary history error:', error);
    res.status(500).json({
      message: 'Error fetching salary history',
      error: error.message
    });
  }
};


const getSalaryStats = async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const stats = await SalaryHistory.aggregate([
      {
        $group: {
          _id: null,
          totalSalaries: { $sum: 1 },
          totalAmount: { $sum: '$calculatedSalary' },
          avgSalary: { $avg: '$calculatedSalary' },
          avgBaseSalary: { $avg: '$baseSalary' },
          avgPerformanceBonus: { $avg: '$breakdown.performanceBonus' }
        }
      }
    ]);

    const monthlyStats = await SalaryHistory.aggregate([
      {
        $group: {
          _id: '$period',
          count: { $sum: 1 },
          totalAmount: { $sum: '$calculatedSalary' },
          avgSalary: { $avg: '$calculatedSalary' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);

    const employeeStats = await SalaryHistory.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employeeId',
          employeeName: { $first: '$employee.name' },
          totalSalaries: { $sum: 1 },
          avgSalary: { $avg: '$calculatedSalary' },
          totalEarned: { $sum: '$calculatedSalary' },
          lastSalary: { $max: '$calculatedSalary' }
        }
      },
      { $sort: { totalEarned: -1 } },
      { $limit: 10 }
    ]);

    const currentMonthStats = await SalaryHistory.aggregate([
      { $match: { period: currentMonth } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalAmount: { $sum: '$calculatedSalary' },
          avgSalary: { $avg: '$calculatedSalary' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalSalaries: 0,
          totalAmount: 0,
          avgSalary: 0,
          avgBaseSalary: 0,
          avgPerformanceBonus: 0
        },
        currentMonth: currentMonthStats[0] || {
          count: 0,
          totalAmount: 0,
          avgSalary: 0
        },
        monthly: monthlyStats,
        topEmployees: employeeStats
      }
    });
  } catch (error) {
    console.error('Get salary stats error:', error);
    res.status(500).json({
      message: 'Error fetching salary statistics',
      error: error.message
    });
  }
};

const getSalaryBreakdown = async (req, res) => {
  try {
    const { period } = req.params;
    
    let query = { period };
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user.id;
    }

    const salaryHistory = await SalaryHistory.find(query)
      .populate('employeeId', 'name email department')
      .populate('performanceRecords.recordId');

    if (salaryHistory.length === 0) {
      return res.status(404).json({
        message: 'No salary records found for this period'
      });
    }

    res.json({
      success: true,
      data: {
        period,
        salaryHistory
      }
    });
  } catch (error) {
    console.error('Get salary breakdown error:', error);
    res.status(500).json({
      message: 'Error fetching salary breakdown',
      error: error.message
    });
  }
};


const updateSalaryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'paid'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be pending, approved, or paid'
      });
    }

    const salaryRecord = await SalaryHistory.findById(req.params.id);
    
    if (!salaryRecord) {
      return res.status(404).json({
        message: 'Salary record not found'
      });
    }

    salaryRecord.status = status;
    await salaryRecord.save();

    const populatedRecord = await SalaryHistory.findById(req.params.id)
      .populate('employeeId', 'name email department');

    res.json({
      success: true,
      message: `Salary status updated to ${status}`,
      data: { salaryRecord: populatedRecord }
    });
  } catch (error) {
    console.error('Update salary status error:', error);
    res.status(500).json({
      message: 'Error updating salary status',
      error: error.message
    });
  }
};

const bulkUpdateSalaryStatus = async (req, res) => {
  try {
    const { salaryIds, status } = req.body;
    
    if (!['pending', 'approved', 'paid'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be pending, approved, or paid'
      });
    }

    if (!Array.isArray(salaryIds) || salaryIds.length === 0) {
      return res.status(400).json({
        message: 'Salary IDs array is required'
      });
    }

    const result = await SalaryHistory.updateMany(
      { _id: { $in: salaryIds } },
      { status }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} salary records to ${status}`,
      data: { 
        updatedCount: result.modifiedCount,
        totalCount: salaryIds.length
      }
    });
  } catch (error) {
    console.error('Bulk update salary status error:', error);
    res.status(500).json({
      message: 'Error updating salary statuses',
      error: error.message
    });
  }
};

const approvePerformanceForSalary = async (req, res) => {
  try {
    const { performanceIds, period } = req.body;
    
    if (!Array.isArray(performanceIds) || performanceIds.length === 0) {
      return res.status(400).json({
        message: 'Performance IDs array is required'
      });
    }

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({
        message: 'Valid period in YYYY-MM format is required'
      });
    }

    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const result = await Performance.updateMany(
      { 
        _id: { $in: performanceIds },
        date: { $gte: startDate, $lte: endDate }
      },
      { isApproved: true }
    );

    res.json({
      success: true,
      message: `Approved ${result.modifiedCount} performance records for ${period}`,
      data: { 
        approvedCount: result.modifiedCount,
        totalCount: performanceIds.length
      }
    });
  } catch (error) {
    console.error('Approve performance for salary error:', error);
    res.status(500).json({
      message: 'Error approving performance records',
      error: error.message
    });
  }
};

const getPendingPerformanceRecords = async (req, res) => {
  try {
    const { period } = req.query;
    
    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return res.status(400).json({
        message: 'Valid period in YYYY-MM format is required'
      });
    }

    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const pendingRecords = await Performance.find({
      date: { $gte: startDate, $lte: endDate },
      isApproved: false
    }).populate('employeeId', 'name email department');

    res.json({
      success: true,
      data: {
        period,
        pendingRecords,
        count: pendingRecords.length
      }
    });
  } catch (error) {
    console.error('Get pending performance records error:', error);
    res.status(500).json({
      message: 'Error fetching pending performance records',
      error: error.message
    });
  }
};

module.exports = {
  calculateSalary,
  getMySalaryHistory,
  getAllSalaryHistory,
  getSalaryStats,
  getSalaryBreakdown,
  updateSalaryStatus,
  bulkUpdateSalaryStatus,
  approvePerformanceForSalary,
  getPendingPerformanceRecords
}; 