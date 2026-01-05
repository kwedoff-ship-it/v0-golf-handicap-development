"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { getReviewStatsByCourse } from "@/app/actions/reviews"
import type { CourseReview, CourseReviewStats } from "@/lib/types"
import { Search } from "lucide-react"

type CourseSearchProps = {
  allReviews: CourseReview[]
  onSearch: (results: CourseReview[] | null) => void
}

export function CourseSearch({ allReviews, onSearch }: CourseSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState<CourseReviewStats | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setStats(null)
      onSearch(null)
      return
    }

    setIsSearching(true)
    const result = await getReviewStatsByCourse(searchTerm)
    setStats(result)
    onSearch(result?.reviews || [])
    setIsSearching(false)
  }

  const handleClear = () => {
    setSearchTerm("")
    setStats(null)
    onSearch(null)
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl overflow-hidden shadow-xl self-start">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">Search Course</h2>
        <p className="text-sm text-slate-300 mt-1">Find reviews for a specific course</p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter course name..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder-slate-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-all"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {stats && (
          <div className="space-y-2 rounded-lg bg-emerald-900/30 border border-emerald-700/50 p-4">
            <h3 className="font-semibold text-emerald-300">{stats.course_name}</h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-slate-400">Reviews</p>
                <p className="font-bold text-white">{stats.total_reviews}</p>
              </div>
              <div>
                <p className="text-slate-400">Avg Difficulty</p>
                <p className="font-bold text-white">{stats.avg_difficulty}/5</p>
              </div>
              <div>
                <p className="text-slate-400">Avg Rating</p>
                <p className="font-bold text-white">{stats.avg_overall}/5</p>
              </div>
            </div>
          </div>
        )}

        {stats && (
          <button
            onClick={handleClear}
            className="w-full border border-slate-700 hover:bg-slate-800/50 bg-transparent text-white rounded-lg px-4 py-2 transition-colors"
          >
            Clear Search
          </button>
        )}
      </div>
    </div>
  )
}
