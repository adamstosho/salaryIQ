"use client"

import React from "react"
import { Search, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

interface HeaderProps {
  title: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  onMobileMenuClick?: () => void
}

export function Header({ title, breadcrumbs, onMobileMenuClick }: HeaderProps) {
  const { user, authLoading } = useAuth()

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          {onMobileMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuClick}
              className="text-slate-400 hover:text-white hover:bg-slate-700 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <div className="min-w-0 flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-white truncate">{title}</h1>
            {breadcrumbs && (
              <nav className="flex items-center space-x-2 text-sm text-slate-400 mt-1 overflow-x-auto">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="hidden sm:inline">/</span>}
                    <span className={cn(
                      index === breadcrumbs.length - 1 ? "text-white" : "hover:text-slate-300",
                      "whitespace-nowrap"
                    )}>
                      {crumb.label}
                    </span>
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search - hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search..."
              className="pl-10 w-48 lg:w-64 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          {/* User Avatar */}
          {!authLoading && user && (
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="relative text-slate-400 hover:text-white p-0 h-auto">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-white text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
