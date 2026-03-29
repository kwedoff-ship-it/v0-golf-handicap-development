"use client"

// Swing phase definitions
export const SWING_PHASES = [
  { id: "address", label: "Address", description: "Setup position over the ball" },
  { id: "takeaway", label: "Takeaway", description: "Club moves away from ball" },
  { id: "top", label: "Top of Backswing", description: "Full backswing position" },
  { id: "downswing", label: "Downswing", description: "Transition to downswing" },
  { id: "impact", label: "Impact", description: "Club meets ball" },
  { id: "followthrough", label: "Follow Through", description: "Post-impact extension" },
  { id: "finish", label: "Finish", description: "Full finish position" },
] as const

export type SwingPhaseId = (typeof SWING_PHASES)[number]["id"]

export interface PhaseTimestamp {
  phaseId: SwingPhaseId
  timestamp: number
  confidence: number
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

// Keypoint interface
interface Keypoint {
  x: number
  y: number
  score: number
  name?: string
}

// MoveNet keypoint indices
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

function getKeypoint(keypoints: Keypoint[], index: number): Keypoint | null {
  const kp = keypoints[index]
  return kp && kp.score > 0.3 ? kp : null
}

function calculateAngle(p1: Keypoint, p2: Keypoint, p3: Keypoint): number {
  const radians =
    Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x)
  let angle = Math.abs((radians * 180) / Math.PI)
  if (angle > 180) angle = 360 - angle
  return angle
}

interface SwingMetrics {
  leftWristHeight: number
  rightWristHeight: number
  shoulderRotation: number
  leftElbowAngle: number
  rightElbowAngle: number
}

function analyzeSwingPose(
  keypoints: Keypoint[],
  width: number,
  height: number
): SwingMetrics | null {
  const leftWrist = getKeypoint(keypoints, KEYPOINTS.LEFT_WRIST)
  const rightWrist = getKeypoint(keypoints, KEYPOINTS.RIGHT_WRIST)
  const leftShoulder = getKeypoint(keypoints, KEYPOINTS.LEFT_SHOULDER)
  const rightShoulder = getKeypoint(keypoints, KEYPOINTS.RIGHT_SHOULDER)
  const leftElbow = getKeypoint(keypoints, KEYPOINTS.LEFT_ELBOW)
  const rightElbow = getKeypoint(keypoints, KEYPOINTS.RIGHT_ELBOW)

  if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) {
    return null
  }

  return {
    leftWristHeight: 1 - leftWrist.y / height,
    rightWristHeight: 1 - rightWrist.y / height,
    shoulderRotation:
      (Math.atan2(
        rightShoulder.y - leftShoulder.y,
        rightShoulder.x - leftShoulder.x
      ) *
        180) /
      Math.PI,
    leftElbowAngle:
      leftElbow ? calculateAngle(leftShoulder, leftElbow, leftWrist) : 180,
    rightElbowAngle:
      rightElbow ? calculateAngle(rightShoulder, rightElbow, rightWrist) : 180,
  }
}

function detectPhaseFromMetrics(
  metrics: SwingMetrics,
  prevMetrics: SwingMetrics | null,
  currentPhase: SwingPhaseId
): { phase: SwingPhaseId; confidence: number } {
  const avgWristHeight =
    (metrics.leftWristHeight + metrics.rightWristHeight) / 2

  // Address
  if (avgWristHeight < 0.45 && Math.abs(metrics.shoulderRotation) < 15) {
    if (currentPhase === "address" || currentPhase === "takeaway") {
      return { phase: "address", confidence: 0.8 }
    }
  }

  // Takeaway
  if (
    avgWristHeight > 0.35 &&
    avgWristHeight < 0.55 &&
    Math.abs(metrics.shoulderRotation) > 5 &&
    Math.abs(metrics.shoulderRotation) < 30
  ) {
    if (currentPhase === "address" || currentPhase === "takeaway") {
      return { phase: "takeaway", confidence: 0.7 }
    }
  }

  // Top of backswing
  if (avgWristHeight > 0.55 && Math.abs(metrics.shoulderRotation) > 20) {
    if (
      currentPhase === "takeaway" ||
      currentPhase === "top" ||
      currentPhase === "address"
    ) {
      return { phase: "top", confidence: 0.85 }
    }
  }

  // Downswing
  if (
    prevMetrics &&
    avgWristHeight < prevMetrics.leftWristHeight &&
    avgWristHeight > 0.4 &&
    avgWristHeight < 0.65
  ) {
    if (currentPhase === "top" || currentPhase === "downswing") {
      return { phase: "downswing", confidence: 0.75 }
    }
  }

  // Impact
  if (
    avgWristHeight < 0.45 &&
    avgWristHeight > 0.25 &&
    metrics.leftElbowAngle > 150
  ) {
    if (currentPhase === "downswing" || currentPhase === "impact") {
      return { phase: "impact", confidence: 0.8 }
    }
  }

  // Follow through
  if (
    prevMetrics &&
    avgWristHeight > 0.45 &&
    avgWristHeight > prevMetrics.leftWristHeight &&
    currentPhase === "impact"
  ) {
    return { phase: "followthrough", confidence: 0.7 }
  }

  // Finish
  if (avgWristHeight > 0.6 && Math.abs(metrics.shoulderRotation) > 15) {
    if (currentPhase === "followthrough" || currentPhase === "finish") {
      return { phase: "finish", confidence: 0.8 }
    }
  }

  return { phase: currentPhase, confidence: 0.5 }
}

// Load TensorFlow.js from CDN
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let detector: any = null

async function loadModel(
  onProgress?: (progress: DetectionProgress) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  if (detector) return detector

  onProgress?.({
    stage: "loading",
    progress: 10,
    message: "Loading TensorFlow.js...",
  })

  // Load TensorFlow.js core from CDN
  await loadScript(
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.20.0/dist/tf-core.min.js"
  )
  await loadScript(
    "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.20.0/dist/tf-backend-webgl.min.js"
  )

  onProgress?.({
    stage: "loading",
    progress: 30,
    message: "Loading pose detection model...",
  })

  // Load pose detection
  await loadScript(
    "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js"
  )

  onProgress?.({
    stage: "loading",
    progress: 50,
    message: "Initializing MoveNet...",
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tf = (window as any).tf
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const poseDetection = (window as any).poseDetection

  await tf.ready()
  await tf.setBackend("webgl")

  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    }
  )

  onProgress?.({
    stage: "loading",
    progress: 60,
    message: "Model loaded!",
  })

  return detector
}

export async function detectSwingPhases(
  videoElement: HTMLVideoElement,
  onProgress?: (progress: DetectionProgress) => void
): Promise<PhaseTimestamp[]> {
  const det = await loadModel(onProgress)

  onProgress?.({
    stage: "analyzing",
    progress: 60,
    message: "Analyzing video frames...",
  })

  const duration = videoElement.duration
  const fps = 10
  const frameCount = Math.floor(duration * fps)

  const phases: PhaseTimestamp[] = []
  let currentPhase: SwingPhaseId = "address"
  let prevMetrics: SwingMetrics | null = null
  let lastDetectedPhase: SwingPhaseId = "address"

  const canvas = document.createElement("canvas")
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight
  const ctx = canvas.getContext("2d")!

  for (let i = 0; i < frameCount; i++) {
    const time = i / fps
    videoElement.currentTime = time

    await new Promise<void>((resolve) => {
      const onSeeked = () => {
        videoElement.removeEventListener("seeked", onSeeked)
        resolve()
      }
      videoElement.addEventListener("seeked", onSeeked)
    })

    ctx.drawImage(videoElement, 0, 0)

    const poses = await det.estimatePoses(canvas)

    if (poses.length > 0) {
      const pose = poses[0]
      const metrics = analyzeSwingPose(
        pose.keypoints,
        canvas.width,
        canvas.height
      )

      if (metrics) {
        const { phase, confidence } = detectPhaseFromMetrics(
          metrics,
          prevMetrics,
          currentPhase
        )

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

    const progress = 60 + Math.floor((i / frameCount) * 35)
    onProgress?.({
      stage: "analyzing",
      progress,
      message: `Analyzing frame ${i + 1} of ${frameCount}...`,
    })
  }

  videoElement.currentTime = 0

  onProgress?.({
    stage: "complete",
    progress: 100,
    message: "Analysis complete!",
  })

  return fillMissingPhases(phases, duration)
}

function fillMissingPhases(
  detectedPhases: PhaseTimestamp[],
  duration: number
): PhaseTimestamp[] {
  const phaseOrder: SwingPhaseId[] = [
    "address",
    "takeaway",
    "top",
    "downswing",
    "impact",
    "followthrough",
    "finish",
  ]
  const result: PhaseTimestamp[] = []

  const detectedMap = new Map<SwingPhaseId, PhaseTimestamp>()
  for (const phase of detectedPhases) {
    if (
      !detectedMap.has(phase.phaseId) ||
      phase.confidence > (detectedMap.get(phase.phaseId)?.confidence ?? 0)
    ) {
      detectedMap.set(phase.phaseId, phase)
    }
  }

  for (let i = 0; i < phaseOrder.length; i++) {
    const phaseId = phaseOrder[i]
    const detected = detectedMap.get(phaseId)

    if (detected) {
      result.push(detected)
    } else {
      const estimatedPosition = i / (phaseOrder.length - 1)
      result.push({
        phaseId,
        timestamp: estimatedPosition * duration,
        confidence: 0.3,
      })
    }
  }

  result.sort((a, b) => a.timestamp - b.timestamp)
  return result
}

export function createEmptyPhaseMarkers(duration: number): PhaseTimestamp[] {
  const phaseOrder: SwingPhaseId[] = [
    "address",
    "takeaway",
    "top",
    "downswing",
    "impact",
    "followthrough",
    "finish",
  ]

  return phaseOrder.map((phaseId, i) => ({
    phaseId,
    timestamp: (i / (phaseOrder.length - 1)) * duration,
    confidence: 0,
  }))
}
