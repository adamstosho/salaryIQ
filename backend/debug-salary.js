const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Performance = require('./models/Performance');
const SalaryHistory = require('./models/SalaryHistory');

async function debugSalaryCalculation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/performance-salary');
    console.log('Connected to database');

    const user = await User.findOne({ email: 'uthmanabdullahi2020@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`Base salary: $${user.baseSalary}`);

    const allRecords = await Performance.find({ employeeId: user._id }).populate('employeeId', 'name email');
    console.log(`\n📊 Total performance records: ${allRecords.length}`);

    if (allRecords.length === 0) {
      console.log('❌ No performance records found for this user');
      return;
    }

    allRecords.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  Task: ${record.taskName}`);
      console.log(`  Score: ${record.score}%`);
      console.log(`  Difficulty: ${record.difficulty}`);
      console.log(`  Approved: ${record.isApproved ? '✅ Yes' : '❌ No'}`);
      console.log(`  Date: ${record.date.toISOString().split('T')[0]}`);
      console.log(`  Weighted Score: ${record.score * record.difficultyMultiplier}`);
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    console.log(`\n📅 Checking records for current month: ${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
    console.log(`Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    const currentMonthRecords = await Performance.find({
      employeeId: user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    console.log(`\n📊 Current month records: ${currentMonthRecords.length}`);

    const approvedRecords = currentMonthRecords.filter(record => record.isApproved);
    console.log(`✅ Approved records: ${approvedRecords.length}`);

    if (approvedRecords.length === 0) {
      console.log('\n❌ No approved records for current month!');
      console.log('💡 Solution: Approve the performance records first');
      return;
    }

    const totalScore = approvedRecords.reduce((sum, record) => {
      const weightedScore = record.score * record.difficultyMultiplier;
      console.log(`  ${record.taskName}: ${record.score} × ${record.difficultyMultiplier} = ${weightedScore}`);
      return sum + weightedScore;
    }, 0);

    console.log(`\n📈 Total weighted score: ${totalScore}`);

    const Settings = require('./models/Settings');
    const settings = await Settings.getInstance();
    const multiplier = settings.salaryMultiplier;
    
    console.log(`💰 Salary multiplier: ${multiplier}`);
    
    const performanceBonus = totalScore * multiplier;
    const calculatedSalary = user.baseSalary + performanceBonus;
    
    console.log(`\n💵 Salary calculation:`);
    console.log(`  Base salary: $${user.baseSalary}`);
    console.log(`  Performance bonus: $${performanceBonus}`);
    console.log(`  Total salary: $${calculatedSalary}`);

    const period = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const existingSalary = await SalaryHistory.findOne({
      employeeId: user._id,
      period: period
    });

    if (existingSalary) {
      console.log(`\n📋 Existing salary record for ${period}:`);
      console.log(`  Total score: ${existingSalary.totalScore}`);
      console.log(`  Calculated salary: $${existingSalary.calculatedSalary}`);
      console.log(`  Status: ${existingSalary.status}`);
    } else {
      console.log(`\n❌ No salary record found for ${period}`);
      console.log('💡 Solution: Run salary calculation for this period');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

debugSalaryCalculation(); 