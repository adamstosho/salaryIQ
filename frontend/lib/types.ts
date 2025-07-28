export interface User {
  _id: string
  name: string
  email: string
  role: "admin" | "employee"
  baseSalary: number
  department: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Performance {
  _id: string
  employeeId: User
  taskName: string
  score: number
  difficulty: "easy" | "medium" | "hard"
  clientFeedback?: string
  date: string
  notes?: string
  isApproved: boolean
  difficultyMultiplier: number
  weightedScore: number
  createdAt: string
  updatedAt: string
}

export interface SalaryHistory {
  _id: string
  employeeId: User
  period: string
  totalScore: number
  calculatedSalary: number
  baseSalary: number
  multiplier: number
  breakdown: {
    baseSalary: number
    performanceBonus: number
    totalSalary: number
  }
  performanceRecords: Array<{
    recordId: string
    taskName: string
    score: number
    difficulty: string
    weightedScore: number
  }>
  calculatedAt: string
  status: "pending" | "approved" | "paid"
  createdAt: string
  updatedAt: string
}

export interface Settings {
  _id: string
  salaryMultiplier: number
  lastSalaryCalculation?: string
  automatedSalaryCalculation?: boolean
  salaryCalculationDay?: number
  lastAutomatedCalculation?: string
  nextScheduledCalculation?: string
  systemStats: {
    totalEmployees: number
    totalPerformanceRecords: number
    totalSalariesGenerated: number
    lastUpdated: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}
