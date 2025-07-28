"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Building, Calendar, Edit, Save, X } from "lucide-react"
import { format } from "date-fns"

export default function ProfilePage() {
  const { user, authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    baseSalary: "",
  })

  useEffect(() => {
    if (!authLoading && user) {
      setFormData({
        name: user.name,
        email: user.email,
        department: user.department,
        baseSalary: user.baseSalary.toString(),
      })
    }
  }, [user, authLoading])

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        baseSalary: Number(formData.baseSalary),
      }

      await apiClient.updateUser(user!._id, updateData)
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      
      setIsEditing(false)
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      department: user?.department || "",
      baseSalary: user?.baseSalary.toString() || "",
    })
    setIsEditing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount))
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return format(date, "MMMM dd, yyyy")
    } catch (error) {
      return "Invalid Date"
    }
  }

  const formatDateShort = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return format(date, "MMMM yyyy")
    } catch (error) {
      return "Invalid Date"
    }
  }

  if (authLoading || !user) {
    return (
      <DashboardLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Profile"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-slate-700">
          <div className="flex gap-4 justify-between items-start lg:flex-row flex-col">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-primary text-white text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
                <span className="text-slate-400">
                  Member since {formatDateShort(user.createdAt)}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your personal and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white font-medium">{user.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                ) : (
                  <div className="flex items-center text-white">
                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                    {user.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-white">
                  Department
                </Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                ) : (
                  <div className="flex items-center text-white">
                    <Building className="w-4 h-4 mr-2 text-slate-400" />
                    {user.department}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <span className="w-5 h-5 mr-2 text-center" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>₦</span>
                Employment Details
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your employment and salary information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseSalary" className="text-white">
                  Base Salary
                </Label>
                {isEditing ? (
                  <Input
                    id="baseSalary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                ) : (
                  <div className="flex items-center text-white">
                    <span className="w-4 h-4 mr-2 text-slate-400 text-center" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>₦</span>
                    {formatCurrency(user.baseSalary)}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white">
                  Role
                </Label>
                <div className="flex items-center text-white">
                  <User className="w-4 h-4 mr-2 text-slate-400" />
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">
                  Account Status
                </Label>
                <div className="flex items-center text-white">
                  <div className={`w-2 h-2 rounded-full mr-2 ${user.isActive ? "bg-green-500" : "bg-red-500"}`} />
                  {user.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">
                  Member Since
                </Label>
                <div className="flex items-center text-white">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {formatDate(user.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-slate-600 text-slate-300 bg-transparent"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
} 