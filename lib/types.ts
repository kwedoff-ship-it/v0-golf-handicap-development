// Type definitions for the Golf Handicap Tracker

// Player represents a golfer in the system
export type Player = {
  id: string
  name: string
  favorite_course?: string
  user_id?: string | null // Links to auth.users, null for guest players
}

// Round represents a single golf round
export type Round = {
  id: string
  player_id: string
  date: string // YYYY-MM-DD format
  course: string
  tee: string
  rating: number // Course rating (e.g., 72.5)
  slope: number // Slope rating (55-155)
  score: number // Total strokes
  user_id?: string | null // Links to auth.users, null for guest rounds
}

// HandicapHistory represents handicap at a point in time
// Used for trend chart visualization
export type HandicapHistory = {
  date: string
  handicap: number
  rounds: number // Total rounds at this point
}

// CourseReview represents a review for a golf course
export type CourseReview = {
  id: string
  round_id: string
  course_name: string
  difficulty_rating: number // 1-5
  weather: string
  overall_rating: number // 1-5
  review_text?: string
  user_id?: string | null
  created_at: string
}

// CourseReviewStats represents statistics for course reviews
export type CourseReviewStats = {
  course_name: string
  total_reviews: number
  avg_difficulty: number
  avg_overall: number
  reviews: CourseReview[]
}

// UserProfile represents a user's account profile settings
export type UserProfile = {
  id: string
  user_id: string
  display_name: string | null
  profile_picture_url: string | null
  created_at: string
  updated_at: string
}
