const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  removeToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser() {
    return this.request("/auth/me")
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" })
  }

  async getUsers(page = 1, limit = 10) {
    return this.request(`/users?page=${page}&limit=${limit}`)
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`)
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: "DELETE" })
  }

  async getUserStats() {
    return this.request("/users/stats")
  }

  async getPerformanceRecords(params: any = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/performance?${queryString}`)
  }

  async createPerformanceRecord(data: any) {
    return this.request("/performance", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updatePerformanceRecord(id: string, data: any) {
    return this.request(`/performance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async approvePerformanceRecord(id: string) {
    return this.request(`/performance/${id}/approve`, {
      method: "PUT",
    })
  }

  async deletePerformanceRecord(id: string) {
    return this.request(`/performance/${id}`, { method: "DELETE" })
  }

  async getPerformanceStats(params: any = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/performance/stats?${queryString}`)
  }

  async calculateSalary(period?: string) {
    return this.request("/salary/calculate", {
      method: "POST",
      body: JSON.stringify({ period }),
    })
  }

  async getMySalaryHistory(page = 1, limit = 10) {
    return this.request(`/salary/me?page=${page}&limit=${limit}`)
  }

  async getAllSalaryHistory(params: any = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/salary/all?${queryString}`)
  }

  async getSalaryStats() {
    return this.request("/salary/stats")
  }

  async getSalaryBreakdown(period: string) {
    return this.request(`/salary/breakdown/${period}`)
  }

  async updateSalaryStatus(salaryId: string, status: string) {
    return this.request(`/salary/${salaryId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  async bulkUpdateSalaryStatus(salaryIds: string[], status: string) {
    return this.request("/salary/bulk-status", {
      method: "PUT",
      body: JSON.stringify({ salaryIds, status }),
    })
  }

  async approvePerformanceForSalary(performanceIds: string[], period: string) {
    return this.request("/salary/approve-performance", {
      method: "PUT",
      body: JSON.stringify({ performanceIds, period }),
    })
  }

  async getPendingPerformanceRecords(period: string) {
    return this.request(`/salary/pending-performance?period=${period}`)
  }

  async getSettings() {
    return this.request("/settings")
  }

  async updateSettings(data: any) {
    return this.request("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async resetSettings() {
    return this.request("/settings/reset", { method: "POST" })
  }

  async getSystemStats() {
    return this.request("/settings/stats")
  }

  async getSystemHealth() {
    return this.request("/settings/health")
  }

  async getAutomationSettings() {
    return this.request("/settings/automation")
  }

  async updateAutomationSettings(data: any) {
    return this.request("/settings/automation", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async healthCheck() {
    return this.request("/health")
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
