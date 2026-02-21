"use client"

import { useState } from "react"
import { TabNavigation } from "@/components/TabNavigation"
import { GolfGreeting } from "@/components/GolfGreeting"
import { SwingComparison } from "@/components/SwingComparison"
import { Plus, Trash2, Video, FileVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { SwingAnalysis } from "@/app/actions/swing-analysis"
import {
  createSwingAnalysis,
  deleteSwingAnalysis,
  updateSwingAnalysisVideo,
  updateSwingAnalysisNotes,
} from "@/app/actions/swing-analysis"

interface SwingAnalysisClientProps {
  initialAnalyses: SwingAnalysis[]
  isAuthenticated?: boolean
  profilePictureUrl?: string | null
  displayName?: string | null
  userEmail?: string | null
}

export function SwingAnalysisClient({
  initialAnalyses,
  isAuthenticated = false,
  profilePictureUrl,
  displayName,
  userEmail,
}: SwingAnalysisClientProps) {
  const [analyses, setAnalyses] = useState<SwingAnalysis[]>(initialAnalyses)
  const [selectedAnalysis, setSelectedAnalysis] = useState<SwingAnalysis | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newProName, setNewProName] = useState("")
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const analysis = await createSwingAnalysis(newName.trim(), newProName.trim() || undefined)
      if (analysis) {
        setAnalyses([analysis, ...analyses])
        setNewName("")
        setNewProName("")
        setShowCreateForm(false)
        setSelectedAnalysis(analysis)
      }
    } catch (err) {
      console.error("Failed to create analysis:", err)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await deleteSwingAnalysis(id)
      setAnalyses(analyses.filter((a) => a.id !== id))
      if (selectedAnalysis?.id === id) setSelectedAnalysis(null)
    } catch (err) {
      console.error("Failed to delete:", err)
    } finally {
      setDeleting(null)
    }
  }

  const handleVideoUploaded = (analysisId: string, field: "pro_video_url" | "personal_video_url", url: string) => {
    setAnalyses(
      analyses.map((a) => (a.id === analysisId ? { ...a, [field]: url, updated_at: new Date().toISOString() } : a))
    )
    if (selectedAnalysis?.id === analysisId) {
      setSelectedAnalysis({ ...selectedAnalysis, [field]: url })
    }
  }

  // If an analysis is selected, show the comparison view
  if (selectedAnalysis) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <GolfGreeting displayName={displayName} email={userEmail} isAuthenticated={isAuthenticated} />
          <TabNavigation
            isAuthenticated={isAuthenticated}
            profilePictureUrl={profilePictureUrl}
            displayName={displayName}
          />
          <SwingComparison
            analysis={selectedAnalysis}
            onBack={() => setSelectedAnalysis(null)}
            onVideoUploaded={handleVideoUploaded}
            onNotesUpdated={(notes) => {
              setAnalyses(
                analyses.map((a) =>
                  a.id === selectedAnalysis.id ? { ...a, notes } : a
                )
              )
              setSelectedAnalysis({ ...selectedAnalysis, notes })
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <GolfGreeting displayName={displayName} email={userEmail} isAuthenticated={isAuthenticated} />
        <TabNavigation
          isAuthenticated={isAuthenticated}
          profilePictureUrl={profilePictureUrl}
          displayName={displayName}
        />

        <div className="mt-8 mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">Swing Analysis</h1>
          <p className="text-slate-300 text-lg">Compare your swing side-by-side with the pros</p>
        </div>

        {/* Create new analysis */}
        {isAuthenticated && !showCreateForm && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Plus className="h-5 w-5" />
              New Analysis
            </Button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="text-center mb-8">
            <p className="text-slate-400">Log in to create swing analyses and upload videos.</p>
          </div>
        )}

        {showCreateForm && (
          <Card className="mb-8 mx-auto max-w-lg bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Analysis</CardTitle>
              <CardDescription className="text-slate-400">
                Name your analysis and optionally specify the pro player to compare against
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="analysis-name" className="text-slate-300">
                    Analysis Name
                  </Label>
                  <Input
                    id="analysis-name"
                    placeholder='e.g. "Driver Swing - Feb 2026"'
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pro-name" className="text-slate-300">
                    Pro Player Name (optional)
                  </Label>
                  <Input
                    id="pro-name"
                    placeholder='e.g. "Tiger Woods", "Rory McIlroy"'
                    value={newProName}
                    onChange={(e) => setNewProName(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewName("")
                      setNewProName("")
                    }}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {creating ? "Creating..." : "Create Analysis"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Analysis list */}
        {analyses.length === 0 && !showCreateForm ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No analyses yet</h3>
            <p className="text-slate-500">
              {isAuthenticated
                ? 'Create your first swing analysis to start comparing with the pros.'
                : 'Log in to start analyzing your swing.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analyses.map((analysis) => (
              <Card
                key={analysis.id}
                className="bg-slate-800/50 border-slate-700 hover:border-emerald-600/50 transition-colors cursor-pointer group"
                onClick={() => setSelectedAnalysis(analysis)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-lg truncate group-hover:text-emerald-400 transition-colors">
                        {analysis.name}
                      </CardTitle>
                      {analysis.pro_player_name && (
                        <CardDescription className="text-slate-400 mt-1">
                          vs. {analysis.pro_player_name}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(analysis.id)
                      }}
                      disabled={deleting === analysis.id}
                      aria-label="Delete analysis"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <FileVideo
                        className={`h-4 w-4 ${analysis.pro_video_url ? "text-emerald-400" : "text-slate-600"}`}
                      />
                      <span className={analysis.pro_video_url ? "text-emerald-400" : "text-slate-500"}>
                        Pro
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileVideo
                        className={`h-4 w-4 ${analysis.personal_video_url ? "text-emerald-400" : "text-slate-600"}`}
                      />
                      <span className={analysis.personal_video_url ? "text-emerald-400" : "text-slate-500"}>
                        Personal
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    {new Date(analysis.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
