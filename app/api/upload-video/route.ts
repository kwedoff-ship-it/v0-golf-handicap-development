import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const analysisId = formData.get("analysisId") as string | null
    const type = formData.get("type") as string | null

    if (!file || !analysisId || !type) {
      return NextResponse.json(
        { error: "File, analysisId, and type are required" },
        { status: 400 }
      )
    }

    // Validate file type (video formats)
    const validTypes = ["video/mp4", "video/quicktime", "video/webm", "video/avi", "video/mov"]
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|avi)$/i)) {
      return NextResponse.json(
        { error: "Please upload a video file (MP4, MOV, WebM, or AVI)" },
        { status: 400 }
      )
    }

    // 50MB limit for videos
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Video must be under 50MB" },
        { status: 400 }
      )
    }

    const blob = await put(
      `swing-videos/${user.id}/${analysisId}/${type}-${file.name}`,
      file,
      {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
      }
    )

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Video upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
