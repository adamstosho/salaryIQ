"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import type { User } from "@/lib/types"
import { Users, Search, Plus, Edit, Trash2, Mail, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AddUserModal } from "@/components/users/AddUserModal"
import { EditUserModal } from "@/components/users/EditUserModal"

export default function UsersPage() {
  const { isAdmin, authLoading } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadUsers()
    }
  }, [currentPage, authLoading, isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUsers(currentPage, 10)
      setUsers(response.data.users)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await apiClient.deleteUser(userId)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleAddUserSuccess = () => {
    loadUsers()
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleEditUserSuccess = () => {
    loadUsers()
    setSelectedUser(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    }).format(Math.round(amount))
  }

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!authLoading && !isAdmin) {
    return (
      <DashboardLayout title="Access Denied">
        <div className="text-center py-12">
          <p className="text-slate-400">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="User Management"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}
    >
      {authLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* Users List */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                All Users
              </CardTitle>
              <CardDescription className="text-slate-400">Manage system users and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors gap-4"
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <Avatar className="w-12 h-12 flex-shrink-0">
                            <AvatarFallback className="bg-primary text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                              <h3 className="text-white font-medium truncate">{user.name}</h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                                {!user.isActive && <Badge variant="destructive">Inactive</Badge>}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
                              <div className="flex items-center text-slate-400 text-sm">
                                <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate lg:w-full w-36">{user.email}</span>
                              </div>
                              <div className="flex items-center text-slate-400 text-sm">
                                <Building className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span className="truncate lg:w-full w-36">{user.department}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                          <div className="text-left sm:text-right">
                            <div className="text-white font-medium">{formatCurrency(user.baseSalary)}</div>
                            <div className="text-slate-400 text-sm">Base Salary</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 bg-transparent"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white bg-transparent"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No users found</p>
                      <Button className="mt-4 bg-primary hover:bg-primary/90" onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First User
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

      {/* Add User Modal */}
      <AddUserModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={handleAddUserSuccess}
      />

      {/* Edit User Modal */}
      <EditUserModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={handleEditUserSuccess}
        user={selectedUser}
      />
    </DashboardLayout>
  )
}
