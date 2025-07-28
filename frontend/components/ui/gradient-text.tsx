import type React from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  gradient?: "primary" | "secondary" | "accent" | "rainbow"
}

export function GradientText({ children, className, gradient = "primary" }: GradientTextProps) {
  const gradients = {
    primary: "bg-gradient-to-r from-primary to-primary/80",
    secondary: "bg-gradient-to-r from-secondary to-secondary/80",
    accent: "bg-gradient-to-r from-accent to-accent/80",
    rainbow: "bg-gradient-to-r from-primary via-secondary to-accent",
  }

  return <span className={cn(gradients[gradient], "bg-clip-text text-transparent", className)}>{children}</span>
}
