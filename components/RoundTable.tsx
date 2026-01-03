// Table component for displaying golf rounds
// Shows date, course, tee, rating, slope, score, and optional differential column
"use client"

import type { Round } from "@/lib/types"
import { calculateDifferential } from "@/lib/handicap"

interface RoundTableProps {
  rounds: Round[]
  showDifferential?: boolean
  maxRows?: number
}

export function RoundTable({
  rounds,
  showDifferential = false,
  maxRows,
}: RoundTableProps) {
  // Limit rows if maxRows is set (for "recent rounds" view)
  const displayRounds = maxRows ? rounds.slice(0, maxRows) : rounds

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm z-10">
          <tr className="bg-slate-800/50">
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
              Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
              Course
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
              Tee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
              Rating
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
              Slope
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
              Score
            </th>
            {showDifferential && (
              <th className="text-left px-6 py-4 text-sm font-semibold text-slate-300">
                Diff
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {displayRounds.length === 0 ? (
            <tr>
              <td
                colSpan={showDifferential ? 7 : 6}
                className="px-6 py-12 text-center text-slate-500"
              >
                No rounds recorded yet
              </td>
            </tr>
          ) : (
            displayRounds.map((r) => {
              const diff = calculateDifferential(r)
              
              return (
                <tr 
                  key={r.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-200 font-medium">
                    {new Date(r.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: showDifferential ? "numeric" : undefined,
                    })}
                  </td>
                  
                  <td className="px-6 py-4 text-slate-200">{r.course}</td>
                  
                  <td className="px-6 py-4 text-slate-300">{r.tee}</td>
                  
                  <td className="px-6 py-4 text-slate-300">{r.rating}</td>
                  
                  <td className="px-6 py-4 text-slate-300">{r.slope}</td>
                  
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {r.score}
                    </span>
                  </td>
                  
                  {showDifferential && (
                    <td className="px-6 py-4 text-slate-300">
                      {diff.toFixed(1)}
                    </td>
                  )}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
