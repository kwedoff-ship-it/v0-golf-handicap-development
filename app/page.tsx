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

  // Fetch user profile for the avatar menu
  let profilePictureUrl: string | null = null
  let displayName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("display_name, profile_picture_url")
      .eq("user_id", user.id)
      .single()
    profilePictureUrl = profile?.profile_picture_url ?? null
    displayName = profile?.display_name ?? null
  }

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
      profilePictureUrl={profilePictureUrl}
      displayName={displayName}
    />
  )
}
