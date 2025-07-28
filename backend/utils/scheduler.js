const Settings = require('../models/Settings');
const { calculateSalary } = require('../controllers/salaryController');

class SalaryScheduler {
  constructor() {
    this.isRunning = false;
    this.checkInterval = null;
  }

  start() {
    if (this.isRunning) {
      console.log('Salary scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting salary scheduler...');

    this.checkInterval = setInterval(async () => {
      await this.checkForScheduledCalculation();
    }, 60 * 60 * 1000); 

    this.checkForScheduledCalculation();
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Salary scheduler stopped');
  }

  async checkForScheduledCalculation() {
    try {
      const settings = await Settings.getInstance();
      
      if (!settings.automatedSalaryCalculation) {
        return;
      }

      const now = new Date();
      const today = now.getDate();
      const currentHour = now.getHours();

      if (today === settings.salaryCalculationDay && currentHour === 9) {
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
        
        await this.performAutomatedCalculation(currentMonth);
        
        settings.lastAutomatedCalculation = now;
        settings.nextScheduledCalculation = this.calculateNextScheduledDate(settings.salaryCalculationDay);
        await settings.save();
        
        console.log(`Automated salary calculation completed for ${currentMonth}`);
      }
    } catch (error) {
      console.error('Error in salary scheduler:', error);
    }
  }

  async performAutomatedCalculation(period) {
    try {
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

  calculateNextScheduledDate(calculationDay) {
    const now = new Date();
    const nextCalculation = new Date(now.getFullYear(), now.getMonth(), calculationDay);
    
    if (nextCalculation <= now) {
      nextCalculation.setMonth(nextCalculation.getMonth() + 1);
    }
    
    return nextCalculation;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextCheck: this.checkInterval ? new Date(Date.now() + 60 * 60 * 1000) : null
    };
  }
}

const salaryScheduler = new SalaryScheduler();

module.exports = salaryScheduler; 