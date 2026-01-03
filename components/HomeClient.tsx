// Client component that handles all interactivity and state management
// Switches between dashboard and profile views
"use client"

import { useState, useEffect } from "react"
import type { Player, Round } from "@/lib/types"
import { Dashboard } from "@/components/Dashboard"
import { Profile } from "@/components/Profile"
import { addPlayer as addPlayerAction } from "@/app/actions/players"
import { addRound as addRoundAction } from "@/app/actions/rounds"

interface HomeClientProps {
  initialPlayers: Player[]
  initialRounds: Round[]
  initialPlayerId: string | null
}

export function HomeClient({
  initialPlayers,
  initialRounds,
  initialPlayerId,
}: HomeClientProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(initialPlayerId)
  const [viewingProfile, setViewingProfile] = useState(false)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [rounds, setRounds] = useState<Round[]>(initialRounds)

  // Re-fetch rounds whenever selected player changes
  useEffect(() => {
    if (!selectedPlayerId) {
      setRounds([])
      return
    }

    const fetchRounds = async () => {
      try {
        const res = await fetch(`/api/rounds?player_id=${selectedPlayerId}`)
        const data = await res.json()
        setRounds(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error fetching rounds:", err)
        setRounds([])
      }
    }

    fetchRounds()
  }, [selectedPlayerId])

  // Handle adding a new player
  const handleAddPlayer = async (player: {
    name: string
    favorite_course: string
  }) => {
    const formData = new FormData()
    formData.append("name", player.name)
    formData.append("favorite_course", player.favorite_course || "")

    const result = await addPlayerAction(formData)

    if (result.success && result.data) {
      setPlayers((prev) => [...prev, result.data!])
      setSelectedPlayerId(result.data.id)
    }

    return result
  }

  // Handle adding a new round
  const handleAddRound = async (round: {
    player_id: string
    date: string
    course: string
    tee: string
    rating: number
    slope: number
    score: number
  }) => {
    const formData = new FormData()
    formData.append("player_id", round.player_id)
    formData.append("date", round.date)
    formData.append("course", round.course)
    formData.append("tee", round.tee)
    formData.append("rating", round.rating.toString())
    formData.append("slope", round.slope.toString())
    formData.append("score", round.score.toString())

    const result = await addRoundAction(formData)

    if (result.success) {
      // Re-fetch rounds to get updated list
      const res = await fetch(`/api/rounds?player_id=${round.player_id}`)
      const data = await res.json()
      setRounds(Array.isArray(data) ? data : [])
    }

    return result
  }

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId)

  // Show profile view if user clicked "View Profile"
  if (viewingProfile && selectedPlayer) {
    return (
      <Profile
        player={selectedPlayer}
        rounds={rounds}
        onBack={() => setViewingProfile(false)}
      />
    )
  }

  // Otherwise show dashboard
  return (
    <Dashboard
      players={players}
      selectedPlayerId={selectedPlayerId}
      rounds={rounds}
      onPlayerChange={setSelectedPlayerId}
      onViewProfile={() => setViewingProfile(true)}
      onAddPlayer={handleAddPlayer}
      onAddRound={handleAddRound}
    />
  )
}
