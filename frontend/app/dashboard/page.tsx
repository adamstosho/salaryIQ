"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { StatsCard } from "@/components/ui/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { Users, TrendingUp, DollarSign, Activity, Plus, Eye, Calendar, Award } from "lucide-react"
import { format } from "date-fns"

export default function DashboardPage() {
  const { user, isAdmin, authLoading } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      loadDashboardData()
    }
  }, [authLoading])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      if (isAdmin) {
        const [systemStats, userStats, performanceStats, salaryStats] = await Promise.all([
          apiClient.getSystemStats(),
          apiClient.getUserStats(),
          apiClient.getPerformanceStats(),
          apiClient.getSalaryStats(),
        ]) as any[]

        setStats({
          totalEmployees: userStats.data.overall.totalUsers,
          totalPerformanceRecords: systemStats.data.additional.totalPerformanceRecords,
          totalSalariesGenerated: systemStats.data.additional.totalSalariesGenerated,
          avgPerformanceScore: performanceStats.data.overall.avgScore,
          totalSalaryAmount: salaryStats.data.overall.totalAmount,
        })
      } else {
        const [performanceRecords, salaryHistory] = await Promise.all([
          apiClient.getPerformanceRecords({ limit: 5 }),
          apiClient.getMySalaryHistory(1, 5),
        ]) as any[]

        const avgScore =
          performanceRecords.data.records.reduce((acc: number, record: any) => acc + record.score, 0) /
            performanceRecords.data.records.length || 0
        const latestSalary = salaryHistory.data.salaryHistory[0]?.calculatedSalary || user?.baseSalary || 0

        setStats({
          myPerformanceScore: Math.round(avgScore),
          totalTasks: performanceRecords.data.pagination.total,
          currentSalary: latestSalary,
          thisMonthTasks: performanceRecords.data.records.filter((record: any) => {
            const recordDate = new Date(record.date)
            const now = new Date()
            return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
          }).length,
        })

        setRecentActivity(performanceRecords.data.records)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-slate-400">
            {isAdmin
              ? "Here's an overview of your system performance and metrics."
              : "Track your performance and view your salary information."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {isAdmin ? (
            <>
              <StatsCard
                title="Total Employees"
                value={stats?.totalEmployees || 0}
                icon={Users}
                change={{ value: "+12% from last month", type: "increase" }}
              />
              <StatsCard
                title="Performance Records"
                value={stats?.totalPerformanceRecords || 0}
                icon={TrendingUp}
                change={{ value: "+8% from last month", type: "increase" }}
              />
              <StatsCard
                title="Salaries Generated"
                value={stats?.totalSalariesGenerated || 0}
                icon={DollarSign}
                change={{ value: "+15% from last month", type: "increase" }}
              />
              <StatsCard
                title="Avg Performance"
                value={`${Math.round(stats?.avgPerformanceScore || 0)}%`}
                icon={Award}
                change={{ value: "+3% from last month", type: "increase" }}
              />
            </>
          ) : (
            <>
              <StatsCard
                title="My Performance Score"
                value={`${stats?.myPerformanceScore || 0}%`}
                icon={Award}
                change={{ value: "+5% from last month", type: "increase" }}
              />
              <StatsCard
                title="Total Tasks"
                value={stats?.totalTasks || 0}
                icon={Activity}
                change={{ value: "+3 this month", type: "increase" }}
              />
              <StatsCard
                title="Current Salary"
                value={formatCurrency(stats?.currentSalary || 0)}
                icon={DollarSign}
                change={{ value: "+12% from last month", type: "increase" }}
              />
              <StatsCard
                title="This Month Tasks"
                value={stats?.thisMonthTasks || 0}
                icon={Calendar}
                change={{ value: "On track", type: "neutral" }}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Activity */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-slate-400">
                {isAdmin ? "Latest system activities" : "Your recent performance records"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{activity.taskName}</p>
                          <p className="text-slate-400 text-sm">
                            {activity.date ? format(new Date(activity.date), "MMM dd, yyyy") : "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            activity.score >= 80 ? "default" : activity.score >= 60 ? "secondary" : "destructive"
                          }
                        >
                          {activity.score}%
                        </Badge>
                        <p className="text-slate-400 text-xs mt-1">{activity.difficulty}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-slate-400">Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:flex flex-col grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {isAdmin ? (
                  <>
                    <Button 
                      className="justify-start h-12 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                      onClick={() => window.location.href = '/performance'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Performance Record
                    </Button>
                    <Button 
                      className="justify-start h-12 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20"
                      onClick={() => window.location.href = '/salary'}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Calculate Salaries
                    </Button>
                    <Button 
                      className="justify-start h-12 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20"
                      onClick={() => window.location.href = '/users'}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      className="justify-start h-12 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                      onClick={() => window.location.href = '/performance'}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Performance Record
                    </Button>
                    <Button 
                      className="justify-start h-12 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20"
                      onClick={() => window.location.href = '/salary'}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Salary History
                    </Button>
                    <Button 
                      className="justify-start h-12 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20"
                      onClick={() => window.location.href = '/performance'}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Performance
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
