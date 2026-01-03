"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Player } from "@/lib/types"

async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function addPlayer(formData: FormData) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    const name = formData.get("name") as string
    const favorite_course = formData.get("favorite_course") as string | null

    if (!name || name.trim() === "") {
      return { success: false, error: "Name is required" }
    }

    const { data, error } = await supabase
      .from("players")
      .insert([
        {
          name: name.trim(),
          favorite_course: favorite_course?.trim() || null,
          user_id: user?.id || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding player:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/")

    return { success: true, data: data as Player }
  } catch (err) {
    console.error("Unexpected error adding player:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add player",
    }
  }
}

export async function getPlayers(): Promise<Player[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("players").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching players:", error.message)
      return []
    }

    return (data as Player[]) || []
  } catch (err) {
    console.error("Unexpected error fetching players:", err)
    return []
  }
}
