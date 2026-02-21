"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Settings, LogOut, User } from "lucide-react"
import { logout } from "@/app/actions/auth"

interface UserMenuProps {
  profilePictureUrl?: string | null
  displayName?: string | null
  isAuthenticated: boolean
}

export function UserMenu({ profilePictureUrl, displayName, isAuthenticated }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!isAuthenticated) {
    return (
      <button
        onClick={async () => {
          await logout()
        }}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
        aria-label="Log out"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    )
  }

  const handleLogout = async () => {
    setOpen(false)
    await logout()
  }

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 overflow-hidden hover:border-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          <span className="text-sm font-semibold text-emerald-400">{initials}</span>
        ) : (
          <User className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-700 bg-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm font-medium text-white truncate">
              {displayName || "Player"}
            </p>
          </div>
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false)
                router.push("/settings")
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              Profile Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700/50 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
