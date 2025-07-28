"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp } from "lucide-react"

interface AddPerformanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddPerformanceModal({ open, onOpenChange, onSuccess }: AddPerformanceModalProps) {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    taskName: "",
    score: "",
    difficulty: "",
    clientFeedback: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.taskName || !formData.score || !formData.difficulty) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      const performanceData = {
        taskName: formData.taskName,
        score: Number(formData.score),
        difficulty: formData.difficulty as "easy" | "medium" | "hard",
        clientFeedback: formData.clientFeedback || undefined,
        notes: formData.notes || undefined,
        date: new Date(formData.date).toISOString(),
      }

      await apiClient.createPerformanceRecord(performanceData)
      
      toast({
        title: "Success",
        description: "Performance record created successfully",
      })
      
      setFormData({
        taskName: "",
        score: "",
        difficulty: "",
        clientFeedback: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      })
      
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create performance record",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Add Performance Record
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-white">
              Task Name *
            </Label>
            <Input
              id="taskName"
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Enter task name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="score" className="text-white">
                Score (0-100) *
              </Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="85"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-white">
                Difficulty *
              </Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-white">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientFeedback" className="text-white">
              Client Feedback
            </Label>
            <Textarea
              id="clientFeedback"
              value={formData.clientFeedback}
              onChange={(e) => setFormData({ ...formData, clientFeedback: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Optional client feedback"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Record"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 