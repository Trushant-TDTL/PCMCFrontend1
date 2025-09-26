"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  BarChart3,
  Building2,
  Users,
  MapPin,
  Truck,
  Zap,
  Droplets,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react"

const dashboards = [
  {
    title: "PCMC Environment Conservation",
    href: "/pcmcs",
    icon: LayoutDashboard,
    description: "AI & Analytics Blueprint",
  },
  {
    title: "PCMC Sustainable Transport & Mobility",
    href: "/pcmcs/transportation",
    icon: Users,
    description: "AI & Analytics Blueprint",
  },
  {
    title: "PCMC Sustainable Finance & Innovation",
    href: "/pcmcs/infrastructure",
    icon: Building2,
    description: "AI & Analytics Blueprint",
  },
  {
    title: "PCMC Social Development",
    href: "/pcmcs/population",
    icon: Truck,
    description: "AI & Analytics Blueprint",
  },
  {
    title: "PCMC Sustainable Urban Landscape",
    href: "/pcmcs/utilities",
    icon: Zap,
    description: "AI & Analytics Blueprint",
  },
  {
    title: "PCMC Disaster Resilience",
    href: "/pcmcs/water",
    icon: Droplets,
    description: "AI & Analytics Blueprint",
  },
  {
    title: "PCMC Project Monitoring & Evaluation",
    href: "/pcmcs/geographic",
    icon: MapPin,
    description: "AI & Analytics Blueprint",
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "relative z-30 flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute z-50 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background shadow-md transition-all duration-300",
          "top-20",
          collapsed ? "left-16" : "left-64"
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Header */}
      <div className="p-6 h-[80px]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold">Dashboards</h2>
              <p className="text-xs text-muted-foreground">Analytics & Reports</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Navigation with Tooltips */}
      <TooltipProvider delayDuration={0}>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 py-4">
            {dashboards.map((dashboard) => {
              const isActive = pathname === dashboard.href
              const Icon = dashboard.icon

              return collapsed ? (
                // --- CORRECTED COLLAPSED VIEW WITH PROPER HOVER UI ---
                <Tooltip key={dashboard.href}>
                  <TooltipTrigger asChild>
                    <div className="flex justify-center">
                      <Link
                        href={dashboard.href}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200",
                          "hover:bg-primary/10 hover:text-primary",
                          isActive 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "text-muted-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="sr-only">{dashboard.title}</span>
                      </Link>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="border bg-popover text-popover-foreground">
                    <p className="font-semibold">{dashboard.title}</p>
                    <p className="text-xs text-muted-foreground">{dashboard.description}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                // --- EXPANDED VIEW WITH IMPROVED HOVER UI ---
                <Link key={dashboard.href} href={dashboard.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-12 transition-all duration-200",
                      "hover:bg-primary/10 hover:text-primary",
                      isActive && "bg-primary/10 text-primary border-primary/20",
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{dashboard.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{dashboard.description}</span>
                    </div>
                  </Button>
                </Link>
              )
            })}
          </div>
        </ScrollArea>
      </TooltipProvider>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <p>PCMC Dashboard v2.0</p>
            <p>© 2025 Pune Municipal Corporation</p>
          </div>
        </div>
      )}
    </div>
  )
}