"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import type { SalaryHistory } from "@/lib/types"
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Calculator,
  Eye,
  Download,
  CalendarDays,
  CheckCircle,
  Clock,
  Settings,
} from "lucide-react"
import { SalaryBreakdownModal } from "@/components/salary/SalaryBreakdownModal"
import { SalaryStatusModal } from "@/components/salary/SalaryStatusModal"
import { PerformanceApprovalModal } from "@/components/performance/PerformanceApprovalModal"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SalaryPage() {
  const { isAdmin, authLoading } = useAuth()
  const { toast } = useToast()
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [showBreakdownModal, setShowBreakdownModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedSalaryRecord, setSelectedSalaryRecord] = useState<SalaryHistory | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [showPeriodSelector, setShowPeriodSelector] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      loadSalaryHistory()
    }
  }, [authLoading])

  const loadSalaryHistory = async () => {
    try {
      setLoading(true)
      const response = isAdmin
        ? await apiClient.getAllSalaryHistory({ limit: 20 })
        : await apiClient.getMySalaryHistory(1, 20)

      setSalaryHistory((response as any).data.salaryHistory)
    } catch (error) {
      console.error("Error loading salary history:", error)
    } finally {
      setLoading(false)
    }
  }

  const validatePeriod = (period: string): boolean => {
    const periodRegex = /^\d{4}-\d{2}$/
    return periodRegex.test(period)
  }

  const getRecentPeriods = (): string[] => {
    const periods: string[] = []
    const currentDate = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
    }
    return periods
  }

  const handleCalculateSalary = async () => {
    try {
      setCalculating(true)
      let period = selectedPeriod
      if (period && !validatePeriod(period)) {
        toast({
          title: "Invalid Period Format",
          description: "Use YYYY-MM (e.g. 2025-07)",
          variant: "destructive",
        })
        return
      }
      if (!period) {
        const now = new Date()
        period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      }

      await apiClient.calculateSalary(period)

      toast({
        title: "Success",
        description: `Salary calculated for ${period}`,
      })

      setSelectedPeriod("")
      setShowPeriodSelector(false)
      await loadSalaryHistory()
    } catch (error: any) {
      const err = error instanceof Error ? error.message : "Failed to calculate salary"
      const isAlready = error?.message?.includes("already been calculated")
      toast({
        title: isAlready ? "Salary Already Calculated" : "Error",
        description: isAlready
          ? `Salary for ${selectedPeriod || "this month"} is already done`
          : err,
        variant: isAlready ? "default" : "destructive",
      })
    } finally {
      setCalculating(false)
    }
  }

  const handleViewBreakdown = (record: SalaryHistory) => {
    setSelectedSalaryRecord(record)
    setShowBreakdownModal(true)
  }

  const handleUpdateStatus = (record: SalaryHistory) => {
    setSelectedSalaryRecord(record)
    setShowStatusModal(true)
  }

  const handleApprovalSuccess = () => {
    loadSalaryHistory()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-secondary text-secondary-foreground"
      case "paid":
        return "bg-primary text-primary-foreground"
      case "pending":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-slate-500 text-white"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "paid":
        return <DollarSign className="w-4 h-4" />
      case "pending":
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <DashboardLayout
      title="salaryGen"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Salary" }]}
    >
      {authLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Admin Actions */}
          {isAdmin && (
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Salary Management</h2>
                <p className="text-slate-400">Calculate and manage employee salaries</p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 w-full lg:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalModal(true)}
                  className="border-slate-600 text-slate-300 bg-transparent w-full sm:w-auto"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Performance
                </Button>
                {showPeriodSelector && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                    <Label htmlFor="period" className="text-white text-sm">
                      Period:
                    </Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-full sm:w-40 bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {getRecentPeriods().map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowPeriodSelector(!showPeriodSelector)}
                    className="border-slate-600 text-slate-300 bg-transparent w-full sm:w-auto"
                  >
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {showPeriodSelector ? "Hide Period" : "Select Period"}
                  </Button>
                  <Button
                    onClick={handleCalculateSalary}
                    disabled={calculating}
                    className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  >
                    {calculating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Salaries
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Salary Records */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Salary History
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isAdmin ? "All employee salary records" : "Your salary history and breakdowns"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {salaryHistory.length > 0 ? (
                    salaryHistory.map((record) => (
                      <div
                        key={record._id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors gap-4"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <DollarSign className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-white font-medium">
                                {!authLoading && isAdmin ? record.employeeId.name : "Your Salary"}
                              </h3>
                              <Badge className={`${getStatusColor(record.status)} flex items-center space-x-1`}>
                                {getStatusIcon(record.status)}
                                <span className="capitalize">{record.status}</span>
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {record.period}
                              </div>
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                Score: {Math.round(record.totalScore)}
                              </div>
                            </div>
                            {isAdmin && (
                              <p className="text-slate-400 text-sm">Department: {record.employeeId.department}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-2xl font-bold text-secondary">
                            {formatCurrency(record.calculatedSalary)}
                          </div>
                          <div className="text-slate-400 text-sm">Base: {formatCurrency(record.baseSalary)}</div>
                          <div className="text-accent text-sm">
                            Bonus: {formatCurrency(record.breakdown.performanceBonus)}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 bg-transparent"
                              onClick={() => handleViewBreakdown(record)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-600 text-slate-300 bg-transparent"
                                onClick={() => handleUpdateStatus(record)}
                              >
                                <Settings className="w-3 h-3 mr-1" />
                                Status
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 bg-transparent"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No salary records found</p>
                      {isAdmin && (
                        <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={handleCalculateSalary}>
                          <Calculator className="w-4 h-4 mr-2" />
                          Calculate First Salary
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modals */}
          <SalaryBreakdownModal
            open={showBreakdownModal}
            onOpenChange={setShowBreakdownModal}
            salaryRecord={selectedSalaryRecord}
          />
          <SalaryStatusModal
            open={showStatusModal}
            onOpenChange={setShowStatusModal}
            salaryRecord={selectedSalaryRecord}
            onSuccess={loadSalaryHistory}
          />
          <PerformanceApprovalModal
            open={showApprovalModal}
            onOpenChange={setShowApprovalModal}
            onSuccess={handleApprovalSuccess}
          />
        </div>
      )}
    </DashboardLayout>
  )
}
