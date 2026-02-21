import { getAllReviews } from "@/app/actions/reviews"
import { getRounds } from "@/app/actions/rounds"
import { CourseReviewsClient } from "@/components/CourseReviewsClient"
import { createClient } from "@/lib/supabase/server"

export default async function ReviewsPage() {
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

  const reviews = await getAllReviews()
  const rounds = await getRounds()

  return (
    <CourseReviewsClient
      initialReviews={reviews}
      allRounds={rounds}
      isAuthenticated={!!user}
      profilePictureUrl={profilePictureUrl}
      displayName={displayName}
    />
  )
}
