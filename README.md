# Golf Handicap Tracker

A web application for tracking golf rounds, calculating USGA handicap indices, and analyzing swing mechanics with AI-powered pose detection.

**Live:** https://handicap-tracker.vercel.app

## Overview

Implements the USGA World Handicap System formula to calculate accurate handicap indices from recorded rounds. Supports multiple players, tracks historical performance, and includes an AI-powered swing analysis module for side-by-side video comparison with automatic phase detection.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL + Auth)
- TensorFlow.js MoveNet (AI pose detection)
- FFmpeg WASM (client-side video conversion)
- Vercel (deployment + Blob storage + analytics)

## Key Features

**Authentication**
- Supabase Auth with email/password login and signup
- Password reset flow
- Protected routes with server-side auth checks

**Player Management**
- Add multiple players with profile pictures and favorite courses
- Switch between player profiles
- Inline handicap and rank badges

**Round Tracking**
- Record rounds with date, course, tee, rating, slope, and score
- Automatic differential calculation
- Historical round data with sortable tables

**Handicap Calculation**
- Official USGA World Handicap System rules
- Uses best N differentials based on total rounds played
- 96% multiplier applied per USGA standards
- Minimum 3 rounds required

**Course Reviews**
- Rate courses by difficulty and conditions
- Weather and overall ratings
- Aggregated course statistics

**Swing Analysis (AI-Powered)**
- Upload personal and pro golfer swing videos (up to 50MB, max 30 seconds)
- Client-side MOV → MP4 conversion via FFmpeg WASM
- AI pose detection using TensorFlow.js MoveNet (CDN-based)
- Automatic 7-phase swing detection:
  - Address → Takeaway → Top of Backswing → Downswing → Impact → Follow Through → Finish
- Side-by-side video comparison with portrait-friendly layout
- Phase scrubber with frame-by-frame stepping
- Adjustable video size controls
- Save phase markers to database
- Confidence scoring per detected phase

**Analytics & Visualization**
- Handicap progression charts (last 6 months)
- Year-over-year statistics
- Global statistics page with ISR (hourly revalidation)

## Architecture

### Rendering Strategy

**Hybrid Server/Client Approach:**
- Server Components fetch initial data (fast first paint)
- Client Components handle UI interactivity
- Server Actions for mutations (no API boilerplate)
- Edge Runtime for video upload API routes

**ISR for Stats Page:**
```typescript
export const revalidate = 3600  // 1 hour
```

### Video Processing Pipeline

1. Client-side duration validation (max 30 seconds)
2. FFmpeg WASM converts MOV → MP4
3. MoveNet AI detects pose keypoints per frame
4. Phase markers derived from keypoint positions with confidence scores
5. Video uploaded to Vercel Blob (`/swing-videos/{userId}/{analysisId}/{type}`)
6. Phase timestamps and metadata saved to Supabase

### Cross-Origin Headers

The `/swing-analysis` route uses specific COEP/COOP headers to enable FFmpeg WASM and TensorFlow.js CDN resources:
```
Cross-Origin-Embedder-Policy: credentialless
Cross-Origin-Opener-Policy: same-origin
```

### Database Schema

**players**
- id, name, favorite_course, profile_picture

**rounds**
- id, player_id, date, course, tee, rating, slope, score

**course_reviews**
- id, player_id, course, difficulty, conditions, weather, overall_rating

**swing_analyses**
- id, user_id, pro_video_url, personal_video_url, phase marker columns, notes, created_at

**user_profiles**
- id, display_name, profile_picture

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
  ├── auth/                   # Login, signup, password reset
  ├── overview/               # Dashboard
  ├── handicap/               # Handicap details
  ├── reviews/                # Course reviews
  ├── swing-analysis/         # AI swing analysis
  ├── settings/               # User settings
  ├── stats/                  # ISR global statistics
  ├── actions/                # Server Actions (mutations)
  └── api/
      ├── upload/             # Image uploads (Edge Runtime)
      └── upload-video/       # Video uploads to Vercel Blob (Edge Runtime)

components/
  ├── SwingAnalysisClient.tsx # Main swing analysis UI
  ├── SwingComparison.tsx     # Side-by-side video player
  ├── SwingPhaseControls.tsx  # Scrubber, phase markers, save
  ├── AIDetectionOverlay.tsx  # Pose keypoint visualization
  ├── Dashboard.tsx
  ├── HandicapChart.tsx
  ├── CourseSearch.tsx
  ├── PlayerSelector.tsx
  └── [forms/tables]

lib/
  ├── handicap.ts             # USGA calculation logic
  ├── pose-detector.ts        # MoveNet AI pose detection
  ├── video-converter.ts      # FFmpeg WASM conversion
  ├── types.ts                # TypeScript definitions
  └── supabase/               # Client, server, and proxy clients
```

## Vercel Platform Features

- **Blob Storage:** Swing video hosting with user-scoped paths
- **Analytics:** Real user tracking (pageviews, geography)
- **Speed Insights:** Core Web Vitals monitoring
- **Edge Runtime:** API routes deployed globally
- **ISR:** Stats page with hourly revalidation
- **Preview Deployments:** Automatic staging URLs per branch

## Local Setup
```bash
git clone https://github.com/kwedoff-ship-it/v0-golf-handicap-development.git
cd v0-golf-handicap-development
pnpm install
pnpm dev
```

Environment variables (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_KEY=your_service_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## License

MIT
