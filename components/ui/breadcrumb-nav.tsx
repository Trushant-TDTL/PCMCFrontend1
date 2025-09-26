"use client"

import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const dashboardTitles: Record<string, string> = {
  "/pcmcs/": "Overview",
  "/pcmcs/population": "Population Analytics",
  "/pcmcs/infrastructure": "Infrastructure",
  "/pcmcs/transportation": "Transportation",
  "/pcmcs/utilities": "Utilities",
  "/pcmcs/water": "Water Management",
  "/pcmcs/geographic": "Geographic Data",
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const currentTitle = dashboardTitles[pathname] || "Dashboard"

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground font-medium">{currentTitle}</span>
    </nav>
  )
}
