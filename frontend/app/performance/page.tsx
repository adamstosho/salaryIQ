"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import type { Performance } from "@/lib/types"
import { TrendingUp, Plus, Edit, Calendar, User, CheckCircle, Clock } from "lucide-react"
import { AddPerformanceModal } from "@/components/performance/AddPerformanceModal"
import { EditPerformanceModal } from "@/components/performance/EditPerformanceModal"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function PerformancePage() {
  const { isAdmin, authLoading } = useAuth()
  const { toast } = useToast()
  const [records, setRecords] = useState<Performance[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<Performance | null>(null)

  useEffect(() => {
    if (!authLoading) {
      loadPerformanceRecords()
    }
  }, [currentPage, authLoading])

  const loadPerformanceRecords = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getPerformanceRecords({
        page: currentPage,
        limit: 10,
      })
      setRecords((response as any).data.records)
      setTotalPages((response as any).data.pagination.pages)
    } catch (error) {
      console.error("Error loading performance records:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecordSuccess = () => {
    setShowAddModal(false)
    loadPerformanceRecords()
  }

  const handleEditRecord = (record: Performance) => {
    setSelectedRecord(record)
    setShowEditModal(true)
  }

  const handleEditRecordSuccess = () => {
    setShowEditModal(false)
    setSelectedRecord(null)
    loadPerformanceRecords()
  }

  const handleApproveRecord = async (record: Performance) => {
    try {
      await apiClient.approvePerformanceRecord(record._id)
      toast({
        title: "Success",
        description: "Performance record approved successfully",
      })
      loadPerformanceRecords()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve record",
        variant: "destructive",
      })
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 80) return "text-yellow-400"
    if (score >= 70) return "text-orange-400"
    return "text-red-400"
  }

  const calculateWeightedScore = (score: number, difficulty: string) => {
    const multipliers = {
      easy: 1.0,
      medium: 1.2,
      hard: 1.5
    }
    return score * (multipliers[difficulty as keyof typeof multipliers] || 1.0)
  }

  return (
    <DashboardLayout
      title="performanceIQ"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Performance" }]}
    >
      {authLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Performance Records</h2>
              <p className="text-slate-400">
                {isAdmin ? "Manage all employee performance records" : "Track your performance and achievements"}
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>

          {/* Performance Records */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Records
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isAdmin ? "All employee performance records" : "Your performance history and achievements"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.length > 0 ? (
                    records.map((record) => (
                      <div
                        key={record._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-white font-medium truncate lg:w-4/5 w-32">{record.taskName}</h3>
                          </div>
                          <div className="space-y-1">
                            {!authLoading && isAdmin && (
                              <div className="flex items-center text-slate-400 text-sm">
                                <User className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span>{record.employeeId.name}</span>
                              </div>
                            )}
                            {record.notes && (
                              <div className="text-slate-400 text-sm truncate">{record.notes}</div>
                            )}
                            <div className="flex items-center text-slate-400 text-sm">
                              <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span>{record.date ? format(new Date(record.date), "MMM dd, yyyy") : "Unknown"}</span>
                            </div>
                          </div>
                          {record.clientFeedback && (
                            <p className="text-slate-400 text-sm mt-2 italic truncate">"{record.clientFeedback}"</p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
                          <div className="flex items-center space-x-2">
                            <Badge className={getDifficultyColor(record.difficulty)}>{record.difficulty}</Badge>
                            {record.isApproved ? (
                              <Badge variant="default" className="bg-green-500/20 text-green-400 flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Approved</span>
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-yellow-500/20 text-yellow-400 flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Pending</span>
                              </Badge>
                            )}
                          </div>
                          <div className="text-left sm:text-right">
                            <div className={`text-lg font-bold ${getScoreColor(record.score)}`}>{record.score}%</div>
                            <div className="text-slate-400 text-xs">
                              Weighted: {Math.round(calculateWeightedScore(record.score, record.difficulty))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 bg-transparent"
                              onClick={() => handleEditRecord(record)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            {!authLoading && isAdmin && !record.isApproved && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-600 text-green-400 bg-transparent hover:bg-green-500/10"
                                onClick={() => handleApproveRecord(record)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No performance records found</p>
                      <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Record
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="border-slate-600 text-slate-300"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="border-slate-600 text-slate-300"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Performance Modal */}
      <AddPerformanceModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={handleAddRecordSuccess}
      />

      {/* Edit Performance Modal */}
      <EditPerformanceModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={handleEditRecordSuccess}
        record={selectedRecord}
      />
    </DashboardLayout>
  )
}
