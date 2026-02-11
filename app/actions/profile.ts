"use server"

import { createClient } from "@/lib/supabase/server"
import type { UserProfile } from "@/lib/types"

export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error || !data) return null

  return data as UserProfile
}

export async function updateProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const displayName = formData.get("display_name") as string
  const profilePictureUrl = formData.get("profile_picture_url") as string | null

  const updateData: Record<string, string> = {
    display_name: displayName,
    updated_at: new Date().toISOString(),
  }

  if (profilePictureUrl) {
    updateData.profile_picture_url = profilePictureUrl
  }

  // Try to update existing profile first
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (existing) {
    const { error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("user_id", user.id)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from("user_profiles")
      .insert({
        user_id: user.id,
        ...updateData,
      })

    if (error) return { success: false, error: error.message }
  }

  return { success: true }
}

export async function removeProfilePicture(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      profile_picture_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)

  if (error) return { success: false, error: error.message }

  return { success: true }
}
