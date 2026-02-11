import type { CourseReview } from "@/lib/types"
import { Star } from "lucide-react"

type ReviewsListProps = {
  reviews: CourseReview[]
  isSearchResult: boolean
}

export function ReviewsList({ reviews, isSearchResult }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30 p-12 text-center">
        <p className="text-slate-400">
          {isSearchResult ? "No reviews found for this course" : "No reviews yet. Be the first to add one!"}
        </p>
      </div>
    )
  }

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
        />
      ))}
    </div>
  )

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">{isSearchResult ? "Search Results" : "All Reviews"}</h2>
        <p className="text-sm text-slate-300 mt-1">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 shadow-sm hover:shadow-md hover:bg-slate-800/70 transition-all"
          >
            <h3 className="mb-2 text-lg font-bold text-emerald-300">{review.course_name}</h3>

            <div className="mb-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Difficulty:</span>
                <StarDisplay rating={review.difficulty_rating} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Overall:</span>
                <StarDisplay rating={review.overall_rating} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Weather:</span>
                <span className="font-medium text-white">{review.weather}</span>
              </div>
            </div>

            {review.review_text && (
              <p className="text-pretty border-t border-slate-700 pt-3 text-sm text-slate-300">{review.review_text}</p>
            )}

            <p className="mt-3 text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
