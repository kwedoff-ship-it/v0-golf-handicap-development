// API route to fetch all players
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const runtime = 'edge'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    )
  }
}
