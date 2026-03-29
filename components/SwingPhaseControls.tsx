"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight, 
  Check, X, Gauge, Target, Wand2
} from "lucide-react"
import { SWING_PHASES, type PhaseTimestamp, type SwingPhaseId } from "@/lib/pose-detector"

interface SwingPhaseControlsProps {
  // Video refs and state
  proVideoRef: React.RefObject<HTMLVideoElement | null>
  personalVideoRef: React.RefObject<HTMLVideoElement | null>
  proDuration: number
  personalDuration: number
  isPlaying: boolean
  onPlayPause: () => void
  onReset: () => void
  
  // Phase markers
  proPhases: PhaseTimestamp[]
  personalPhases: PhaseTimestamp[]
  onProPhasesChange: (phases: PhaseTimestamp[]) => void
  onPersonalPhasesChange: (phases: PhaseTimestamp[]) => void
  
  // Mode
  detectionMode: "ai" | "manual"
  onDetectionModeChange: (mode: "ai" | "manual") => void
  
  // AI Detection
  onRunAIDetection: (videoType: "pro" | "personal") => void
  isDetecting: boolean
  
  // Active phase
  activePhaseIndex: number | null
  onPhaseClick: (phaseIndex: number) => void
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2]

export function SwingPhaseControls({
  proVideoRef,
  personalVideoRef,
  proDuration,
  personalDuration,
  isPlaying,
  onPlayPause,
  onReset,
  proPhases,
  personalPhases,
  onProPhasesChange,
  onPersonalPhasesChange,
  detectionMode,
  onDetectionModeChange,
  onRunAIDetection,
  isDetecting,
  activePhaseIndex,
  onPhaseClick,
}: SwingPhaseControlsProps) {
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [markingPhase, setMarkingPhase] = useState<{
    videoType: "pro" | "personal"
    phaseIndex: number
  } | null>(null)

  // Update playback speed for both videos
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (proVideoRef.current) proVideoRef.current.playbackRate = speed
    if (personalVideoRef.current) personalVideoRef.current.playbackRate = speed
  }

  // Start marking a phase timestamp
  const startMarkingPhase = (videoType: "pro" | "personal", phaseIndex: number) => {
    setMarkingPhase({ videoType, phaseIndex })
  }

  // Confirm current timestamp for the marking phase
  const confirmPhaseMarker = () => {
    if (!markingPhase) return
    
    const videoRef = markingPhase.videoType === "pro" ? proVideoRef : personalVideoRef
    const currentTime = videoRef.current?.currentTime ?? 0
    
    const phases = markingPhase.videoType === "pro" ? [...proPhases] : [...personalPhases]
    phases[markingPhase.phaseIndex] = {
      ...phases[markingPhase.phaseIndex],
      timestamp: currentTime,
      confidence: 1, // User-confirmed = full confidence
    }
    
    if (markingPhase.videoType === "pro") {
      onProPhasesChange(phases)
    } else {
      onPersonalPhasesChange(phases)
    }
    
    setMarkingPhase(null)
  }

  // Cancel marking
  const cancelMarking = () => {
    setMarkingPhase(null)
  }

  // Frame step forward/backward
  const stepFrame = (direction: "forward" | "backward") => {
    // Pause videos first if playing
    if (isPlaying) {
      onPlayPause()
    }
    
    const frameTime = 1 / 30 // Assuming 30fps
    const delta = direction === "forward" ? frameTime : -frameTime
    
    if (proVideoRef.current) {
      const newTime = Math.max(0, Math.min(proVideoRef.current.duration, proVideoRef.current.currentTime + delta))
      proVideoRef.current.currentTime = newTime
    }
    if (personalVideoRef.current) {
      const newTime = Math.max(0, Math.min(personalVideoRef.current.duration, personalVideoRef.current.currentTime + delta))
      personalVideoRef.current.currentTime = newTime
    }
  }

  const hasProVideo = proDuration > 0
  const hasPersonalVideo = personalDuration > 0

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base">Swing Phase Controls</CardTitle>
          
          {/* Detection Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => onDetectionModeChange("ai")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                detectionMode === "ai"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <Wand2 className="h-3.5 w-3.5" />
              AI Detection
            </button>
            <button
              onClick={() => onDetectionModeChange("manual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                detectionMode === "manual"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              Manual Markers
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Playback Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Play/Pause/Reset */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onReset}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-9 w-9"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => stepFrame("backward")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-9 w-9"
              title="Previous frame"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={onPlayPause}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-5"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => stepFrame("forward")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-9 w-9"
              title="Next frame"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-slate-400" />
            <div className="flex items-center bg-slate-900/50 rounded-lg p-1">
              {PLAYBACK_SPEEDS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    playbackSpeed === speed
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Detection Buttons (when in AI mode) */}
        {detectionMode === "ai" && (
          <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-lg">
            <Wand2 className="h-5 w-5 text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm text-white font-medium">AI Pose Detection</p>
              <p className="text-xs text-slate-400">Automatically detect swing phases from video</p>
            </div>
            <div className="flex gap-2">
              {hasProVideo && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRunAIDetection("pro")}
                  disabled={isDetecting}
                  className="border-blue-600 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300"
                >
                  Analyze Pro
                </Button>
              )}
              {hasPersonalVideo && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRunAIDetection("personal")}
                  disabled={isDetecting}
                  className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-300"
                >
                  Analyze My Swing
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Phase marking mode indicator */}
        {markingPhase && (
          <div className="flex items-center gap-3 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg">
            <Target className="h-5 w-5 text-amber-400 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm text-amber-400 font-medium">
                Marking: {SWING_PHASES[markingPhase.phaseIndex].label}
              </p>
              <p className="text-xs text-amber-400/70">
                Scrub the {markingPhase.videoType === "pro" ? "Pro" : "Personal"} video to the correct position, then confirm
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={confirmPhaseMarker}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelMarking}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Phase Timeline */}
        <div className="space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Swing Phases</p>
          
          <div className="grid grid-cols-7 gap-1">
            {SWING_PHASES.map((phase, index) => {
              const proPhase = proPhases[index]
              const personalPhase = personalPhases[index]
              const isActive = activePhaseIndex === index
              const proSet = proPhase?.confidence > 0
              const personalSet = personalPhase?.confidence > 0

              return (
                <button
                  key={phase.id}
                  onClick={() => onPhaseClick(index)}
                  className={`relative p-2 rounded-lg text-center transition-all ${
                    isActive
                      ? "bg-emerald-600/30 border-2 border-emerald-500"
                      : "bg-slate-900/50 border border-slate-700 hover:border-slate-500"
                  }`}
                >
                  <p className={`text-xs font-medium truncate ${
                    isActive ? "text-emerald-400" : "text-slate-300"
                  }`}>
                    {phase.label}
                  </p>
                  
                  {/* Status indicators */}
                  <div className="flex justify-center gap-1 mt-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        proSet 
                          ? proPhase.confidence === 1 
                            ? "bg-blue-400" 
                            : "bg-blue-400/50"
                          : "bg-slate-700"
                      }`}
                      title={proSet ? `Pro: ${proPhase.timestamp.toFixed(2)}s` : "Pro: not set"}
                    />
                    <span
                      className={`w-2 h-2 rounded-full ${
                        personalSet 
                          ? personalPhase.confidence === 1 
                            ? "bg-emerald-400" 
                            : "bg-emerald-400/50"
                          : "bg-slate-700"
                      }`}
                      title={personalSet ? `Personal: ${personalPhase.timestamp.toFixed(2)}s` : "Personal: not set"}
                    />
                  </div>

                  {/* Manual marking buttons (when in manual mode and not currently marking) */}
                  {detectionMode === "manual" && !markingPhase && (
                    <div className="flex justify-center gap-1 mt-2">
                      {hasProVideo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startMarkingPhase("pro", index)
                          }}
                          className="px-1.5 py-0.5 text-[10px] bg-blue-600/30 text-blue-400 rounded hover:bg-blue-600/50"
                        >
                          Pro
                        </button>
                      )}
                      {hasPersonalVideo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startMarkingPhase("personal", index)
                          }}
                          className="px-1.5 py-0.5 text-[10px] bg-emerald-600/30 text-emerald-400 rounded hover:bg-emerald-600/50"
                        >
                          Me
                        </button>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Pro marked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Personal marked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <span>Not set</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400/50" />
              <span>AI estimated</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
