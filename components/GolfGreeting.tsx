"use client"

import { useMemo } from "react"

const GOLF_SAYINGS = [
  "Hey, {name}, how are you hitting them today?",
  "Hey, {name}, is it done being too cold to play?",
  "Hey, {name}, when was your last birdie dude?",
  "Hey, {name}, did you finally fix that slice?",
  "Hey, {name}, ready to three-putt your way to glory?",
  "Hey, {name}, the course isn't going to play itself!",
  "Hey, {name}, I bet your short game is looking sharp today.",
  "Hey, {name}, remember: it's not about the score, it's about the vibes.",
  "Hey, {name}, when's the next round? The fairways are calling.",
  "Hey, {name}, you been sneaking in range sessions or what?",
  "Hey, {name}, your handicap is shaking in its boots right now.",
  "Hey, {name}, think you can keep it on the fairway today?",
  "Hey, {name}, the 19th hole misses you almost as much as the 1st.",
  "Hey, {name}, driver or 3-wood off the tee today? Choose wisely.",
  "Hey, {name}, how many balls are we losing this weekend?",
  "Hey, {name}, that swing looking buttery smooth yet?",
  "Hey, {name}, par is just a number... a number you should aim for.",
  "Hey, {name}, hope your putter is feeling hot today!",
  "Hey, {name}, grip it and rip it, let's see some birdies!",
  "Hey, {name}, the greens are waiting and so is your best round ever.",
]

interface GolfGreetingProps {
  displayName?: string | null
  email?: string | null
  isAuthenticated?: boolean
}

export function GolfGreeting({ displayName, email, isAuthenticated = false }: GolfGreetingProps) {
  const name = displayName || (isAuthenticated && email ? email.split("@")[0] : "my fellow visitor")

  const greeting = useMemo(() => {
    // Seed by the current date so it changes daily but stays consistent within a session
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
    const index = seed % GOLF_SAYINGS.length
    return GOLF_SAYINGS[index].replace("{name}", name)
  }, [name])

  return (
    <div className="text-center py-3 px-4">
      <p className="text-base sm:text-lg font-medium text-emerald-400 italic">
        {greeting}
      </p>
    </div>
  )
}
