# Golf Handicap Tracker

A web application for tracking golf rounds and calculating USGA handicap indices using the official World Handicap System.

**Live:** https://handicap-tracker.vercel.app

## Overview

Implements the USGA World Handicap System formula to calculate accurate handicap indices from recorded rounds. Supports multiple players, tracks historical performance, and displays handicap progression over time.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL)
- Vercel (deployment + analytics)

## Key Features

**Player Management**
- Add multiple players with favorite courses
- Switch between player profiles
- View detailed player statistics

**Round Tracking**
- Record rounds with date, course, tee, rating, slope, and score
- Automatic differential calculation
- Historical round data with sortable tables

**Handicap Calculation**
- Official USGA World Handicap System rules
- Uses best N differentials based on total rounds played
- 96% multiplier applied per USGA standards
- Minimum 3 rounds required

**Analytics & Visualization**
- Handicap progression charts (last 6 months)
- Year-over-year statistics
- Global statistics page with ISR

## Architecture

### Rendering Strategy

**Hybrid Server/Client Approach:**
- Server Components fetch initial data (fast first paint)
- Client Components handle UI interactivity
- Server Actions for mutations (no API boilerplate)

**app/page.tsx (Server Component)**
```typescript
export default async function Home() {
  const players = await getPlayers()  // Server-side
  const rounds = await getRounds(playerId)
  
  return <HomeClient initialData={...} />  // Hydrate client
}
```

**ISR for Stats Page:**
```typescript
export const revalidate = 3600  // 1 hour

async function getGlobalStats() {
  // Pre-rendered at build, updates hourly
}
```

### Database Schema

**players**
- id, name, favorite_course

**rounds**
- id, player_id, date, course, tee, rating, slope, score

## Vercel Platform Features

- **Analytics:** Real user tracking (pageviews, geography)
- **Speed Insights:** Core Web Vitals monitoring
- **Edge Middleware:** Security headers on global network
- **Edge Runtime:** API routes deployed globally
- **ISR:** Stats page with hourly revalidation
- **Preview Deployments:** Automatic staging URLs per branch

## Performance

- First Contentful Paint: ~1.0s
- Largest Contentful Paint: ~1.2s
- Core Web Vitals: All "Good" ratings

Server Component strategy minimizes initial JavaScript bundle. Edge deployment reduces latency for international users.

## Local Setup
```bash
git clone https://github.com/kwedoff-ship-it/golf-handicap.git
cd golf-handicap
npm install
npm run dev
```

Environment variables (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key
```

## USGA Handicap Calculation

**Formula:**
```
Differential = (Score - Rating) × 113 / Slope
Handicap Index = Average of best N differentials × 0.96
```

**Number of differentials used:**
- 3-5 rounds: best 1
- 6-8 rounds: best 2
- 9-11 rounds: best 3
- 12-14 rounds: best 4
- 15-17 rounds: best 5
- 18 rounds: best 6
- 19 rounds: best 7
- 20+ rounds: best 8

Implementation: `lib/handicap.ts`

## Project Structure
```
app/
  ├── page.tsx              # Server Component (data fetching)
  ├── layout.tsx            # Analytics + metadata
  ├── stats/page.tsx        # ISR statistics page
  ├── actions/              # Server Actions (mutations)
  └── api/                  # Edge Runtime endpoints

components/
  ├── Dashboard.tsx         # Main UI
  ├── HomeClient.tsx        # Client-side state management
  ├── HandicapChart.tsx     # Recharts visualization
  └── [forms/tables]        # Feature components

lib/
  ├── handicap.ts           # USGA calculation logic
  ├── types.ts              # TypeScript definitions
  └── supabase.ts           # Database client
```

## Future Improvements

- Dynamic player routes (`/player/[id]`)
- Authentication (NextAuth.js)
- Image optimization for player avatars
- Leaderboard page with ISR
- Mobile app (React Native)

## License

MIT
