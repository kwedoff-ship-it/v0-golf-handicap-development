import type { Round, HandicapHistory } from "./types"

// USGA handicap calculation
// Formula: (Score - Rating) × 113 / Slope, then average best N rounds × 96%

/*
 * Why 113?
 * - 113 is the standard slope rating
 * - This normalizes difficulty across all courses
 * - Allows fair comparison between different courses
 * 
 * Why 96%?
 * - Encourages players to play their best
 * - Prevents sandbagging (intentionally playing poorly)
 * - Makes handicaps slightly more competitive
 */

/*
* calculateHandicap([
 *   { score: 85, rating: 72.5, slope: 130, ... },
 *   { score: 90, rating: 72.5, slope: 130, ... },
 *   ...
 * ])
 * Returns: 12.5
 */

export function calculateHandicap(rounds: Round[]): number {
  if (!rounds.length) return 0

  // Calculate differential for each round
  const diffs = rounds.map((r) => ((r.score - r.rating) * 113) / r.slope)

  // USGA rules for how many rounds to use
  let numToUse: number
  const totalRounds = diffs.length

  if (totalRounds >= 20) numToUse = 8
  else if (totalRounds === 19) numToUse = 7
  else if (totalRounds === 18) numToUse = 6
  else if (totalRounds >= 15) numToUse = 5
  else if (totalRounds >= 12) numToUse = 4
  else if (totalRounds >= 9) numToUse = 3
  else if (totalRounds >= 6) numToUse = 2
  else if (totalRounds >= 3) numToUse = 1
  else return 0

  // Take best scores and apply 96% multiplier
  const sortedDiffs = [...diffs].sort((a, b) => a - b)
  const bestDiffs = sortedDiffs.slice(0, numToUse)
  const avgDiff = bestDiffs.reduce((a, b) => a + b, 0) / bestDiffs.length
  const handicapIndex = avgDiff * 0.96

  return Number.parseFloat(handicapIndex.toFixed(1))
}

// Calculate handicap progression over last 6 months for the chart
export function calculateHandicapHistory(rounds: Round[]): HandicapHistory[] {
  if (rounds.length < 3) return []

  const sortedRounds = [...rounds].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const history: HandicapHistory[] = []
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  sortedRounds.forEach((round, index) => {
    const roundsUpToThis = sortedRounds.slice(0, index + 1)
    const roundDate = new Date(round.date)

    if (roundDate >= sixMonthsAgo && roundsUpToThis.length >= 3) {
      const handicap = calculateHandicap(roundsUpToThis)
      history.push({
        date: round.date,
        handicap,
        rounds: roundsUpToThis.length,
      })
    }
  })

  return history
}

export function calculateDifferential(round: Round): number {
  return ((round.score - round.rating) * 113) / round.slope
}
