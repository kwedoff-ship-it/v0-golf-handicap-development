import { getAllReviews } from "@/app/actions/reviews"
import { getRounds } from "@/app/actions/rounds"
import { CourseReviewsClient } from "@/components/CourseReviewsClient"
import { createClient } from "@/lib/supabase/server"

export default async function ReviewsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const reviews = await getAllReviews()
  const rounds = await getRounds()

  return <CourseReviewsClient initialReviews={reviews} allRounds={rounds} isAuthenticated={!!user} />
}
