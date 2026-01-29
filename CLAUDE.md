# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack fitness tracking application built with Next.js 15 (App Router), TypeScript, TailwindCSS, and SQLite/Prisma. Single-user local application for tracking workouts, rest times, macros, and viewing progress reports.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **State Management**: Zustand (for active workout & rest timer state with persistence)
- **Data Fetching**: SWR (planned for caching and optimistic updates)
- **Charts**: Recharts (for reports and analytics)

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Database commands
npm run db:push        # Push schema changes to database
npm run db:seed        # Seed database with workout templates from workout-routine.md
npm run db:studio      # Open Prisma Studio (database GUI)

# Development
npm run dev            # Start development server (http://localhost:3000)
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

### First Time Setup
```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Troubleshooting
If you encounter `.next` permission errors on Windows:
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Force delete .next directory
powershell -Command "if (Test-Path .next) { Remove-Item -Recurse -Force .next }"

# Restart dev server
npm run dev
```

**After schema changes:**
```bash
# Always regenerate Prisma client after modifying schema.prisma
npx prisma generate

# Then push changes to database
npm run db:push
```

## Database Schema

### Core Models
- **Workout**: Main workout session with date, duration, notes
- **Exercise**: Individual exercises within a workout with targetSets, targetReps, targetWeight (linked to workout)
- **Set**: Individual sets within an exercise (reps, weight, RPE, rest time, completed status)
- **MacroLog**: Daily macro tracking (calories, protein, carbs, fats) - multiple meals per day
- **WorkoutTemplate**: Pre-defined workout routines
- **TemplateExercise**: Exercises within templates with target sets/reps/weights
- **PersonalRecord**: Track PRs by exercise name, weight, and reps
- **RestTimerPreset**: Common rest timer durations (30s, 60s, 90s, 2min, 3min)
- **FavoriteMeal**: Saved meals for quick macro logging
- **ProgressPhoto**: Visual transformation tracking (base64 images with date, category, weight, notes)

### Important Relationships
- Workout → Exercises → Sets (cascade delete enabled)
- WorkoutTemplate → TemplateExercises (cascade delete enabled)
- MacroLog has unique constraint on `date` (one log per day)
- All date fields are indexed for query performance

### Database Location
`prisma/dev.db` (SQLite file, gitignored)

## Architecture

### API Routes (REST Pattern)

All API routes follow consistent response format:
```typescript
// Success
{ data: T, success: true }

// Error
{ error: string, success: false }
```

**Templates:**
- `GET /api/templates` - List all workout templates with exercises
- `GET /api/templates/[id]` - Get specific template
- `POST /api/templates/[id]/instantiate` - Create new workout from template

**Workouts:**
- `POST /api/workouts` - Create workout with nested exercises/sets
- `GET /api/workouts` - List workouts with filters and date range (supports ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
- `GET /api/workouts/[id]` - Get specific workout with exercises/sets
- `POST /api/workouts/[id]/complete` - Mark workout complete, calculate duration
- `PUT /api/workouts/[id]` - Update workout name and notes
- `DELETE /api/workouts/[id]` - Delete workout
- `PUT /api/workouts/[id]/exercises/[exerciseId]/sets` - Batch update sets

**Personal Records:**
- `POST /api/personal-records` - Auto-detect PRs from completed workout
- `GET /api/personal-records` - List all personal records
- `GET /api/exercises/[name]/history` - Get exercise progression history with stats

**Macros:**
- `POST /api/macros` - Upsert macro log for date (create or update)
- `GET /api/macros` - List macro logs with date range filters
- `GET /api/macros/[date]` - Get macros for specific date
- `DELETE /api/macros/[date]` - Delete macro log
- `GET /api/macros/stats?period=week|month|7days|30days` - Get macro statistics

**Reports:**
- `GET /api/reports/weekly?date=YYYY-MM-DD` - Weekly aggregated stats with comparisons
- `GET /api/reports/monthly?date=YYYY-MM-DD` - Monthly aggregated stats with analytics

**Progress Photos:**
- `POST /api/progress-photos` - Upload new progress photo (base64 encoded)
- `GET /api/progress-photos` - List photos with optional category/date filtering
- `DELETE /api/progress-photos/[id]` - Delete progress photo

### State Management

**Zustand Stores** (with localStorage persistence):
1. `lib/stores/activeWorkoutStore.ts` - Active workout session state
   - Tracks current workout ID, exercises, sets, completion status
   - Persists across page refresh
   - Critical for workout logging UX

2. `lib/stores/timerStore.ts` - Rest timer state
   - Timer countdown (isActive, isPaused, timeRemaining, totalDuration)
   - Survives navigation between pages
   - Triggers browser notifications and sound when complete

3. `lib/stores/settingsStore.ts` - User settings state
   - Macro targets (calories, protein, carbs, fats)
   - Persists user preferences across sessions
   - Storage key: `settings-storage`
   - Includes refresh mechanism for PWA sync issues

**Why Zustand over Context:**
- Better performance (no whole-tree re-renders)
- Built-in persistence middleware
- Simpler API for complex state
- Easier to debug
- Reliable localStorage persistence (important for PWA)

### Component Organization

```
components/
├── ui/                    # Base components (Button, Card, Input, Select, Modal)
├── layout/                # Navigation with dark mode toggle
├── workout/               # Workout-related components
│   ├── ActiveWorkout/     # Active workout logging interface
│   │   ├── SetRow.tsx     # Standard gym exercise set tracking
│   │   ├── ShootingRow.tsx # Shooting drill tracking (makes/attempts)
│   │   └── ExerciseTracker.tsx # Exercise container with type detection
│   └── RestTimer/         # Rest timer with controls
├── macro/                 # Macro tracking components
├── template/              # Template cards and lists
└── report/                # Analytics and charts
```

### Key Features Implemented

**Phase 1: Foundation** ✅
- Next.js 15 setup with TypeScript and TailwindCSS
- Prisma schema with all models, relationships, indexes, constraints
- Base UI components (Button, Card, Input, Select, Modal)
- Global layout with navigation
- Browser notification permission request

**Phase 2: Templates & Seeding** ✅
- Seed script parses `workout-routine.md` and creates 5 workout templates
- Template API routes (list, get, instantiate)
- Template display page with cards
- "Start Workout" button creates workout from template

**Phase 3: Active Workout Logging** ✅
- Zustand store for active workout state with persistence
- Complete workout API (CRUD operations)
- ActiveWorkout components (SetRow, ExerciseTracker)
- Real-time set completion tracking
- Workout duration calculation

**Phase 4: Rest Timer** ✅
- Complete timer store with persistence
- SVG circular progress indicator
- Auto-start timer on set completion
- Browser notifications and sound
- Keyboard shortcuts (spacebar)
- Actual rest time tracking in database

**Phase 5: Workout History Enhancements** ✅
- Complete workout editing functionality
- Personal records auto-detection
- Exercise progression history with stats
- Search and filtering in workout list
- Enhanced dashboard with real-time statistics
- RPE tracking for sets

**Phase 6: Macro Tracking with Charts** ✅
- Macro API routes (upsert, list, get by date, stats)
- MacroForm with validation and calorie calculator
- Macro dashboard with progress bars to targets
- MacroChart component with Recharts for trends visualization
- Macro history view with monthly navigation
- Settings page for customizable macro targets
- Settings store (Zustand) for user preferences

**Phase 7: Weekly/Monthly Reports with Analytics** ✅
- Weekly report API with aggregated stats and comparisons
- Monthly report API with comprehensive analytics
- Reports dashboard with quick highlights
- Weekly report page with daily breakdown charts
- Monthly report page with weekly breakdown charts
- StatCard component for displaying metrics with change indicators
- VolumeChart component (Recharts) for visualizing trends
- Week-over-week and month-over-month comparisons
- Top exercises by volume and frequency tracking
- Consistency rate and compliance metrics
- Personal records highlights in reports

**Phase 8: Polish & Production Ready** ✅
- Toast notification system (success, error, warning, info variants)
- Global error boundary with user-friendly error pages
- Keyboard shortcuts for navigation and common actions
- Help modal with keyboard shortcut guide (press / or ?)
- Data export functionality (JSON and CSV for workouts and macros)
- Loading skeleton components for better perceived performance
- Custom animations (slide-in, fade-in, pulse)
- Integrated toast notifications throughout the app
- Error handling improvements across all API routes
- Form validation with better user feedback

**Phase 9: Basketball Training & Mobile-First Design** ✅
- **Basketball Drills Integration**:
  - Daily warm-up template (ball handling, shooting prep)
  - Ball handling drills with duration/reps tracking
  - Shooting drills with makes/attempts format (e.g., "10/15" = 67%)
  - Conditioning work with intervals
  - ShootingRow component with automatic percentage calculation
  - Core exercises tracking
  - 6 total templates including basketball training

- **Default Weights**:
  - Weight extraction from workout-routine.md
  - Automatic weight placeholders in Set inputs
  - Exercise model includes targetSets, targetReps, targetWeight
  - Template instantiation copies target values to workout exercises

- **Mobile-First Responsive Design**:
  - Bottom tab navigation on mobile (fixed, 7 tabs with icons)
  - Mobile nav: 🏠 Home, 📋 Templates, 💪 Workouts, 📅 Calendar, 🍎 Macros, 📸 Photos, ⚙️ Settings
  - All touch targets minimum 44px (iOS standard)
  - Buttons and inputs optimized for touch
  - Vertical stacking on small screens
  - Responsive typography (text-2xl mobile, text-3xl desktop)
  - Bottom padding to account for navigation bar

- **Black & White Dark Mode**:
  - Pure black background (bg-black) with zinc color palette
  - High contrast white text and accents
  - Zinc-950 cards with zinc-800 borders
  - Dark mode toggle button (floating on mobile, nav on desktop)
  - Theme persistence in localStorage
  - Smooth theme transitions

**Phase 10: Calendar View & PWA Enhancements** ✅
- **Calendar View**:
  - Monthly calendar grid showing all workout days
  - Visual indicators: green for completed workouts, yellow for in-progress
  - Click on workouts to view details or resume
  - Month navigation (previous, next, today buttons)
  - Summary statistics: completed workouts, total time, total volume
  - Highlights current day with blue background
  - Date range filtering in workouts API (startDate/endDate query params)
  - Responsive design with mobile-optimized text sizes

- **PWA Settings Sync**:
  - Settings hydration check for proper localStorage loading
  - "Refresh Settings" button to force reload from localStorage
  - "Clear Cache" button to clear service worker caches and reload app
  - Current values display showing actual stored settings
  - Toast notifications for better user feedback
  - Fixes sync issues between desktop and mobile PWA

- **Navigation Improvements**:
  - Settings and Photos added to mobile bottom navigation (7 items)
  - Mobile nav: Home, Templates, Workouts, Calendar, Macros, Photos, Settings
  - Desktop nav: All 7 main items + Reports + Personal Records + Theme toggle
  - Reports moved to desktop-only (less frequently accessed on mobile)

- **Auto-Drill Timer**:
  - Automatic 15-second timer for ball handling drills
  - 5-second countdown before first drill
  - Auto-progression through all drills with sound alerts
  - Pause, resume, skip controls
  - Progress bar showing current drill position
  - Timer continues running even when app is closed (timestamp-based)
  - Page Visibility API for background/foreground detection

- **Rest Timer Modal**:
  - Auto-opens as modal popup after completing a set
  - No need to scroll to find timer
  - Close button (X) in top-right corner
  - Default 90-second timer auto-starts
  - Manual timer button (⏱️ Rest Timer) also available

- **Workout Resume**:
  - "In Progress" badge for incomplete workouts (no duration)
  - "Resume Workout" button for incomplete workouts
  - "View Details" button for completed workouts
  - Prevents accidental workout loss

**Phase 11: Progress Photos & Workout Refinements** ✅
- **Progress Photos**:
  - Photo upload with camera/file input (mobile camera capture supported)
  - Four categories: Front, Back, Side, Other
  - Gallery grid view with filter by category
  - Click to select photos for comparison (up to 4 at once)
  - Side-by-side comparison modal with full details
  - Optional weight and notes per photo
  - Base64 storage in PostgreSQL
  - 5MB file size limit with validation
  - Track visual transformation over time
  - Added to mobile navigation (📸 Photos)

- **Daily Warm-up Enhanced** (23 exercises):
  - 14 ball handling drills (15 sec each, auto timer)
  - 4 stationary moves (reps)
  - 5 shooting drills with makes/attempts tracking:
    - 5ft Spot Shooting: 50 makes
    - Short Mid-Range: 50 makes
    - Mid-Range: 15 makes
    - 3-Point Line: 15 makes
    - Free Throws: 20 attempts
  - Total: 130 target makes + 20 free throw attempts
  - Removed jump rope and air shots

- **Workout Template Updates**:
  - Thursday: Complete redesign as Structured Game Simulation
    - Block 1: 8 rounds of 45sec basketball movements (20 min)
    - Block 2: 3 sets of 10 free throws with burpee penalties (15 min)
    - Block 3: 3 rounds of 2-minute attack simulation (10 min)
    - Total: 45 minutes of pure basketball conditioning

  - Friday: Arms workout reorganization
    - Superset 1: EZ Bar Curls + Hammer Curls (biceps focus)
    - Superset 2: Overhead Tricep Ext + Concentration Curls (alternating)
    - Superset 3: Tricep Pushdowns + Cable Curls (classic pairing)
    - Giant Set: 3 tricep bodyweight + light bicep pump

  - Monday: Simplified to pure strength/power
    - Removed ball handling and shooting drills
    - 12 exercises: 6 upper body, 4 lower body, 2 core
    - Session reduced from ~105 min to ~80 min

- **Free Throws Under Fatigue**:
  - Added 20 free throw attempts to end of each main workout
  - Monday, Tuesday, Wednesday, Friday: after core/finisher
  - Thursday: already included (30 attempts with penalties)
  - Builds mental toughness and shooting consistency when tired
  - Track makes/attempts for FT% tracking

- **Auto-Drill Timer Improvements**:
  - Enhanced detection for "in-and-out" dribbles
  - Recognizes variations: "in and out", "in-and-out", "side v"
  - All 14 ball handling drills properly detected

**All Phases Complete!** 🎉

## Important Files

### Critical Files (Get These Right First)
1. `prisma/schema.prisma` - Database schema (foundation of everything)
2. `lib/stores/activeWorkoutStore.ts` - Complex workout state management
3. `lib/stores/timerStore.ts` - Timer state with persistence
4. `lib/stores/settingsStore.ts` - User settings (macro targets, preferences)
5. `lib/prisma.ts` - Prisma client singleton (already implemented)

### Workout Template Parser
`prisma/seed.ts` - Parses markdown workout routine into database templates
- **Gym exercises**: `/^(\d+)\.\s+\*\*(.+?)\*\*\s+-\s+(.+?)$/gm` - Handles "4 x 10-12" format
- **Ball handling drills**: `/^\d+\.\s+(.+?):\s+(\d+)\s+(sec|reps)/gm`
- **Shooting drills**: `/^\d+\.\s+\*\*(.+?)\*\*:\s*(\d+)\s*(makes?|attempts?)/gm`
  - Uses `matchAll()` to handle multiple SHOOTING sections per workout
  - Parses all shooting sections (including free throws under fatigue)
- **Conditioning work**: Parses intervals with work/rest periods
- **Core exercises**: `/^-\s+(.+?):\s+(\d+)\s+x\s+(.+?)$/gm`
- **Weight extraction**: Parses default weights from exercise descriptions (e.g., "10kg dumbbells", "Start with 20kg")
- Extracts exercise name, sets, reps, and weights from workout-routine.md
- Creates 6 templates: Daily Warm-up, Monday-Friday workouts
- Prefixes exercises with type tags: [GYM], [BALL], [SHOOT], [COND], [CORE]
- Daily Warm-up: 23 exercises (14 ball handling, 4 stationary, 5 shooting)
- Monday: 13 exercises (6 upper, 4 lower, 2 core, 1 shooting)
- Tuesday: 11 exercises (7 upper, 2 conditioning, 1 core, 1 shooting)
- Wednesday: 11 exercises (6 lower, 4 abs, 1 shooting)
- Thursday: 7 exercises (game simulation blocks)
- Friday: 11 exercises (10 arms, 1 shooting)

### API Route Patterns
- All routes in `app/api/**/route.ts` (App Router convention)
- Use `await params` for dynamic routes in Next.js 15
- Prisma client imported from `@/lib/prisma`
- Always include `{ success: boolean }` in responses

## Code Conventions

### TypeScript
- Strict mode enabled
- No `any` types (use proper interfaces)
- Define interfaces for API responses and component props
- Use Prisma-generated types where possible

### React
- Use `'use client'` directive for client components
- Server components by default (no directive needed)
- Async server components for data fetching

### Styling
- TailwindCSS utility classes
- **Dark mode**: Black & white theme with zinc palette
  - Background: `bg-black` (pure black)
  - Cards: `bg-zinc-950` with `border-zinc-800`
  - Text: `text-white` (headings), `text-zinc-300/400/500` (body/labels)
  - Borders: `border-zinc-700/800`
  - Primary buttons: White bg with black text in dark mode
- **Mobile-first responsive design**:
  - Touch targets minimum 44px (`min-h-[44px]`)
  - Bottom navigation on mobile, top nav on desktop
  - Responsive breakpoints: `md:` (768px+), `lg:` (1024px+)
- **Color palette**:
  - Primary: Blue-600 (light mode), White (dark mode)
  - Success: Green-50/950
  - Danger: Red-600
  - Background: White (light), Black (dark)
  - Text: Gray-900 (light), White/Zinc shades (dark)

### Database Queries
- Always use Prisma client (never raw SQL)
- Include relationships with `include` when needed
- Add `orderBy` for consistent ordering
- Use `onDelete: Cascade` for related records
- Index date fields and foreign keys

## Testing the App

### Manual Testing Checklist

**Current State:**
1. Visit http://localhost:3000 - Should see dashboard with stats
2. Click "Templates" - Should see 6 workout templates (Daily Warm-up + Monday-Friday)
3. Click on a template card to view details and full exercise list
4. Click "Start Workout" on detail page to create a new workout
5. Weight inputs should show default weights as placeholders (e.g., "10kg", "7-8kg")
6. Shooting drills should show makes/attempts inputs with percentage calculation
7. Toggle dark/light mode with sun/moon button (floating on mobile, in nav on desktop)
8. Click "Calendar" in navigation - Should see monthly calendar with workout days highlighted
9. Click on a workout day to view details or resume incomplete workouts
10. Navigate between months using Previous/Next buttons or jump to Today
11. On mobile, verify 7 bottom nav items: Home, Templates, Workouts, Calendar, Macros, Photos, Settings
12. Click "📸 Photos" - Upload progress photos with camera, view gallery, compare side-by-side
13. Daily Warm-up: 23 exercises including 5 shooting drills (130 makes + 20 free throws)
14. Click "⏱️ Auto Drills" in Daily Warm-up to start 14 ball handling drills timer
15. All Monday-Friday workouts end with 20 free throws under fatigue (except Thursday has 30)

**Verify Database:**
```bash
npm run db:studio
```
- Check WorkoutTemplate table has 6 records (including DAILY WARM-UP)
- Check TemplateExercise table has 81+ exercises with targetWeight values
- Check Exercise table includes targetSets, targetReps, targetWeight fields
- Check RestTimerPreset table has 5 presets

**Query Examples:**
```sql
-- Count templates
SELECT COUNT(*) FROM WorkoutTemplate;

-- List all templates with exercise counts
SELECT wt.name, COUNT(te.id) as exercise_count
FROM WorkoutTemplate wt
LEFT JOIN TemplateExercise te ON wt.id = te.templateId
GROUP BY wt.id;

-- Get Monday workout exercises
SELECT te.name, te.targetSets, te.targetReps
FROM TemplateExercise te
JOIN WorkoutTemplate wt ON te.templateId = wt.id
WHERE wt.category = 'MONDAY'
ORDER BY te.order;
```

## Known Issues

### Windows Permission Errors
- `.next/trace` file permission errors on Windows
- **Solution**: Restart dev server, delete .next folder, or run as administrator
- Not a code issue - Windows file locking problem

### Port Conflicts
- Dev server may use port 3001 if 3000 is in use
- Check `Local:` URL in terminal output

### PWA Settings Sync Issues
- Settings changed on desktop may not immediately reflect on mobile PWA
- **Root cause**: Service worker caching and localStorage not syncing between browser contexts
- **Solution**:
  1. Go to Settings page on mobile
  2. Click "🔄 Refresh Settings" button to force reload from localStorage
  3. If that doesn't work, click "🗑️ Clear Cache" to clear service worker caches and reload
- **Prevention**: Changes are saved to localStorage correctly, but PWA may serve cached JavaScript files
- The "Clear Cache" button will clear all service worker caches and force reload the latest version

## File Patterns

### Creating New API Route
```typescript
// app/api/example/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.model.findMany();
    return NextResponse.json({ data, success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch', success: false },
      { status: 500 }
    );
  }
}
```

### Creating New Page
```typescript
// app/example/page.tsx
export default function ExamplePage() {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
        Page Title
      </h1>
      {/* Content */}
    </div>
  );
}
```

### Using Prisma
```typescript
// Create workout from template with target values
const workout = await prisma.workout.create({
  data: {
    name: 'Monday Workout',
    templateId: template.id,
    exercises: {
      create: template.exercises.map((exercise) => ({
        name: exercise.name,
        order: exercise.order,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        targetWeight: exercise.targetWeight, // "10kg", "7-8kg", etc.
        sets: {
          create: Array.from({ length: exercise.targetSets }, (_, i) => ({
            setNumber: i + 1,
            completed: false,
          })),
        },
      })),
    },
  },
  include: { exercises: { include: { sets: true } } }
});

// Query with filters
const workouts = await prisma.workout.findMany({
  where: { date: { gte: new Date('2024-01-01') } },
  include: { exercises: true },
  orderBy: { date: 'desc' }
});

// Note: Shooting drill data storage
// For shooting drills, the Set model stores:
// - reps = makes (shots made)
// - weight = attempts (total shots)
// Percentage calculated in UI: (makes / attempts) * 100
```

## Additional Notes

- **Single-user app** (no authentication required)
- **All data stored locally** in SQLite
- **Workout templates** sourced from `workout-routine.md`:
  - 6 templates total: Daily Warm-up + Monday-Friday workouts
  - Includes gym exercises AND basketball training (ball handling, shooting, conditioning)
  - Default weights extracted from markdown and stored in database
- **Rest timer** requires browser notification permission (requested on first load)
- **Dark mode**:
  - Toggle button (floating on mobile, in nav on desktop)
  - Black & white theme with zinc palette
  - Preference saved in localStorage
- **Mobile-first design**:
  - Bottom navigation bar on mobile for easy thumb access (7 items)
  - Mobile nav includes: Home, Templates, Workouts, Calendar, Macros, Photos, Settings
  - All touch targets 44px+ for comfortable tapping
  - Optimized primarily for phone use in the gym
  - Responsive breakpoints: `md:` 768px, `lg:` 1024px
- **Shooting drill tracking**:
  - Makes/attempts format with automatic percentage calculation
  - Data stored in Set model (makes → reps, attempts → weight)
  - Daily Warm-up includes 130 target makes + 20 free throws
  - All main workouts end with 20 free throws under fatigue
- **Calendar view**:
  - Monthly calendar showing workout history
  - Visual indicators for completed and in-progress workouts
  - Click on days to view/resume workouts
  - Summary stats for the month
- **Progress photos**:
  - Base64 storage for simplicity (no external file storage needed)
  - Mobile camera capture support
  - Compare up to 4 photos side-by-side
  - Track weight and notes per photo
- **PWA considerations**:
  - Service worker may cache old JavaScript files
  - Settings store uses localStorage with hydration checks
  - "Clear Cache" functionality available in Settings to force reload
  - Auto-drill timer uses timestamps to continue running when app is closed
- **Workout structure**:
  - Daily Warm-up: 23 exercises (ball handling + shooting comprehensive)
  - Monday: 13 exercises (pure strength/power, 80 min)
  - Tuesday: 11 exercises (back/biceps + conditioning)
  - Wednesday: 11 exercises (legs/abs + vertical jump)
  - Thursday: 7 exercises (basketball game simulation, 45 min)
  - Friday: 11 exercises (arms specialization)

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
