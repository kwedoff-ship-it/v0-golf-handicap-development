import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile } from "@/app/actions/profile"
import { SettingsClient } from "@/components/SettingsClient"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is not authenticated (guest), redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getProfile()

  return (
    <SettingsClient
      profile={profile}
      userEmail={user.email || ""}
      isAuthenticated={true}
    />
  )
}
