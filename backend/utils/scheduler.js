const Settings = require('../models/Settings');
const { calculateSalary } = require('../controllers/salaryController');

class SalaryScheduler {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('Salary scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting salary scheduler...');

    // Check every hour for scheduled calculations
    this.checkInterval = setInterval(async () => {
      await this.checkForScheduledCalculation();
    }, 60 * 60 * 1000); // 1 hour

    // Also check immediately on startup
    this.checkForScheduledCalculation();
  }

  // Stop the scheduler
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Salary scheduler stopped');
  }

  // Check if it's time for a scheduled salary calculation
  async checkForScheduledCalculation() {
    try {
      const settings = await Settings.getInstance();
      
      if (!settings.automatedSalaryCalculation) {
        return;
      }

      const now = new Date();
      const today = now.getDate();
      const currentHour = now.getHours();

      // Check if today is the calculation day and it's morning (9 AM)
      if (today === settings.salaryCalculationDay && currentHour === 9) {
        // Check if we already calculated for this month
        const currentMonth = now.toISOString().slice(0, 7);
        const lastCalculation = settings.lastAutomatedCalculation;
        
        if (lastCalculation) {
          const lastCalculationMonth = lastCalculation.toISOString().slice(0, 7);
          if (lastCalculationMonth === currentMonth) {
            console.log(`Salary already calculated for ${currentMonth}`);
            return;
          }
        }

        console.log(`Starting automated salary calculation for ${currentMonth}`);
        
        // Perform the calculation
        await this.performAutomatedCalculation(currentMonth);
        
        // Update settings
        settings.lastAutomatedCalculation = now;
        settings.nextScheduledCalculation = this.calculateNextScheduledDate(settings.salaryCalculationDay);
        await settings.save();
        
        console.log(`Automated salary calculation completed for ${currentMonth}`);
      }
    } catch (error) {
      console.error('Error in salary scheduler:', error);
    }
  }

  // Perform the actual salary calculation
  async performAutomatedCalculation(period) {
    try {
      // Create a mock request and response for the calculateSalary function
      const mockReq = {
        body: { period },
        user: { id: 'system', role: 'admin' }
      };

      const mockRes = {
        status: (code) => ({
          json: (data) => {
            if (code === 201) {
              console.log('Salary calculation successful:', data.message);
            } else {
              console.error('Salary calculation failed:', data.message);
            }
          }
        })
      };

      await calculateSalary(mockReq, mockRes);
    } catch (error) {
      console.error('Error performing automated salary calculation:', error);
    }
  }

  // Calculate the next scheduled calculation date
  calculateNextScheduledDate(calculationDay) {
    const now = new Date();
    const nextCalculation = new Date(now.getFullYear(), now.getMonth(), calculationDay);
    
    // If this month's calculation day has passed, schedule for next month
    if (nextCalculation <= now) {
      nextCalculation.setMonth(nextCalculation.getMonth() + 1);
    }
    
    return nextCalculation;
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextCheck: this.checkInterval ? new Date(Date.now() + 60 * 60 * 1000) : null
    };
  }
}

// Create singleton instance
const salaryScheduler = new SalaryScheduler();

module.exports = salaryScheduler; 