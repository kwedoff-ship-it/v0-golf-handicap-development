// Main dashboard view
// Shows player selector, KPI cards, recent rounds, and forms to add data
"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { Player, Round } from "@/lib/types"
import { calculateHandicap } from "@/lib/handicap"
import { PlayerSelector } from "./PlayerSelector"
import { KPICard } from "./KPICard"
import { RoundTable } from "./RoundTable"
import { AddPlayerForm } from "./AddPlayerForm"
import { AddRoundForm } from "./AddRoundForm"


interface DashboardProps {
  players: Player[]
  selectedPlayerId: string | null
  rounds: Round[]
  onPlayerChange: (playerId: string) => void
  onViewProfile: () => void
  onAddPlayer: (player: { name: string; favorite_course: string }) => Promise<{
    success: boolean
    error?: string
  }>
  onAddRound: (round: {
    player_id: string
    date: string
    course: string
    tee: string
    rating: number
    slope: number
    score: number
  }) => Promise<{ success: boolean; error?: string }>
}

export function Dashboard({
  players,
  selectedPlayerId,
  rounds,
  onPlayerChange,
  onViewProfile,
  onAddPlayer,
  onAddRound,
}: DashboardProps) {
  // Calculate current handicap (memoized)
  const handicap = useMemo(() => calculateHandicap(rounds), [rounds])

  // Count rounds from this year
  const roundsThisYear = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return rounds.filter((round) => {
      const roundYear = new Date(round.date).getFullYear()
      return roundYear === currentYear
    }).length
  }, [rounds])

  // Get last 10 rounds sorted by date (newest first)
  const recentRounds = useMemo(() => {
    return [...rounds].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
  }, [rounds])

  return (
    <main className="space-y-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">Golf Handicap Tracker</h1>
        <p className="text-slate-300 text-lg">Track your rounds and monitor your progress</p>
        <Link href="/stats" className="inline-block mt-3 text-emerald-400 hover:text-emerald-300 text-sm underline">
          View Global Statistics →
        </Link>
      </div>

      {/* Player selector + KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <PlayerSelector
          players={players}
          selectedPlayerId={selectedPlayerId}
          onPlayerChange={onPlayerChange}
          onViewProfile={onViewProfile}
        />
        <KPICard
          label="Current Handicap Index"
          value={handicap}
          subtitle={`Based on ${rounds.length} round${rounds.length !== 1 ? "s" : ""}`}
        />
        <KPICard label="Rounds This Year" value={roundsThisYear} subtitle={new Date().getFullYear().toString()} />
        <KPICard label="Total Rounds" value={rounds.length} subtitle="All Time" />
      </div>

      {/* Recent rounds table */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Rounds (Last 10)</h2>
          {rounds.length > 10 && (
            <button
              onClick={onViewProfile}
              className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
            >
              View All
            </button>
          )}
        </div>
        <RoundTable rounds={recentRounds} />
      </div>

      {/* Add player and add round forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AddPlayerForm onAddPlayer={onAddPlayer} />
        <AddRoundForm onAddRound={onAddRound} playerId={selectedPlayerId} />
      </div>
    </main>
  )
}
