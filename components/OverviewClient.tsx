"use client"

import { TabNavigation } from "@/components/TabNavigation"
import { GolfGreeting } from "@/components/GolfGreeting"
import type { PlayerOverview } from "@/app/actions/overview"
import { TrendingUp, MapPin, Calendar, Hash } from "lucide-react"

interface OverviewClientProps {
  playerOverviews: PlayerOverview[]
  isAuthenticated: boolean
  profilePictureUrl?: string | null
  displayName?: string | null
  userEmail?: string | null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No rounds yet"
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getHandicapColor(handicap: number): string {
  if (handicap <= 5) return "text-emerald-400"
  if (handicap <= 10) return "text-green-400"
  if (handicap <= 15) return "text-yellow-400"
  if (handicap <= 20) return "text-orange-400"
  return "text-red-400"
}

export function OverviewClient({
  playerOverviews,
  isAuthenticated,
  profilePictureUrl,
  displayName,
  userEmail,
}: OverviewClientProps) {
  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <GolfGreeting
          displayName={displayName}
          email={userEmail}
          isAuthenticated={isAuthenticated}
        />
        <TabNavigation
          isAuthenticated={isAuthenticated}
          profilePictureUrl={profilePictureUrl}
          displayName={displayName}
        />

        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight text-balance">
            Performance Overview
          </h1>
          <p className="text-slate-300 text-lg">
            See how everyone is playing across the board
          </p>
        </div>

        {playerOverviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">
              No players yet. Head to the Handicap Tracker to add players and
              rounds.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playerOverviews.map((player, index) => (
              <div
                key={player.playerId}
                className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-xl overflow-hidden hover:border-slate-700 transition-colors"
              >
                {/* Rank badge for top 3 */}
                {index < 3 && player.totalRounds > 0 && (
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                        index === 0
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : index === 1
                            ? "bg-slate-400/20 text-slate-300 border border-slate-400/30"
                            : "bg-amber-700/20 text-amber-500 border border-amber-700/30"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>
                )}

                <div className="p-5">
                  {/* Player name and handicap */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {player.playerName}
                      </h3>
                      {player.favoriteCourse && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Home: {player.favoriteCourse}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold tabular-nums ${
                          player.totalRounds >= 3
                            ? getHandicapColor(player.handicap)
                            : "text-slate-500"
                        }`}
                      >
                        {player.totalRounds >= 3
                          ? player.handicap.toFixed(1)
                          : "--"}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Handicap
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        {player.totalRounds}{" "}
                        {player.totalRounds === 1 ? "round" : "rounds"}
                      </span>
                    </div>
                    {player.lastScore && (
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                        <span>Last: {player.lastScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Last played */}
                  {player.lastCourse && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500/70" />
                        <span className="text-slate-300 truncate">
                          {player.lastCourse}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(player.lastDate)}</span>
                      </div>
                    </div>
                  )}

                  {!player.lastCourse && (
                    <div className="mt-3 pt-3 border-t border-slate-800/60">
                      <p className="text-sm text-slate-500 italic">
                        No rounds recorded yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
