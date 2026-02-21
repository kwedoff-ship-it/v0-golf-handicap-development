'use client'

import { useEffect, useRef } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const retryCount = useRef(0)

  useEffect(() => {
    // Auto-recover from transient HMR / module factory errors (dev only)
    const isTransient =
      error.message?.includes("module factory is not available") ||
      error.message?.includes("Module") ||
      error.message?.includes("HMR")

    if (isTransient && retryCount.current < 3) {
      retryCount.current += 1
      // Auto-reset after a brief delay to let modules reload
      const timer = setTimeout(() => reset(), 100)
      return () => clearTimeout(timer)
    }

    console.error('Error:', error)
  }, [error, reset])

  // Show nothing during auto-recovery to avoid the flash
  if (retryCount.current < 3) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-900">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Something went wrong!</h2>
        <p className="text-slate-400 mb-6">
          We encountered an error while loading your golf data.
        </p>
        <button
          onClick={() => {
            retryCount.current = 0
            reset()
          }}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
