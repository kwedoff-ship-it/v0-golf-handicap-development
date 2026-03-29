import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"
  const type = searchParams.get("type")

  // Debug logging
  console.log("[v0] Auth callback - code:", !!code, "next:", next, "type:", type)
  console.log("[v0] Auth callback - full URL:", request.url)

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log("[v0] Auth callback - exchange result:", { 
      hasSession: !!data?.session, 
      error: error?.message 
    })

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"

      // Determine the base URL
      let baseUrl: string
      if (isLocalEnv) {
        baseUrl = origin
      } else if (forwardedHost) {
        baseUrl = `https://${forwardedHost}`
      } else {
        baseUrl = origin
      }

      // If this is a password recovery flow, always redirect to update-password
      // The type parameter or next parameter can indicate this
      const isPasswordRecovery = type === "recovery" || next === "/auth/update-password"
      const redirectPath = isPasswordRecovery ? "/auth/update-password" : next

      console.log("[v0] Auth callback - redirecting to:", `${baseUrl}${redirectPath}`)

      return NextResponse.redirect(`${baseUrl}${redirectPath}`)
    }
  }

  // If code exchange fails, redirect to auth error page
  console.log("[v0] Auth callback - failed, redirecting to error page")
  return NextResponse.redirect(`${origin}/auth/error`)
}
