"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Round } from "@/lib/types"

async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function addRound(formData: FormData) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    const player_id = formData.get("player_id") as string
    const date = formData.get("date") as string
    const course = formData.get("course") as string
    const tee = formData.get("tee") as string
    const rating = formData.get("rating") as string
    const slope = formData.get("slope") as string
    const score = formData.get("score") as string

    if (!player_id) {
      return { success: false, error: "Player ID is required" }
    }

    if (!date || !course || !tee || !rating || !slope || !score) {
      return { success: false, error: "All fields are required" }
    }

    const ratingNum = Number.parseFloat(rating)
    const slopeNum = Number.parseInt(slope)
    const scoreNum = Number.parseInt(score)

    if (isNaN(ratingNum) || isNaN(slopeNum) || isNaN(scoreNum)) {
      return { success: false, error: "Invalid numeric values" }
    }

    const { data, error } = await supabase
      .from("rounds")
      .insert([
        {
          player_id,
          date,
          course: course.trim(),
          tee: tee.trim(),
          rating: ratingNum,
          slope: slopeNum,
          score: scoreNum,
          user_id: user?.id || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding round:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true, data: data as Round }
  } catch (err) {
    console.error("Unexpected error adding round:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add round",
    }
  }
}

export async function getRounds(playerId?: string): Promise<Round[]> {
  try {
    const supabase = await createClient()

    let query = supabase.from("rounds").select("*")

    // If playerId provided, filter by it
    if (playerId) {
      query = query.eq("player_id", playerId)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      console.error("Error fetching rounds:", error.message)
      return []
    }

    return (data as Round[]) || []
  } catch (err) {
    console.error("Unexpected error fetching rounds:", err)
    return []
  }
}
