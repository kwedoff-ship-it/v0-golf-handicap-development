// Reusable card component for displaying metrics
// Used for things like handicap, total rounds, etc.
import type React from "react"

interface KPICardProps {
  label: string
  value: string | number
  subtitle?: string
}

export function KPICard({ label, value, subtitle }: KPICardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 shadow-xl border border-emerald-500/20 flex flex-col justify-center">
      <div className="text-center">
        <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide mb-2">
          {label}
        </p>
        
        <p className="text-6xl font-bold text-white mb-1">
          {value}
        </p>
        
        {subtitle && (
          <p className="text-emerald-100 text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
