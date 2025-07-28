"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import type { Settings } from "@/lib/types"
import { SettingsIcon, Save, RotateCcw, Activity, Database, Users, TrendingUp, Clock, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function SettingsPage() {
  const { isAdmin, authLoading } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [salaryMultiplier, setSalaryMultiplier] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  
  const [automationSettings, setAutomationSettings] = useState<any>(null)
  const [automatedSalaryCalculation, setAutomatedSalaryCalculation] = useState(false)
  const [salaryCalculationDay, setSalaryCalculationDay] = useState("1")

  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadSettings()
      loadAutomationSettings()
      loadSystemHealth()
    }
  }, [authLoading, isAdmin])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getSettings() as any
      setSettings(response.data.settings)
      setSalaryMultiplier(response.data.settings.salaryMultiplier.toString())
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAutomationSettings = async () => {
    try {
      const response = await apiClient.getAutomationSettings() as any
      setAutomationSettings(response.data)
      setAutomatedSalaryCalculation(response.data.automatedSalaryCalculation)
      setSalaryCalculationDay(response.data.salaryCalculationDay.toString())
    } catch (error) {
      console.error("Error loading automation settings:", error)
    }
  }

  const loadSystemHealth = async () => {
    try {
      const response = await apiClient.getSystemHealth() as any
      setSystemHealth(response.data)
    } catch (error) {
      console.error("Error loading system health:", error)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      await apiClient.updateSettings({
        salaryMultiplier: Number.parseFloat(salaryMultiplier),
      })

      toast({
        title: "Success",
        description: "Settings updated successfully",
      })

      loadSettings()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAutomationSettings = async () => {
    try {
      setSaving(true)
      await apiClient.updateAutomationSettings({
        automatedSalaryCalculation,
        salaryCalculationDay: Number.parseInt(salaryCalculationDay),
      })

      toast({
        title: "Success",
        description: "Automation settings updated successfully",
      })

      loadAutomationSettings()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update automation settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetSettings = async () => {
    if (!confirm("Are you sure you want to reset all settings to defaults?")) return

    try {
      await apiClient.resetSettings()
      toast({
        title: "Success",
        description: "Settings reset to defaults",
      })
      loadSettings()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset settings",
        variant: "destructive",
      })
    }
  }

  if (!authLoading && !isAdmin) {
    return (
      <DashboardLayout title="Access Denied">
        <div className="text-center py-12">
          <p className="text-slate-400">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (authLoading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Settings" breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}>
      <div className="space-y-6">
        {/* Global Settings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Global Settings
            </CardTitle>
            <CardDescription className="text-slate-400">Configure system-wide settings and parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="multiplier" className="text-white">
                Salary Multiplier
              </Label>
              <Input
                id="multiplier"
                type="number"
                step="0.1"
                min="0"
                value={salaryMultiplier}
                onChange={(e) => setSalaryMultiplier(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter salary multiplier"
              />
              <p className="text-slate-400 text-sm">
                This multiplier is applied to performance scores when calculating salaries
              </p>
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleSaveSettings} disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleResetSettings}
                className="border-slate-600 text-slate-300 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Automation Settings */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Automation Settings
            </CardTitle>
            <CardDescription className="text-slate-400">Configure automated salary calculations and scheduling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Automated Salary Calculation</Label>
                  <p className="text-slate-400 text-sm">
                    Automatically calculate salaries on a scheduled basis
                  </p>
                </div>
                <Switch
                  checked={automatedSalaryCalculation}
                  onCheckedChange={setAutomatedSalaryCalculation}
                />
              </div>

              {automatedSalaryCalculation && (
                <div className="space-y-2">
                  <Label htmlFor="calculationDay" className="text-white">
                    Calculation Day of Month
                  </Label>
                  <Input
                    id="calculationDay"
                    type="number"
                    min="1"
                    max="28"
                    value={salaryCalculationDay}
                    onChange={(e) => setSalaryCalculationDay(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white w-32"
                    placeholder="1-28"
                  />
                  <p className="text-slate-400 text-sm">
                    Day of the month when salaries will be automatically calculated (1-28)
                  </p>
                </div>
              )}

              {automationSettings && (
                <div className="p-4 bg-slate-700 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Automated Calculation:</span>
                    <span className="text-white">
                      {automationSettings.lastAutomatedCalculation 
                        ? format(new Date(automationSettings.lastAutomatedCalculation), "PPpp")
                        : "Never"
                      }
                    </span>
                  </div>
                  {automationSettings.nextScheduledCalculation && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Next Scheduled Calculation:</span>
                      <span className="text-white">
                        {format(new Date(automationSettings.nextScheduledCalculation), "PPpp")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleSaveAutomationSettings} disabled={saving} className="bg-primary hover:bg-primary/90">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Automation Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Statistics */}
        {settings && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Database className="w-5 h-5 mr-2" />
                System Statistics
              </CardTitle>
              <CardDescription className="text-slate-400">Overview of system data and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{settings.systemStats.totalEmployees}</div>
                  <div className="text-slate-400 text-sm">Total Employees</div>
                </div>
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{settings.systemStats.totalPerformanceRecords}</div>
                  <div className="text-slate-400 text-sm">Performance Records</div>
                </div>
                <div className="text-center p-4 bg-slate-700 rounded-lg">
                  <Database className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{settings.systemStats.totalSalariesGenerated}</div>
                  <div className="text-slate-400 text-sm">Salaries Generated</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="text-white">
                    {settings.systemStats.lastUpdated ? format(new Date(settings.systemStats.lastUpdated), "PPpp") : "Unknown"}
                  </span>
                </div>
                {settings.lastSalaryCalculation && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-slate-400">Last Salary Calculation:</span>
                    <span className="text-white">
                      {format(new Date(settings.lastSalaryCalculation), "PPpp")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Health */}
        {systemHealth && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                System Health
              </CardTitle>
              <CardDescription className="text-slate-400">Current system status and health checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Overall Status:</span>
                  <Badge className={systemHealth.status === "healthy" ? "bg-secondary" : "bg-red-500"}>
                    {systemHealth.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(systemHealth.checks).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-slate-400 capitalize">{key}:</span>
                      <Badge
                        className={
                          value === "connected" || value === "available" || value === "accessible"
                            ? "bg-secondary"
                            : "bg-red-500"
                        }
                      >
                        {value as string}
                      </Badge>
                    </div>
                  ))}
                </div>

                {systemHealth.collections && (
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Collection Counts:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(systemHealth.collections).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                          <span className="text-slate-400 capitalize">{key}:</span>
                          <span className="text-white font-medium">{value as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
