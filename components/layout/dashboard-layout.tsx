"use client"

import type React from "react"

import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-[calc(100vh-4rem)] overflow-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
