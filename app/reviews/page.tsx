import { getAllReviews } from "@/app/actions/reviews"
import { getRounds } from "@/app/actions/rounds"
import { CourseReviewsClient } from "@/components/CourseReviewsClient"

export default async function ReviewsPage() {
  const reviews = await getAllReviews()
  const rounds = await getRounds()

  return <CourseReviewsClient initialReviews={reviews} allRounds={rounds} />
}
