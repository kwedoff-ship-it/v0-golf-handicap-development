// API route to fetch rounds for a specific player
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    // Get player_id from query params
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get("player_id")

    if (!playerId) {
      return NextResponse.json(
        { error: "player_id is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("rounds")
      .select("*")
      .eq("player_id", playerId)
      .order("date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch rounds" },
      { status: 500 }
    )
  }
}
