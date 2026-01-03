// Detailed profile view for a player
// Shows handicap, stats, trend chart, and full round history
"use client"

import { useMemo } from "react"
import { ArrowLeft } from "lucide-react"
import type { Player, Round } from "@/lib/types"
import { calculateHandicap, calculateHandicapHistory } from "@/lib/handicap"
import { KPICard } from "./KPICard"
import { HandicapChart } from "./HandicapChart"
import { RoundTable } from "./RoundTable"

interface ProfileProps {
  player: Player
  rounds: Round[]
  onBack: () => void
}

export function Profile({ player, rounds, onBack }: ProfileProps) {
  // Calculate handicap (memoized so it only recalculates when rounds change)
  const handicap = useMemo(() => calculateHandicap(rounds), [rounds])

  // Get handicap history for the chart (last 6 months)
  const handicapHistory = useMemo(
    () => calculateHandicapHistory(rounds),
    [rounds]
  )

  // Sort rounds by date (newest first)
  const sortedRounds = useMemo(() => {
    return [...rounds].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [rounds])

  // Calculate average score
  const averageScore = useMemo(() => {
    if (rounds.length === 0) return "N/A"
    return (rounds.reduce((sum, r) => sum + r.score, 0) / rounds.length).toFixed(
      1
    )
  }, [rounds])

  // Find best (lowest) score
  const bestScore = useMemo(() => {
    if (rounds.length === 0) return "N/A"
    return Math.min(...rounds.map((r) => r.score))
  }, [rounds])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Player header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{player.name}</h1>
          <p className="text-slate-400">
            Home Course: {player.favorite_course || "Not set"}
          </p>
        </div>

        {/* Two-column layout: stats on left, charts/history on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Current stats */}
          <div className="space-y-6">
            {/* Handicap card */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-8 shadow-xl border border-emerald-500/20">
              <div className="text-center">
                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide mb-2">
                  Current Handicap Index
                </p>
                <p className="text-6xl font-bold text-white mb-1">{handicap}</p>
                <p className="text-emerald-100 text-sm">
                  Based on {rounds.length} round{rounds.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Statistics card */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Rounds</span>
                  <span className="text-white font-semibold">{rounds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Score</span>
                  <span className="text-white font-semibold">{averageScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Best Score</span>
                  <span className="text-emerald-400 font-semibold">
                    {bestScore}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Charts and full history */}
          <div className="lg:col-span-2 space-y-6">
            {/* Handicap trend chart */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-6">
                Handicap Trend (6 Months)
              </h2>
              <HandicapChart data={handicapHistory} />
            </div>

            {/* All rounds table */}
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-semibold text-white">All Rounds</h2>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <RoundTable rounds={sortedRounds} showDifferential />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
