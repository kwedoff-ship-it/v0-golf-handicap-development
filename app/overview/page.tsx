import { getPerformanceOverview } from "@/app/actions/overview"
import { OverviewClient } from "@/components/OverviewClient"
import { createClient } from "@/lib/supabase/server"

export default async function OverviewPage() {
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

  const playerOverviews = await getPerformanceOverview()

  return (
    <OverviewClient
      playerOverviews={playerOverviews}
      isAuthenticated={!!user}
      profilePictureUrl={profilePictureUrl}
      displayName={displayName}
      userEmail={user?.email ?? null}
    />
  )
}
