"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Settings } from "lucide-react"

interface TabNavigationProps {
  isAuthenticated?: boolean
}

export function TabNavigation({ isAuthenticated = false }: TabNavigationProps) {
  const pathname = usePathname()

  const tabs = [
    { name: "Handicap Tracker", href: "/", icon: Home },
    { name: "Course Reviews", href: "/reviews", icon: MessageSquare },
    ...(isAuthenticated
      ? [{ name: "Settings", href: "/settings", icon: Settings }]
      : []),
  ]

  return (
    <div className="mb-6 flex gap-2 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-2 shadow-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors ${
              isActive ? "bg-emerald-600 text-white shadow-md" : "text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:inline">{tab.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
