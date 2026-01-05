"use server"

import { createClient } from "@/lib/supabase/server"
import type { CourseReview, CourseReviewStats } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function createReview(
  roundId: string | null,
  courseName: string,
  difficultyRating: number,
  weather: string,
  overallRating: number,
  reviewText?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from("course_reviews").insert({
      round_id: roundId,
      course_name: courseName,
      difficulty_rating: difficultyRating,
      weather,
      overall_rating: overallRating,
      review_text: reviewText,
      user_id: userData.user?.id || null,
    })

    if (error) throw error

    revalidatePath("/reviews")
    return { success: true }
  } catch (error) {
    console.error("Error creating review:", error)
    return { success: false, error: String(error) }
  }
}

export async function getReviewByRoundId(roundId: string): Promise<CourseReview | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("course_reviews").select("*").eq("round_id", roundId).single()

    if (error) return null
    return data as CourseReview
  } catch (error) {
    return null
  }
}

export async function getAllReviews(): Promise<CourseReview[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("course_reviews").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return (data as CourseReview[]) || []
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return []
  }
}

export async function getReviewStatsByCourse(courseName: string): Promise<CourseReviewStats | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("course_reviews")
      .select("*")
      .ilike("course_name", courseName)
      .order("created_at", { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) return null

    const reviews = data as CourseReview[]
    const avgDifficulty = reviews.reduce((sum, r) => sum + r.difficulty_rating, 0) / reviews.length
    const avgOverall = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length

    return {
      course_name: courseName,
      total_reviews: reviews.length,
      avg_difficulty: Math.round(avgDifficulty * 10) / 10,
      avg_overall: Math.round(avgOverall * 10) / 10,
      reviews,
    }
  } catch (error) {
    console.error("Error fetching review stats:", error)
    return null
  }
}

export async function deleteReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("course_reviews").delete().eq("id", reviewId)

    if (error) throw error

    revalidatePath("/reviews")
    return { success: true }
  } catch (error) {
    console.error("Error deleting review:", error)
    return { success: false, error: String(error) }
  }
}
