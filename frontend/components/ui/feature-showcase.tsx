"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, DollarSign } from "lucide-react"

const features = [
  {
    id: "performance",
    title: "Performance Tracking",
    description: "Advanced performance monitoring with real-time analytics",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10",
    details: [
      "Real-time performance scoring",
      "Task difficulty weighting",
      "Client feedback integration",
      "Approval workflows",
    ],
  },
  {
    id: "users",
    title: "User Management",
    description: "Complete user lifecycle management with role-based access",
    icon: Users,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    details: ["Role-based permissions", "Department organization", "User activity tracking", "Profile management"],
  },
  {
    id: "salary",
    title: "Salary Automation",
    description: "Intelligent salary calculation based on performance metrics",
    icon: DollarSign,
    color: "text-accent",
    bgColor: "bg-accent/10",
    details: ["Automated calculations", "Performance bonuses", "Salary history tracking", "Detailed breakdowns"],
  },
]

export function FeatureShowcase() {
  const [activeFeature, setActiveFeature] = useState("performance")

  const currentFeature = features.find((f) => f.id === activeFeature) || features[0]
  const Icon = currentFeature.icon

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        <div className="space-y-4">
          {features.map((feature) => {
            const FeatureIcon = feature.icon
            return (
              <Button
                key={feature.id}
                variant={activeFeature === feature.id ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-4 ${
                  activeFeature === feature.id
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "text-slate-400 hover:text-white"
                }`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <FeatureIcon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{feature.title}</div>
                  <div className="text-sm opacity-80">{feature.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8">
          <div className={`w-16 h-16 ${currentFeature.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
            <Icon className={`w-8 h-8 ${currentFeature.color}`} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">{currentFeature.title}</h3>
          <p className="text-slate-400 mb-6">{currentFeature.description}</p>
          <div className="space-y-3">
            {currentFeature.details.map((detail, index) => (
              <div key={index} className="flex items-center text-slate-300">
                <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                {detail}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
