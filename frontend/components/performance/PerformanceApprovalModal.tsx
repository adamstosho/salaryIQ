"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, User, Calendar, Star } from "lucide-react"

interface PerformanceRecord {
  _id: string
  employeeId: {
    _id: string
    name: string
    email: string
    department: string
  }
  taskName: string
  score: number
  difficulty: string
  clientFeedback?: string
  date: string
  notes?: string
  isApproved: boolean
}

interface PerformanceApprovalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PerformanceApprovalModal({ open, onOpenChange, onSuccess }: PerformanceApprovalModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pendingRecords, setPendingRecords] = useState<PerformanceRecord[]>([])
  const [selectedRecords, setSelectedRecords] = useState<string[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [loadingRecords, setLoadingRecords] = useState(false)

  const getRecentPeriods = (): string[] => {
    const periods: string[] = []
    const currentDate = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      periods.push(period)
    }
    
    return periods
  }

  useEffect(() => {
    if (open && selectedPeriod) {
      loadPendingRecords()
    }
  }, [open, selectedPeriod])

  const loadPendingRecords = async () => {
    if (!selectedPeriod) return

    try {
      setLoadingRecords(true)
      const response = await apiClient.getPendingPerformanceRecords(selectedPeriod)
      setPendingRecords(response.data.pendingRecords)
      setSelectedRecords([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending performance records",
        variant: "destructive",
      })
    } finally {
      setLoadingRecords(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedRecords.length === pendingRecords.length) {
      setSelectedRecords([])
    } else {
      setSelectedRecords(pendingRecords.map(record => record._id))
    }
  }

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    )
  }

  const handleApprove = async () => {
    if (selectedRecords.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one performance record",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await apiClient.approvePerformanceForSalary(selectedRecords, selectedPeriod)
      
      toast({
        title: "Success",
        description: `Approved ${selectedRecords.length} performance records for salary calculation`,
      })
      
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve performance records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/20 text-green-400"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "hard":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white">Approve Performance Records</DialogTitle>
          <DialogDescription className="text-slate-400">
            Select performance records to approve for salary calculation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Period Selection */}
          <div className="space-y-2">
            <Label htmlFor="period" className="text-white">
              Select Period
            </Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {getRecentPeriods().map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Records List */}
          {selectedPeriod && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">
                  Pending Records ({pendingRecords.length})
                </h3>
                {pendingRecords.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="border-slate-600 text-slate-300 bg-transparent"
                  >
                    {selectedRecords.length === pendingRecords.length ? "Deselect All" : "Select All"}
                  </Button>
                )}
              </div>

              {loadingRecords ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : pendingRecords.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pendingRecords.map((record) => (
                    <div
                      key={record._id}
                      className={`p-4 bg-slate-700 rounded-lg border-2 transition-colors ${
                        selectedRecords.includes(record._id)
                          ? "border-primary bg-slate-600"
                          : "border-slate-600"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedRecords.includes(record._id)}
                          onCheckedChange={() => handleSelectRecord(record._id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-medium">{record.taskName}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getDifficultyColor(record.difficulty)}>
                                {record.difficulty}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium">{record.score}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{record.employeeId.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(record.date)}</span>
                            </div>
                          </div>

                          {record.clientFeedback && (
                            <p className="text-sm text-slate-300 bg-slate-600 p-2 rounded">
                              <strong>Client Feedback:</strong> {record.clientFeedback}
                            </p>
                          )}

                          {record.notes && (
                            <p className="text-sm text-slate-300 bg-slate-600 p-2 rounded">
                              <strong>Notes:</strong> {record.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-slate-400">No pending performance records for this period</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {selectedRecords.length > 0 && (
            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-600">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-slate-300 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve {selectedRecords.length} Records
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 