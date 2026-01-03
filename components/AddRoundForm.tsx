// Collapsible form for recording new golf rounds
// Handles form state, validation, and submission
"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface AddRoundFormProps {
  onAddRound: (round: {
    player_id: string
    date: string
    course: string
    tee: string
    rating: number
    slope: number
    score: number
  }) => Promise<{ success: boolean; error?: string }>
  playerId: string | null
}

export function AddRoundForm({ onAddRound, playerId }: AddRoundFormProps) {
  // Track if form is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Store all form field values (as strings initially, converted to numbers on submit)
  const [formData, setFormData] = useState({
    date: "",
    course: "",
    tee: "",
    rating: "",
    slope: "",
    score: "",
  })
  
  // Loading state to prevent duplicate submissions
  const [loading, setLoading] = useState(false)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Don't submit if no player selected
    if (!playerId) return

    setLoading(true)

    // Convert string inputs to numbers and submit
    const result = await onAddRound({
      player_id: playerId,
      date: formData.date,
      course: formData.course,
      tee: formData.tee,
      rating: Number.parseFloat(formData.rating),
      slope: Number.parseInt(formData.slope),
      score: Number.parseInt(formData.score),
    })

    // Clear form and collapse on success
    if (result.success) {
      setFormData({
        date: "",
        course: "",
        tee: "",
        rating: "",
        slope: "",
        score: "",
      })
      setIsExpanded(false)
    }

    setLoading(false)
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl shadow-xl overflow-hidden">
      {/* Header button to expand/collapse form */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
      >
        <h2 className="text-xl font-semibold text-white">Record New Round</h2>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Form fields - only visible when expanded */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-slate-800 pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First row: Date and Course */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  placeholder="Course name"
                  value={formData.course}
                  onChange={(e) =>
                    setFormData({ ...formData, course: e.target.value })
                  }
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Second row: Tee, Rating, Slope, Score */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tee
                </label>
                <input
                  type="text"
                  placeholder="Blue"
                  value={formData.tee}
                  onChange={(e) =>
                    setFormData({ ...formData, tee: e.target.value })
                  }
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="72.5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Slope
                </label>
                <input
                  type="number"
                  placeholder="130"
                  value={formData.slope}
                  onChange={(e) =>
                    setFormData({ ...formData, slope: e.target.value })
                  }
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Score
                </label>
                <input
                  type="number"
                  placeholder="85"
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({ ...formData, score: e.target.value })
                  }
                  required
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !playerId}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium px-4 py-3 rounded-lg transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50"
            >
              {loading ? "Saving Round..." : "Save Round"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
