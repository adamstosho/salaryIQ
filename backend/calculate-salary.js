const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Performance = require('./models/Performance');
const SalaryHistory = require('./models/SalaryHistory');
const Settings = require('./models/Settings');

async function calculateSalaryForUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/performance-salary');
    console.log('Connected to database');

    const user = await User.findOne({ email: 'uthmanabdullahi2020@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    const period = '2025-07';
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    console.log(`Calculating salary for ${user.name} for period ${period}`);

    const performanceRecords = await Performance.find({
      employeeId: user._id,
      date: { $gte: startDate, $lte: endDate },
      isApproved: true
    });

    console.log(`Found ${performanceRecords.length} approved performance records`);

    const totalScore = performanceRecords.reduce((sum, record) => {
      const weightedScore = record.score * record.difficultyMultiplier;
      console.log(`  ${record.taskName}: ${record.score} × ${record.difficultyMultiplier} = ${weightedScore}`);
      return sum + weightedScore;
    }, 0);

    console.log(`Total weighted score: ${totalScore}`);

    const settings = await Settings.getInstance();
    const multiplier = settings.salaryMultiplier;

    const performanceBonus = Math.round(totalScore * multiplier);
    const calculatedSalary = Math.round(user.baseSalary + performanceBonus);

    console.log(`\nSalary calculation:`);
          console.log(`  Base salary: ₦${user.baseSalary}`);
      console.log(`  Performance bonus: ₦${performanceBonus}`);
      console.log(`  Total salary: ₦${calculatedSalary}`);

    const breakdown = {
      baseSalary: Math.round(user.baseSalary),
      performanceBonus: performanceBonus,
      totalSalary: calculatedSalary
    };

    const existingSalary = await SalaryHistory.findOne({
      employeeId: user._id,
      period: period
    });

    if (existingSalary) {
      console.log(`\n⚠️ Salary record already exists for ${period}`);
      console.log(`  Current total score: ${existingSalary.totalScore}`);
      console.log(`  Current calculated salary: ₦${existingSalary.calculatedSalary}`);
      
      existingSalary.totalScore = totalScore;
      existingSalary.calculatedSalary = calculatedSalary;
      existingSalary.breakdown = breakdown;
      existingSalary.performanceRecords = performanceRecords.map(record => ({
        recordId: record._id,
        taskName: record.taskName,
        score: record.score,
        difficulty: record.difficulty,
        weightedScore: record.score * record.difficultyMultiplier
      }));
      
      await existingSalary.save();
      console.log(`✅ Updated salary record for ${period}`);
    } else {
      const salaryHistory = await SalaryHistory.create({
        employeeId: user._id,
        period: period,
        totalScore,
        calculatedSalary,
        baseSalary: user.baseSalary,
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

      console.log(`✅ Created new salary record for ${period}`);
      console.log(`  Record ID: ${salaryHistory._id}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

calculateSalaryForUser(); 