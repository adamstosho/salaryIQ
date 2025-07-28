"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import type { SalaryHistory } from "@/lib/types"
import { CheckCircle, Clock, DollarSign } from "lucide-react"

interface SalaryStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salaryRecord: SalaryHistory | null
  onSuccess: () => void
}

export function SalaryStatusModal({ open, onOpenChange, salaryRecord, onSuccess }: SalaryStatusModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!salaryRecord || !status) {
      toast({
        title: "Validation Error",
        description: "Please select a status",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await apiClient.updateSalaryStatus(salaryRecord._id, status)
      
      toast({
        title: "Success",
        description: `Salary status updated to ${status}`,
      })
      
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update salary status",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "paid":
        return <DollarSign className="w-4 h-4 text-blue-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  if (!salaryRecord) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Update Salary Status</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update the status for {salaryRecord.employeeId.name}'s salary for {salaryRecord.period}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Salary Info */}
          <div className="p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Current Status:</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(salaryRecord.status)}
                <span className="text-sm font-medium capitalize">{salaryRecord.status}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Salary:</span>
              <span className="text-lg font-bold text-secondary">
                {formatCurrency(salaryRecord.calculatedSalary)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Performance Bonus:</span>
              <span className="text-sm text-accent">
                {formatCurrency(salaryRecord.breakdown.performanceBonus)}
              </span>
            </div>
          </div>

          {/* Status Update Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">
                New Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="approved">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Approved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="paid">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <span>Paid</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-slate-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !status}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 