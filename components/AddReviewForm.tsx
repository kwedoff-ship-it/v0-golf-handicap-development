"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createReview } from "@/app/actions/reviews"
import type { Round, CourseReview } from "@/lib/types"
import { ChevronDown, ChevronUp, Star } from "lucide-react"

const WEATHER_OPTIONS = ["Sunny", "Cloudy", "Rainy", "Windy", "Foggy", "Hot", "Cold", "Perfect"]

type AddReviewFormProps = {
  allRounds: Round[]
  onReviewAdded: (review: CourseReview) => void
}

export function AddReviewForm({ allRounds, onReviewAdded }: AddReviewFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courseName, setCourseName] = useState("")
  const [difficultyRating, setDifficultyRating] = useState<number>(3)
  const [weather, setWeather] = useState("Sunny")
  const [overallRating, setOverallRating] = useState<number>(3)
  const [reviewText, setReviewText] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseName.trim()) return

    setIsSubmitting(true)

    const result = await createReview(
      null, // Reviews are not tied to specific rounds
      courseName,
      difficultyRating,
      weather,
      overallRating,
      reviewText,
    )

    if (result.success) {
      // Reset form
      setCourseName("")
      setDifficultyRating(3)
      setWeather("Sunny")
      setOverallRating(3)
      setReviewText("")
      setIsExpanded(false)

      // Refresh the page to show new review
      window.location.reload()
    }

    setIsSubmitting(false)
  }

  const StarRating = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="transition-colors hover:scale-110">
          <Star className={`h-6 w-6 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`} />
        </button>
      ))}
    </div>
  )

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-xl self-start">
      <button
        className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-xl font-semibold text-white">Add Course Review</h2>
          <p className="text-sm text-slate-300 mt-1">Share your experience on a course</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-300" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-300" />
        )}
      </button>

      {isExpanded && (
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="courseName" className="text-slate-300">
                Course Name
              </Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter course name"
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="difficulty" className="text-slate-300">
                Difficulty Rating
              </Label>
              <StarRating value={difficultyRating} onChange={setDifficultyRating} />
            </div>

            <div>
              <Label htmlFor="weather" className="text-slate-300">
                Weather
              </Label>
              <select
                id="weather"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                {WEATHER_OPTIONS.map((option) => (
                  <option key={option} value={option} className="bg-slate-800">
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="overall" className="text-slate-300">
                Overall Rating
              </Label>
              <StarRating value={overallRating} onChange={setOverallRating} />
            </div>

            <div>
              <Label htmlFor="reviewText" className="text-slate-300">
                Review (Optional)
              </Label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this course..."
                className="w-full min-h-[100px] bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
