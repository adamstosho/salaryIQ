"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  DollarSign,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onMobileClose?: () => void
}

export function Sidebar({ collapsed, onToggle, onMobileClose }: SidebarProps) {
  const { user, logout, isAdmin, authLoading } = useAuth()
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: Users,
      current: pathname.startsWith("/profile"),
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
      current: pathname.startsWith("/users"),
      adminOnly: true,
    },
    {
      name: "Performance",
      href: "/performance",
      icon: TrendingUp,
      current: pathname.startsWith("/performance"),
    },
    {
      name: "Salary",
      href: "/salary",
      icon: DollarSign,
      current: pathname.startsWith("/salary"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: pathname.startsWith("/settings"),
      adminOnly: true,
    },
  ]

  const filteredNavigation = navigation.filter((item) => !item.adminOnly || (!authLoading && isAdmin))

  const handleLogout = () => {
    logout()
    if (onMobileClose) onMobileClose()
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        "lg:relative"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">SalaryGen</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          {/* Mobile close button */}
          {onMobileClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {/* Desktop toggle button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-slate-400 hover:text-white hover:bg-slate-800 hidden lg:flex"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                item.current
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
                collapsed && "justify-center"
              )}
            >
              <Icon className={cn("w-5 h-5", collapsed ? "mr-0" : "mr-3")} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      {!authLoading && user && (
        <div className="p-4 border-t border-slate-800">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "space-x-3")}>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-white text-sm">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                <Badge className="mt-1 text-xs" variant="secondary">
                  {user.role}
                </Badge>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
