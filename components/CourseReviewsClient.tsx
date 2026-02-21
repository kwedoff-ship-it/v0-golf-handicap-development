"use client"

import { useState } from "react"
import type { CourseReview, Round } from "@/lib/types"
import { AddReviewForm } from "@/components/AddReviewForm"
import { CourseSearch } from "@/components/CourseSearch"
import { ReviewsList } from "@/components/ReviewsList"
import { TabNavigation } from "@/components/TabNavigation"
import { GolfGreeting } from "@/components/GolfGreeting"

type CourseReviewsClientProps = {
  initialReviews: CourseReview[]
  allRounds: Round[]
  isAuthenticated?: boolean
  profilePictureUrl?: string | null
  displayName?: string | null
  userEmail?: string | null
}

export function CourseReviewsClient({ initialReviews, allRounds, isAuthenticated = false, profilePictureUrl, displayName, userEmail }: CourseReviewsClientProps) {
  const [reviews, setReviews] = useState<CourseReview[]>(initialReviews)
  const [searchResults, setSearchResults] = useState<CourseReview[] | null>(null)

  const handleReviewAdded = (newReview: CourseReview) => {
    setReviews([newReview, ...reviews])
  }

  const handleSearch = (results: CourseReview[] | null) => {
    setSearchResults(results)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <GolfGreeting displayName={displayName} email={userEmail} isAuthenticated={isAuthenticated} />
        <TabNavigation isAuthenticated={isAuthenticated} profilePictureUrl={profilePictureUrl} displayName={displayName} />

        <div className="mt-8 mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">Course Reviews</h1>
          <p className="text-slate-300 text-lg">Share and discover course experiences</p>
        </div>

        <div className="mt-8 mb-8 grid gap-6 lg:grid-cols-2">
          <AddReviewForm allRounds={allRounds} onReviewAdded={handleReviewAdded} />
          <CourseSearch allReviews={reviews} onSearch={handleSearch} />
        </div>

        <ReviewsList reviews={searchResults || reviews} isSearchResult={searchResults !== null} />
      </div>
    </div>
  )
}
