"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Wand2 } from "lucide-react"
import type { DetectionProgress } from "@/lib/pose-detector"

interface AIDetectionOverlayProps {
  progress: DetectionProgress
  videoType: "pro" | "personal"
}

export function AIDetectionOverlay({ progress, videoType }: AIDetectionOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Card className="bg-slate-800 border-slate-700 w-96">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            {progress.stage === "complete" ? (
              <Wand2 className="h-10 w-10 text-emerald-400" />
            ) : (
              <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
            )}
            
            <div className="text-center">
              <p className="text-white font-medium">
                {progress.stage === "complete" 
                  ? "Analysis Complete!" 
                  : `Analyzing ${videoType === "pro" ? "Pro" : "Your"} Swing`}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                {progress.message}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full space-y-2">
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs text-center">
                {progress.progress}% complete
              </p>
            </div>

            {progress.stage === "loading" && (
              <p className="text-slate-500 text-xs text-center">
                Loading pose detection model. This may take a moment on first use...
              </p>
            )}
            
            {progress.stage === "analyzing" && (
              <p className="text-slate-500 text-xs text-center">
                Using AI to identify body positions and detect swing phases
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
