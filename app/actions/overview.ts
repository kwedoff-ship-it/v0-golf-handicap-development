"use server"

import { createClient } from "@/lib/supabase/server"
import { calculateHandicap } from "@/lib/handicap"
import type { Round } from "@/lib/types"

export type PlayerOverview = {
  playerId: string
  playerName: string
  handicap: number
  totalRounds: number
  lastCourse: string | null
  lastScore: number | null
  lastDate: string | null
  favoriteCourse: string | null
}

export async function getPerformanceOverview(): Promise<PlayerOverview[]> {
  try {
    const supabase = await createClient()

    // Get all players
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")

    if (playersError || !players) {
      console.error("Error fetching players:", playersError?.message)
      return []
    }

    // Get all rounds sorted by date descending
    const { data: allRounds, error: roundsError } = await supabase
      .from("rounds")
      .select("*")
      .order("date", { ascending: false })

    if (roundsError || !allRounds) {
      console.error("Error fetching rounds:", roundsError?.message)
      return []
    }

    // Build overview for each player
    const overviews: PlayerOverview[] = players
      .map((player) => {
        const playerRounds = allRounds.filter(
          (r: Round) => r.player_id === player.id
        )

        const latestRound = playerRounds[0] || null
        const handicap = calculateHandicap(playerRounds as Round[])

        return {
          playerId: player.id,
          playerName: player.name,
          handicap,
          totalRounds: playerRounds.length,
          lastCourse: latestRound?.course ?? null,
          lastScore: latestRound?.score ?? null,
          lastDate: latestRound?.date ?? null,
          favoriteCourse: player.favorite_course ?? null,
        }
      })
      // Sort by most recent round first, players with no rounds go last
      .sort((a, b) => {
        if (!a.lastDate && !b.lastDate) return 0
        if (!a.lastDate) return 1
        if (!b.lastDate) return -1
        return new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
      })

    return overviews
  } catch (err) {
    console.error("Unexpected error in getPerformanceOverview:", err)
    return []
  }
}
