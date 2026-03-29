"use client"

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

let ffmpeg: FFmpeg | null = null

export interface ConversionProgress {
  stage: "loading" | "converting" | "complete" | "error"
  progress: number // 0-100
  message: string
}

export type ProgressCallback = (progress: ConversionProgress) => void

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
 * Loads FFmpeg WASM if not already loaded
 */
async function loadFFmpeg(onProgress: ProgressCallback): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) {
    return ffmpeg
  }
  
  onProgress({
    stage: "loading",
    progress: 0,
    message: "Loading video converter..."
  })
  
  ffmpeg = new FFmpeg()
  
  // Load from CDN
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  })
  
  onProgress({
    stage: "loading",
    progress: 100,
    message: "Video converter ready"
  })
  
  return ffmpeg
}

/**
 * Converts a video file to MP4 (H.264) format
 */
export async function convertToMp4(
  file: File,
  onProgress: ProgressCallback
): Promise<File> {
  const ff = await loadFFmpeg(onProgress)
  
  const inputName = "input" + getExtension(file.name)
  const outputName = "output.mp4"
  
  onProgress({
    stage: "converting",
    progress: 0,
    message: "Preparing video for conversion..."
  })
  
  // Write input file to FFmpeg virtual filesystem
  await ff.writeFile(inputName, await fetchFile(file))
  
  // Set up progress tracking
  ff.on("progress", ({ progress }) => {
    onProgress({
      stage: "converting",
      progress: Math.round(progress * 100),
      message: `Converting: ${Math.round(progress * 100)}%`
    })
  })
  
  // Convert to MP4 with H.264 codec
  // Using fast preset for quicker conversion on mobile
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
  await ff.deleteFile(inputName)
  await ff.deleteFile(outputName)
  
  onProgress({
    stage: "complete",
    progress: 100,
    message: "Conversion complete!"
  })
  
  // Create new File object
  const blob = new Blob([data], { type: "video/mp4" })
  const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".mp4"
  
  return new File([blob], newFileName, { type: "video/mp4" })
}

function getExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/)
  return match ? match[0].toLowerCase() : ".mov"
}
