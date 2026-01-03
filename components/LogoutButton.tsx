"use client"

import { logout } from "@/app/actions/auth"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
      aria-label="Logout"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  )
}
