// Dropdown selector for choosing which player to view
// Shows the selected player's info and a button to view their full profile
"use client"

import type React from "react"
import { ChevronRight } from "lucide-react"
import type { Player } from "@/lib/types"

interface PlayerSelectorProps {
  players: Player[]
  selectedPlayerId: string | null
  onPlayerChange: (playerId: string) => void
  onViewProfile: () => void
}

export function PlayerSelector({
  players,
  selectedPlayerId,
  onPlayerChange,
  onViewProfile,
}: PlayerSelectorProps) {
  // Find the full player object for the selected ID
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId)

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col">
      <h2 className="text-xl font-semibold text-white mb-4">Select Player</h2>

      {/* Controlled select dropdown */}
      <select
        value={selectedPlayerId || ""}
        onChange={(e) => onPlayerChange(e.target.value)}
        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
      >
        {players.map((p) => (
          <option key={p.id} value={p.id} className="bg-slate-800">
            {p.name}
          </option>
        ))}
      </select>

      {/* Show player info if someone is selected */}
      {selectedPlayer && (
        <div className="mt-4 flex-1 flex flex-col justify-between">
          <div className="text-sm text-slate-400">
            <span className="font-medium">Home Course:</span>{" "}
            {selectedPlayer.favorite_course || "Not set"}
          </div>
          
          {/* Button to navigate to full profile view */}
          <button
            onClick={onViewProfile}
            className="mt-3 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
          >
            View Full Profile
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
