"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type SwingAnalysis = {
  id: string
  user_id: string
  name: string
  pro_video_url: string | null
  personal_video_url: string | null
  pro_player_name: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export async function getSwingAnalyses(): Promise<SwingAnalysis[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("swing_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching swing analyses:", error)
    return []
  }

  return data || []
}

export async function createSwingAnalysis(name: string, proPlayerName?: string): Promise<SwingAnalysis | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("swing_analyses")
    .insert({
      user_id: user.id,
      name,
      pro_player_name: proPlayerName || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating swing analysis:", error)
    throw new Error("Failed to create swing analysis")
  }

  revalidatePath("/swing-analysis")
  return data
}

export async function updateSwingAnalysisVideo(
  analysisId: string,
  field: "pro_video_url" | "personal_video_url",
  videoUrl: string
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("swing_analyses")
    .update({ [field]: videoUrl, updated_at: new Date().toISOString() })
    .eq("id", analysisId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error updating swing analysis video:", error)
    throw new Error("Failed to update video")
  }

  revalidatePath("/swing-analysis")
}

export async function updateSwingAnalysisNotes(
  analysisId: string,
  notes: string
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("swing_analyses")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", analysisId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error updating notes:", error)
    throw new Error("Failed to update notes")
  }

  revalidatePath("/swing-analysis")
}

export async function deleteSwingAnalysis(analysisId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("swing_analyses")
    .delete()
    .eq("id", analysisId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting swing analysis:", error)
    throw new Error("Failed to delete analysis")
  }

  revalidatePath("/swing-analysis")
}
