'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-900">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Something went wrong!</h2>
        <p className="text-slate-400 mb-6">
          We encountered an error while loading your golf data.
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
