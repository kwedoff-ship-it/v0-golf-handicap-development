"use client"

import type { Pose, Keypoint } from "@tensorflow-models/pose-detection"

// Swing phase definitions with detection criteria
export const SWING_PHASES = [
  { id: "address", label: "Address", description: "Setup position over the ball" },
  { id: "takeaway", label: "Takeaway", description: "Club moves away from ball" },
  { id: "top", label: "Top of Backswing", description: "Full backswing position" },
  { id: "downswing", label: "Downswing", description: "Transition to downswing" },
  { id: "impact", label: "Impact", description: "Club meets ball" },
  { id: "followthrough", label: "Follow Through", description: "Post-impact extension" },
  { id: "finish", label: "Finish", description: "Full finish position" },
] as const

export type SwingPhaseId = typeof SWING_PHASES[number]["id"]

export interface PhaseTimestamp {
  phaseId: SwingPhaseId
  timestamp: number // in seconds
  confidence: number // 0-1
}

export interface VideoPhaseMarkers {
  videoType: "pro" | "personal"
  phases: PhaseTimestamp[]
  duration: number
}

export interface DetectionProgress {
  stage: "loading" | "analyzing" | "complete"
  progress: number
  message: string
}

// Keypoint indices for MoveNet (COCO format)
const KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
}

// Helper to get keypoint by name
function getKeypoint(pose: Pose, name: keyof typeof KEYPOINTS): Keypoint | null {
  const kp = pose.keypoints[KEYPOINTS[name]]
  return kp && kp.score && kp.score > 0.3 ? kp : null
}

// Calculate angle between three points
function calculateAngle(p1: Keypoint, p2: Keypoint, p3: Keypoint): number {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x)
  let angle = Math.abs(radians * 180 / Math.PI)
  if (angle > 180) angle = 360 - angle
  return angle
}

// Calculate vertical position ratio (0 = top of frame, 1 = bottom)
function getVerticalRatio(kp: Keypoint, height: number): number {
  return kp.y / height
}

// Calculate horizontal position ratio (0 = left, 1 = right)
function getHorizontalRatio(kp: Keypoint, width: number): number {
  return kp.x / width
}

// Analyze pose to determine swing characteristics
interface SwingMetrics {
  leftWristHeight: number // 0-1, higher = hands up
  rightWristHeight: number
  leftWristHorizontal: number // 0-1, position left to right
  rightWristHorizontal: number
  shoulderRotation: number // angle of shoulder line
  hipRotation: number // angle of hip line
  leftElbowAngle: number
  rightElbowAngle: number
  torsoLean: number // forward/backward lean
}

function analyzeSwingPose(pose: Pose, width: number, height: number): SwingMetrics | null {
  const leftWrist = getKeypoint(pose, "LEFT_WRIST")
  const rightWrist = getKeypoint(pose, "RIGHT_WRIST")
  const leftShoulder = getKeypoint(pose, "LEFT_SHOULDER")
  const rightShoulder = getKeypoint(pose, "RIGHT_SHOULDER")
  const leftHip = getKeypoint(pose, "LEFT_HIP")
  const rightHip = getKeypoint(pose, "RIGHT_HIP")
  const leftElbow = getKeypoint(pose, "LEFT_ELBOW")
  const rightElbow = getKeypoint(pose, "RIGHT_ELBOW")

  // Need minimum keypoints to analyze
  if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) {
    return null
  }

  const metrics: SwingMetrics = {
    leftWristHeight: 1 - getVerticalRatio(leftWrist, height),
    rightWristHeight: 1 - getVerticalRatio(rightWrist, height),
    leftWristHorizontal: getHorizontalRatio(leftWrist, width),
    rightWristHorizontal: getHorizontalRatio(rightWrist, width),
    shoulderRotation: Math.atan2(
      rightShoulder.y - leftShoulder.y,
      rightShoulder.x - leftShoulder.x
    ) * 180 / Math.PI,
    hipRotation: leftHip && rightHip ? Math.atan2(
      rightHip.y - leftHip.y,
      rightHip.x - leftHip.x
    ) * 180 / Math.PI : 0,
    leftElbowAngle: leftElbow ? calculateAngle(leftShoulder, leftElbow, leftWrist) : 180,
    rightElbowAngle: rightElbow ? calculateAngle(rightShoulder, rightElbow, rightWrist) : 180,
    torsoLean: leftHip && rightHip ? 
      ((leftShoulder.x + rightShoulder.x) / 2 - (leftHip.x + rightHip.x) / 2) / width : 0,
  }

  return metrics
}

// Determine swing phase from metrics
function detectPhaseFromMetrics(
  metrics: SwingMetrics,
  prevMetrics: SwingMetrics | null,
  currentPhase: SwingPhaseId
): { phase: SwingPhaseId; confidence: number } {
  const avgWristHeight = (metrics.leftWristHeight + metrics.rightWristHeight) / 2
  const avgWristHorizontal = (metrics.leftWristHorizontal + metrics.rightWristHorizontal) / 2
  
  // Phase detection logic based on body position
  // Address: Hands low, relatively centered, still position
  if (avgWristHeight < 0.45 && Math.abs(metrics.shoulderRotation) < 15) {
    if (currentPhase === "address" || currentPhase === "takeaway") {
      return { phase: "address", confidence: 0.8 }
    }
  }

  // Takeaway: Hands starting to move back/up, slight shoulder turn
  if (avgWristHeight > 0.35 && avgWristHeight < 0.55 && 
      Math.abs(metrics.shoulderRotation) > 5 && Math.abs(metrics.shoulderRotation) < 30) {
    if (currentPhase === "address" || currentPhase === "takeaway") {
      return { phase: "takeaway", confidence: 0.7 }
    }
  }

  // Top of backswing: Hands high, significant shoulder turn
  if (avgWristHeight > 0.55 && Math.abs(metrics.shoulderRotation) > 20) {
    if (currentPhase === "takeaway" || currentPhase === "top" || currentPhase === "address") {
      return { phase: "top", confidence: 0.85 }
    }
  }

  // Downswing: Hands coming down, shoulder starting to unwind
  if (prevMetrics && avgWristHeight < prevMetrics.leftWristHeight && 
      avgWristHeight > 0.4 && avgWristHeight < 0.65) {
    if (currentPhase === "top" || currentPhase === "downswing") {
      return { phase: "downswing", confidence: 0.75 }
    }
  }

  // Impact: Hands low, near center, arms extended
  if (avgWristHeight < 0.45 && avgWristHeight > 0.25 &&
      metrics.leftElbowAngle > 150 && metrics.rightElbowAngle > 140) {
    if (currentPhase === "downswing" || currentPhase === "impact") {
      return { phase: "impact", confidence: 0.8 }
    }
  }

  // Follow through: Hands moving up and forward after impact
  if (prevMetrics && avgWristHeight > 0.45 && 
      avgWristHeight > prevMetrics.leftWristHeight &&
      currentPhase === "impact") {
    return { phase: "followthrough", confidence: 0.7 }
  }

  // Finish: Hands high, facing target
  if (avgWristHeight > 0.6 && Math.abs(metrics.shoulderRotation) > 15) {
    if (currentPhase === "followthrough" || currentPhase === "finish") {
      return { phase: "finish", confidence: 0.8 }
    }
  }

  // Default: stay in current phase
  return { phase: currentPhase, confidence: 0.5 }
}

// Main function to analyze a video and detect swing phases
export async function detectSwingPhases(
  videoElement: HTMLVideoElement,
  onProgress?: (progress: DetectionProgress) => void
): Promise<PhaseTimestamp[]> {
  onProgress?.({ stage: "loading", progress: 0, message: "Loading pose detection model..." })

  // Dynamic imports to avoid SSR issues
  const tf = await import("@tensorflow/tfjs-core")
  await import("@tensorflow/tfjs-backend-webgl")
  const poseDetection = await import("@tensorflow-models/pose-detection")

  await tf.ready()
  await tf.setBackend("webgl")

  onProgress?.({ stage: "loading", progress: 30, message: "Initializing MoveNet..." })

  // Create detector
  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    }
  )

  onProgress?.({ stage: "analyzing", progress: 40, message: "Analyzing video frames..." })

  const duration = videoElement.duration
  const fps = 15 // Sample rate - higher = more accurate but slower
  const frameCount = Math.floor(duration * fps)
  
  const phases: PhaseTimestamp[] = []
  let currentPhase: SwingPhaseId = "address"
  let prevMetrics: SwingMetrics | null = null
  let lastDetectedPhase: SwingPhaseId = "address"

  // Create a canvas for frame extraction
  const canvas = document.createElement("canvas")
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight
  const ctx = canvas.getContext("2d")!

  // Analyze each frame
  for (let i = 0; i < frameCount; i++) {
    const time = i / fps
    videoElement.currentTime = time

    // Wait for video to seek
    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        videoElement.removeEventListener("seeked", onSeeked)
        resolve()
      }
      videoElement.addEventListener("seeked", onSeeked)
    })

    // Draw frame to canvas
    ctx.drawImage(videoElement, 0, 0)

    // Detect pose
    const poses = await detector.estimatePoses(canvas)
    
    if (poses.length > 0) {
      const metrics = analyzeSwingPose(poses[0], canvas.width, canvas.height)
      
      if (metrics) {
        const { phase, confidence } = detectPhaseFromMetrics(metrics, prevMetrics, currentPhase)
        
        // If phase changed, record it
        if (phase !== lastDetectedPhase) {
          phases.push({
            phaseId: phase,
            timestamp: time,
            confidence,
          })
          lastDetectedPhase = phase
          currentPhase = phase
        }
        
        prevMetrics = metrics
      }
    }

    // Update progress
    const progress = 40 + Math.floor((i / frameCount) * 55)
    onProgress?.({ 
      stage: "analyzing", 
      progress, 
      message: `Analyzing frame ${i + 1} of ${frameCount}...` 
    })
  }

  // Reset video
  videoElement.currentTime = 0

  // Dispose detector
  detector.dispose()

  onProgress?.({ stage: "complete", progress: 100, message: "Analysis complete!" })

  // Ensure we have all phases (fill in missing ones with estimates)
  const filledPhases = fillMissingPhases(phases, duration)

  return filledPhases
}

// Fill in any missing phases with estimated timestamps
function fillMissingPhases(detectedPhases: PhaseTimestamp[], duration: number): PhaseTimestamp[] {
  const phaseOrder: SwingPhaseId[] = ["address", "takeaway", "top", "downswing", "impact", "followthrough", "finish"]
  const result: PhaseTimestamp[] = []

  // Create a map of detected phases
  const detectedMap = new Map<SwingPhaseId, PhaseTimestamp>()
  for (const phase of detectedPhases) {
    if (!detectedMap.has(phase.phaseId) || phase.confidence > (detectedMap.get(phase.phaseId)?.confidence ?? 0)) {
      detectedMap.set(phase.phaseId, phase)
    }
  }

  // Fill in phases
  for (let i = 0; i < phaseOrder.length; i++) {
    const phaseId = phaseOrder[i]
    const detected = detectedMap.get(phaseId)
    
    if (detected) {
      result.push(detected)
    } else {
      // Estimate based on typical swing timing
      const estimatedPosition = i / (phaseOrder.length - 1)
      result.push({
        phaseId,
        timestamp: estimatedPosition * duration,
        confidence: 0.3, // Low confidence for estimated
      })
    }
  }

  // Sort by timestamp
  result.sort((a, b) => a.timestamp - b.timestamp)

  return result
}

// Export for manual marker creation
export function createEmptyPhaseMarkers(duration: number): PhaseTimestamp[] {
  const phaseOrder: SwingPhaseId[] = ["address", "takeaway", "top", "downswing", "impact", "followthrough", "finish"]
  
  return phaseOrder.map((phaseId, i) => ({
    phaseId,
    timestamp: (i / (phaseOrder.length - 1)) * duration,
    confidence: 0, // 0 = not yet set by user
  }))
}
