"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft, Upload, Play, Pause, RotateCcw, Save, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateSwingAnalysisVideo, updateSwingAnalysisNotes } from "@/app/actions/swing-analysis"
import type { SwingAnalysis } from "@/app/actions/swing-analysis"
import { validateVideoDuration, needsConversion, convertToMp4, type ConversionProgress } from "@/lib/video-converter"

const SWING_PHASES = [
  { label: "Address", position: 0, description: "Setup position over the ball" },
  { label: "Takeaway", position: 0.15, description: "Club moves away from ball" },
  { label: "Top of Backswing", position: 0.35, description: "Full backswing position" },
  { label: "Downswing Start", position: 0.5, description: "Transition to downswing" },
  { label: "Impact", position: 0.7, description: "Club meets ball" },
  { label: "Follow Through", position: 0.85, description: "Post-impact extension" },
  { label: "Finish", position: 1, description: "Full finish position" },
]

interface SwingComparisonProps {
  analysis: SwingAnalysis
  onBack: () => void
  onVideoUploaded: (analysisId: string, field: "pro_video_url" | "personal_video_url", url: string) => void
  onNotesUpdated: (notes: string) => void
}

export function SwingComparison({ analysis, onBack, onVideoUploaded, onNotesUpdated }: SwingComparisonProps) {
  const proVideoRef = useRef<HTMLVideoElement>(null)
  const personalVideoRef = useRef<HTMLVideoElement>(null)
  const [sliderValue, setSliderValue] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [proDuration, setProDuration] = useState(0)
  const [personalDuration, setPersonalDuration] = useState(0)
  const [uploadingPro, setUploadingPro] = useState(false)
  const [uploadingPersonal, setUploadingPersonal] = useState(false)
  const [notes, setNotes] = useState(analysis.notes || "")
  const [savingNotes, setSavingNotes] = useState(false)
  const [activePhase, setActivePhase] = useState<number | null>(null)
  const animationRef = useRef<number | null>(null)
  const [proVideoError, setProVideoError] = useState<string | null>(null)
  const [personalVideoError, setPersonalVideoError] = useState<string | null>(null)
  const [proVideoReady, setProVideoReady] = useState(false)
  const [personalVideoReady, setPersonalVideoReady] = useState(false)
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null)

  const syncVideosToSlider = useCallback(
    (value: number) => {
      const normalizedPosition = value / 100
      if (proVideoRef.current && proDuration > 0) {
        proVideoRef.current.currentTime = normalizedPosition * proDuration
      }
      if (personalVideoRef.current && personalDuration > 0) {
        personalVideoRef.current.currentTime = normalizedPosition * personalDuration
      }

      // Determine active phase
      const phaseIndex = SWING_PHASES.findIndex((phase, i) => {
        const next = SWING_PHASES[i + 1]
        if (!next) return true
        return normalizedPosition >= phase.position && normalizedPosition < next.position
      })
      setActivePhase(phaseIndex >= 0 ? phaseIndex : null)
    },
    [proDuration, personalDuration]
  )

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setSliderValue(value)
    syncVideosToSlider(value)

    // Pause playback when user manually scrubs
    if (isPlaying) {
      setIsPlaying(false)
      proVideoRef.current?.pause()
      personalVideoRef.current?.pause()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }

  const handlePhaseClick = (phaseIndex: number) => {
    const position = SWING_PHASES[phaseIndex].position * 100
    setSliderValue(position)
    syncVideosToSlider(position)
    setActivePhase(phaseIndex)

    if (isPlaying) {
      setIsPlaying(false)
      proVideoRef.current?.pause()
      personalVideoRef.current?.pause()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      proVideoRef.current?.pause()
      personalVideoRef.current?.pause()
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      setIsPlaying(false)
    } else {
      // Reset if at end
      if (sliderValue >= 99) {
        setSliderValue(0)
        syncVideosToSlider(0)
      }
      proVideoRef.current?.play()
      personalVideoRef.current?.play()
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    setSliderValue(0)
    syncVideosToSlider(0)
    setIsPlaying(false)
    proVideoRef.current?.pause()
    personalVideoRef.current?.pause()
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }

  // Sync slider with video playback
  useEffect(() => {
    if (!isPlaying) return

    const updateSlider = () => {
      const refVideo = proVideoRef.current || personalVideoRef.current
      const refDuration = proDuration || personalDuration
      if (refVideo && refDuration > 0) {
        const progress = (refVideo.currentTime / refDuration) * 100
        setSliderValue(Math.min(progress, 100))

        const normalizedPosition = progress / 100
        const phaseIndex = SWING_PHASES.findIndex((phase, i) => {
          const next = SWING_PHASES[i + 1]
          if (!next) return true
          return normalizedPosition >= phase.position && normalizedPosition < next.position
        })
        setActivePhase(phaseIndex >= 0 ? phaseIndex : null)

        if (progress >= 100) {
          setIsPlaying(false)
          return
        }
      }
      animationRef.current = requestAnimationFrame(updateSlider)
    }

    animationRef.current = requestAnimationFrame(updateSlider)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, proDuration, personalDuration])

  const handleVideoUpload = async (type: "pro" | "personal") => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "video/mp4,video/quicktime,video/webm,video/avi,.mp4,.mov,.webm,.avi"
    input.onchange = async (e) => {
      let file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const setUploading = type === "pro" ? setUploadingPro : setUploadingPersonal
      setUploading(true)

      try {
        // Step 1: Validate video duration (max 30 seconds)
        const durationCheck = await validateVideoDuration(file)
        if (!durationCheck.valid) {
          throw new Error(durationCheck.error)
        }

        // Step 2: Check if conversion is needed and convert
        if (needsConversion(file)) {
          setConversionProgress({
            stage: "loading",
            progress: 0,
            message: "Preparing to convert video..."
          })
          
          try {
            file = await convertToMp4(file, (progress) => {
              setConversionProgress(progress)
            })
          } catch (conversionError) {
            console.error("Conversion error:", conversionError)
            throw new Error("Failed to convert video. Please try converting to MP4 manually before uploading.")
          } finally {
            setConversionProgress(null)
          }
        }

        // Step 3: Upload the file
        const formData = new FormData()
        formData.append("file", file)
        formData.append("analysisId", analysis.id)
        formData.append("type", type)

        const res = await fetch("/api/upload-video", { method: "POST", body: formData })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || "Upload failed")

        const field = type === "pro" ? "pro_video_url" : "personal_video_url"
        await updateSwingAnalysisVideo(analysis.id, field, data.url)
        onVideoUploaded(analysis.id, field, data.url)
      } catch (err) {
        console.error("Upload error:", err)
        alert(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setUploading(false)
        setConversionProgress(null)
      }
    }
    input.click()
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      await updateSwingAnalysisNotes(analysis.id, notes)
      onNotesUpdated(notes)
    } catch (err) {
      console.error("Failed to save notes:", err)
    } finally {
      setSavingNotes(false)
    }
  }

  // Video error handlers
  const handleProVideoError = () => {
    console.log("[v0] Pro video error - could not decode")
    setProVideoError("This video format cannot be played in your browser. Try converting to MP4 (H.264) format.")
    setProVideoReady(false)
  }

  const handlePersonalVideoError = () => {
    console.log("[v0] Personal video error - could not decode")
    setPersonalVideoError("This video format cannot be played in your browser. Try converting to MP4 (H.264) format.")
    setPersonalVideoReady(false)
  }

  const handleProVideoCanPlay = () => {
    console.log("[v0] Pro video ready to play")
    setProVideoError(null)
    setProVideoReady(true)
  }

  const handlePersonalVideoCanPlay = () => {
    console.log("[v0] Personal video ready to play")
    setPersonalVideoError(null)
    setPersonalVideoReady(true)
  }

  // Reset video states when analysis changes
  useEffect(() => {
    setProVideoError(null)
    setPersonalVideoError(null)
    setProVideoReady(false)
    setPersonalVideoReady(false)
  }, [analysis.id])

  const hasAnyVideo = analysis.pro_video_url || analysis.personal_video_url
  const hasPlayableVideo = (analysis.pro_video_url && proVideoReady) || (analysis.personal_video_url && personalVideoReady)

  return (
    <div className="space-y-6">
      {/* Conversion Progress Overlay */}
      {conversionProgress && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-80">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
                <div className="text-center">
                  <p className="text-white font-medium">{conversionProgress.message}</p>
                  <p className="text-slate-400 text-sm mt-1">
                    {conversionProgress.stage === "loading" 
                      ? "This may take a moment on first use..."
                      : "Converting video for browser compatibility"}
                  </p>
                </div>
                {conversionProgress.stage === "converting" && (
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${conversionProgress.progress}%` }}
                    />
                  </div>
                )}
                <p className="text-slate-500 text-xs text-center">
                  Videos are automatically converted to MP4 for best compatibility
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{analysis.name}</h1>
          {analysis.pro_player_name && (
            <p className="text-slate-400 text-sm">Comparing with {analysis.pro_player_name}</p>
          )}
        </div>
      </div>

      {/* Side-by-side video panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pro swing panel */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
              Pro Swing {analysis.pro_player_name && `(${analysis.pro_player_name})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.pro_video_url ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  ref={proVideoRef}
                  src={analysis.pro_video_url}
                  className="w-full h-full object-contain"
                  muted
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => setProDuration(e.currentTarget.duration)}
                  onCanPlay={handleProVideoCanPlay}
                  onError={handleProVideoError}
                />
                {proVideoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4">
                    <AlertTriangle className="h-8 w-8 text-amber-400 mb-2" />
                    <p className="text-amber-400 text-sm text-center">{proVideoError}</p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60"
                  onClick={() => handleVideoUpload("pro")}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <button
                onClick={() => handleVideoUpload("pro")}
                disabled={uploadingPro}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-600 hover:border-emerald-600/50 flex flex-col items-center justify-center gap-3 transition-colors bg-slate-900/30"
              >
                <Upload className="h-10 w-10 text-slate-500" />
                <span className="text-slate-400 text-sm">
                  {uploadingPro ? "Uploading..." : "Upload Pro Swing Video"}
                </span>
                <span className="text-slate-600 text-xs">MP4, MOV, WebM (max 30 sec)</span>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Personal swing panel */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              My Swing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.personal_video_url ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  ref={personalVideoRef}
                  src={analysis.personal_video_url}
                  className="w-full h-full object-contain"
                  muted
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => setPersonalDuration(e.currentTarget.duration)}
                  onCanPlay={handlePersonalVideoCanPlay}
                  onError={handlePersonalVideoError}
                />
                {personalVideoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4">
                    <AlertTriangle className="h-8 w-8 text-amber-400 mb-2" />
                    <p className="text-amber-400 text-sm text-center">{personalVideoError}</p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60"
                  onClick={() => handleVideoUpload("personal")}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <button
                onClick={() => handleVideoUpload("personal")}
                disabled={uploadingPersonal}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-600 hover:border-emerald-600/50 flex flex-col items-center justify-center gap-3 transition-colors bg-slate-900/30"
              >
                <Upload className="h-10 w-10 text-slate-500" />
                <span className="text-slate-400 text-sm">
                  {uploadingPersonal ? "Uploading..." : "Upload Your Swing Video"}
                </span>
                <span className="text-slate-600 text-xs">MP4, MOV, WebM (max 30 sec)</span>
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message when videos exist but can't be played */}
      {hasAnyVideo && !hasPlayableVideo && (proVideoError || personalVideoError) && (
        <Card className="bg-amber-900/20 border-amber-700/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-400 font-medium">Video Playback Issue</p>
                <p className="text-amber-400/80 text-sm mt-1">
                  The uploaded video(s) cannot be played in your browser. This usually happens with iPhone videos using HEVC codec.
                </p>
                <p className="text-amber-400/80 text-sm mt-2">
                  <strong>To fix:</strong> Convert your video to MP4 (H.264) format using a free tool like{" "}
                  <a href="https://handbrake.fr/" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">
                    HandBrake
                  </a>{" "}
                  or{" "}
                  <a href="https://cloudconvert.com/mov-to-mp4" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">
                    CloudConvert
                  </a>
                  , then re-upload.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playback controls and phase slider */}
      {hasPlayableVideo && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 space-y-4">
            {/* Play / Pause / Reset */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={togglePlay}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-6"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </div>

            {/* Scrub slider */}
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Swing position"
              />

              {/* Phase markers on slider */}
              <div className="relative h-2 -mt-1">
                {SWING_PHASES.map((phase, i) => (
                  <div
                    key={phase.label}
                    className="absolute top-0 w-0.5 h-2 bg-slate-500"
                    style={{ left: `${phase.position * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Phase buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {SWING_PHASES.map((phase, i) => (
                <button
                  key={phase.label}
                  onClick={() => handlePhaseClick(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activePhase === i
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                >
                  {phase.label}
                </button>
              ))}
            </div>

            {/* Active phase description */}
            {activePhase !== null && (
              <p className="text-center text-sm text-slate-400">
                {SWING_PHASES[activePhase].description}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot down observations about differences in grip, stance, rotation, tempo..."
            rows={4}
            className="w-full rounded-lg bg-slate-900/50 border border-slate-600 text-white placeholder:text-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              {savingNotes ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
