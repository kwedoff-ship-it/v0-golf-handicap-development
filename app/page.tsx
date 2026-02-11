import { getPlayers } from "@/app/actions/players"
import { getRounds } from "@/app/actions/rounds"
import { HomeClient } from "@/components/HomeClient"
import { createClient } from "@/lib/supabase/server"
import type { Round } from "@/lib/types"

// Server component - fetches initial data on the server
export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const players = await getPlayers()
  const initialPlayerId = players.length > 0 ? players[0].id : null
  const initialRounds: Round[] = initialPlayerId
    ? await getRounds(initialPlayerId)
    : []

  return (
    <HomeClient
      initialPlayers={players}
      initialRounds={initialRounds}
      initialPlayerId={initialPlayerId}
      isAuthenticated={!!user}
    />
  )
}
