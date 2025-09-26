"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  trend?: {
    value: string
    direction: "up" | "down"
  }
  className?: string
  onDrillDown?: () => void
}

export function ChartCard({ title, description, children, trend, className, onDrillDown }: ChartCardProps) {
  return (
    <Card className={cn("animate-fade-in-up", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.direction === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn("font-medium", trend.direction === "up" ? "text-green-500" : "text-red-500")}>
                {trend.value}
              </span>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDrillDown}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
