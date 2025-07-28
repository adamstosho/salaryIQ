"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, TrendingUp, Calendar, User } from "lucide-react"
import type { SalaryHistory } from "@/lib/types"

interface SalaryBreakdownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salaryRecord: SalaryHistory | null
}

export function SalaryBreakdownModal({ open, onOpenChange, salaryRecord }: SalaryBreakdownModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [breakdownData, setBreakdownData] = useState<any>(null)

  useEffect(() => {
    if (open && salaryRecord) {
      loadBreakdownData()
    }
  }, [open, salaryRecord])

  const loadBreakdownData = async () => {
    if (!salaryRecord) return

    try {
      setLoading(true)
      const response = await apiClient.getSalaryBreakdown(salaryRecord.period)
      setBreakdownData(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load salary breakdown",
        variant: "destructive",
      })
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

  if (!salaryRecord) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Salary Breakdown - {salaryRecord.period}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Employee Info */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Name</p>
                    <p className="text-white font-medium">{salaryRecord.employeeId.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Department</p>
                    <p className="text-white font-medium">{salaryRecord.employeeId.department}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Period</p>
                    <p className="text-white font-medium">{salaryRecord.period}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    <Badge className={getStatusColor(salaryRecord.status)}>{salaryRecord.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary Breakdown */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Salary Calculation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-600 rounded-lg">
                    <p className="text-slate-400 text-sm">Base Salary</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(salaryRecord.baseSalary)}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-600 rounded-lg">
                    <p className="text-slate-400 text-sm">Performance Bonus</p>
                    <p className="text-2xl font-bold text-secondary">
                      {formatCurrency(salaryRecord.breakdown.performanceBonus)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-slate-600 rounded-lg">
                    <p className="text-slate-400 text-sm">Total Salary</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(salaryRecord.calculatedSalary)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Total Performance Score</p>
                    <p className="text-white font-medium">{Math.round(salaryRecord.totalScore)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Global Multiplier</p>
                    <p className="text-white font-medium">{salaryRecord.multiplier}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Records */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Performance Records ({salaryRecord.performanceRecords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salaryRecord.performanceRecords.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                      <div className="flex-1">
                        <p className="text-white font-medium">{record.taskName}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge variant="outline" className="border-slate-500 text-slate-300">
                            {record.difficulty}
                          </Badge>
                          <span className="text-slate-400 text-sm">Score: {record.score}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">Weighted: {Math.round(record.weightedScore)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calculation Details */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Calculation Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Calculated At:</span>
                    <span className="text-white">
                      {salaryRecord.calculatedAt ? new Date(salaryRecord.calculatedAt).toLocaleString() : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created At:</span>
                    <span className="text-white">
                      {salaryRecord.createdAt ? new Date(salaryRecord.createdAt).toLocaleString() : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Updated:</span>
                    <span className="text-white">
                      {salaryRecord.updatedAt ? new Date(salaryRecord.updatedAt).toLocaleString() : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 