"use client"

import { useState, useEffect } from "react"

const GREETINGS = [
  "Hey",
  "Hello",
  "What's good",
  "Hi there",
  "Yo",
  "Well well well",
  "Look who it is",
  "There they are",
  "Welcome back",
  "What's up",
]

const GOLF_SAYINGS = [
  "how are you hitting them today?",
  "is it done being too cold to play?",
  "when was your last birdie dude?",
  "did you finally fix that slice or are we still blaming the wind?",
  "ready to three-putt your way to glory?",
  "the course isn't going to play itself!",
  "I bet your short game is looking sharp... or at least sharper than last time.",
  "remember, it's not about the score... okay it's a little about the score.",
  "when's the next round? The fairways are calling your name.",
  "you been sneaking in range sessions or just watching YouTube tips?",
  "your handicap called, it wants a word with you.",
  "think you can keep it on the fairway today? Bold strategy.",
  "the 19th hole misses you almost as much as the 1st tee does.",
  "driver or 3-wood off the tee today? Choose wisely, grasshopper.",
  "how many balls are we sacrificing to the water this weekend?",
  "that swing looking buttery smooth yet or still a work in progress?",
  "par is just a number... a number you should try hitting sometime.",
  "hope your putter is feeling hot because the greens won't putt themselves!",
  "grip it and rip it, let's see some birdies out there!",
  "the greens are waiting and so is your best round ever. No pressure.",
  "you coming in hot or are we easing into it with a nice top on the first tee?",
  "bet you've been dreaming about that perfect drive all week.",
  "you know what they say, a bad day on the course beats a good day at work.",
  "tell me you're not still using that beat-up 7-iron from 2012.",
  "the sand traps have been asking about you. They miss your visits.",
  "new round, new you... same three-putt probably, but we believe in you.",
  "you ready to shoot your age? No? How about your weight? Still no? Let's just have fun.",
  "I heard the pin placements are generous today. Your time to shine.",
  "fairways and greens, baby. That's the mantra. Now go do the opposite apparently.",
  "the golf gods are smiling today. Or laughing. Hard to tell from here.",
]

interface GolfGreetingProps {
  displayName?: string | null
  email?: string | null
  isAuthenticated?: boolean
}

export function GolfGreeting({ displayName, email, isAuthenticated = false }: GolfGreetingProps) {
  const name = displayName || (isAuthenticated && email ? email.split("@")[0] : "my fellow visitor")

  const [greeting, setGreeting] = useState<string | null>(null)

  // Persist greeting per session so it stays the same across page switches.
  // Only regenerates on a fresh login (new session).
  useEffect(() => {
    const storageKey = "golf-greeting"
    const storedName = sessionStorage.getItem("golf-greeting-name")
    const storedGreeting = sessionStorage.getItem(storageKey)

    // Reuse stored greeting if the name hasn't changed (same session, same user)
    if (storedGreeting && storedName === name) {
      setGreeting(storedGreeting)
      return
    }

    // Generate new greeting for new session or new user
    const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
    const randomSaying = GOLF_SAYINGS[Math.floor(Math.random() * GOLF_SAYINGS.length)]
    const newGreeting = `${randomGreeting}, ${name}, ${randomSaying}`
    sessionStorage.setItem(storageKey, newGreeting)
    sessionStorage.setItem("golf-greeting-name", name)
    setGreeting(newGreeting)
  }, [name])

  if (!greeting) {
    return <div className="text-center py-2 px-4 h-[44px]" />
  }

  return (
    <div className="text-center py-2 px-4 mb-3">
      <p className="text-base sm:text-lg font-medium text-emerald-400 italic">
        {greeting}
      </p>
    </div>
  )
}
