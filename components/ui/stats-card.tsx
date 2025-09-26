"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: "increase" | "decrease" | "neutral"
  }
  icon?: LucideIcon
  description?: string
  className?: string
}

export function StatsCard({ title, value, change, icon: Icon, description, className }: StatsCardProps) {
  return (
    <Card className={cn("animate-fade-in-up", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-2">
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {change && (
            <Badge
              variant={
                change.type === "increase" ? "default" : change.type === "decrease" ? "destructive" : "secondary"
              }
              className="text-xs"
            >
              {change.type === "increase" ? "+" : change.type === "decrease" ? "-" : ""}
              {change.value}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
