"use client"

export interface ConversionProgress {
  stage: "loading" | "converting" | "complete" | "error"
  progress: number // 0-100
  message: string
}

export type ProgressCallback = (progress: ConversionProgress) => void

// Store FFmpeg instance
let ffmpegInstance: any = null
let ffmpegLoaded = false

/**
 * Validates video duration (max 30 seconds)
 */
export async function validateVideoDuration(file: File): Promise<{ valid: boolean; duration: number; error?: string }> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      const duration = video.duration
      
      if (duration > 30) {
        resolve({
          valid: false,
          duration,
          error: `Video is ${Math.round(duration)} seconds. Maximum allowed is 30 seconds.`
        })
      } else {
        resolve({ valid: true, duration })
      }
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      // If we can't read metadata, we'll let the upload proceed and handle it later
      resolve({ valid: true, duration: 0 })
    }
    
    video.src = URL.createObjectURL(file)
  })
}

/**
 * Checks if a video file needs conversion (is MOV or incompatible format)
 */
export function needsConversion(file: File): boolean {
  const fileName = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()
  
  // MOV files and QuickTime formats typically need conversion
  if (fileName.endsWith(".mov") || mimeType === "video/quicktime") {
    return true
  }
  
  // HEVC/H.265 videos often have issues
  if (mimeType.includes("hevc") || mimeType.includes("h265")) {
    return true
  }
  
  return false
}

/**
 * Dynamically imports FFmpeg from CDN and loads it
 */
async function loadFFmpeg(onProgress: ProgressCallback): Promise<any> {
  if (ffmpegInstance && ffmpegLoaded) {
    return ffmpegInstance
  }
  
  onProgress({
    stage: "loading",
    progress: 10,
    message: "Loading video converter..."
  })

  try {
    // Dynamically import ffmpeg
    const { FFmpeg } = await import("@ffmpeg/ffmpeg")
    const { toBlobURL, fetchFile } = await import("@ffmpeg/util")
    
    ffmpegInstance = new FFmpeg()
    
    // Store fetchFile for later use
    ;(ffmpegInstance as any)._fetchFile = fetchFile
    
    onProgress({
      stage: "loading",
      progress: 30,
      message: "Downloading converter components..."
    })
    
    // Use unpkg CDN for the core files
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd"
    
    const coreURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.js`,
      "text/javascript"
    )
    
    onProgress({
      stage: "loading",
      progress: 50,
      message: "Loading WebAssembly module..."
    })
    
    const wasmURL = await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm"
    )
    
    onProgress({
      stage: "loading",
      progress: 70,
      message: "Initializing converter..."
    })
    
    await ffmpegInstance.load({
      coreURL,
      wasmURL,
    })
    
    ffmpegLoaded = true
    
    onProgress({
      stage: "loading",
      progress: 100,
      message: "Video converter ready"
    })
    
    return ffmpegInstance
  } catch (error) {
    console.error("[v0] FFmpeg load error:", error)
    throw new Error("Failed to load video converter. Please try again.")
  }
}

/**
 * Converts a video file to MP4 (H.264) format
 */
export async function convertToMp4(
  file: File,
  onProgress: ProgressCallback
): Promise<File> {
  const ff = await loadFFmpeg(onProgress)
  const fetchFile = ff._fetchFile
  
  const inputName = "input" + getExtension(file.name)
  const outputName = "output.mp4"
  
  onProgress({
    stage: "converting",
    progress: 0,
    message: "Preparing video for conversion..."
  })
  
  try {
    // Write input file to FFmpeg virtual filesystem
    const fileData = await fetchFile(file)
    await ff.writeFile(inputName, fileData)
    
    // Set up progress tracking
    ff.on("progress", ({ progress }: { progress: number }) => {
      const percent = Math.min(Math.round(progress * 100), 99)
      onProgress({
        stage: "converting",
        progress: percent,
        message: `Converting: ${percent}%`
      })
    })
    
    // Convert to MP4 with H.264 codec
    // Using ultrafast preset for quicker conversion on mobile
    await ff.exec([
      "-i", inputName,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "28", // Good balance of quality and speed
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart", // Enable streaming
      "-y",
      outputName
    ])
    
    // Read output file
    const data = await ff.readFile(outputName)
    
    // Clean up
    try {
      await ff.deleteFile(inputName)
      await ff.deleteFile(outputName)
    } catch {
      // Ignore cleanup errors
    }
    
    onProgress({
      stage: "complete",
      progress: 100,
      message: "Conversion complete!"
    })
    
    // Create new File object
    const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data)
    const blob = new Blob([uint8Array], { type: "video/mp4" })
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".mp4"
    
    return new File([blob], newFileName, { type: "video/mp4" })
  } catch (error) {
    console.error("[v0] Conversion error:", error)
    throw new Error("Video conversion failed. The video may be in an unsupported format.")
  }
}

function getExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/)
  return match ? match[0].toLowerCase() : ".mov"
}
