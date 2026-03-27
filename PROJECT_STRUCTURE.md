# Project Structure

```
CalorieTracker/
├── app/                         # Screens (Expo Router)
│   ├── (tabs)/                  # Tab navigation
│   │   ├── index.tsx            # Home — dashboard (calorie ring, macros, water, recent meals)
│   │   ├── add.tsx              # Add meal screen
│   │   ├── history.tsx          # Meal history (filterable by date, meal type)
│   │   ├── stats.tsx            # Analytics — charts (90d / 6mo / 1yr / all time)
│   │   └── settings.tsx         # Settings — goals, API key, export, theme, about
│   ├── onboarding/              # Onboarding wizard (skippable)
│   │   ├── index.tsx            # Welcome / name
│   │   ├── body.tsx             # Weight, height, age, gender
│   │   ├── activity.tsx         # Activity level selection
│   │   └── goal.tsx             # Auto-calculated goal (editable)
│   ├── meal/                    # Meal detail / edit
│   │   └── [id].tsx             # View/edit a specific meal
│   └── _layout.tsx              # Root layout
│
├── components/                  # Reusable UI components
│   ├── MealCard.tsx             # Single meal display (swipe to delete)
│   ├── NutritionBar.tsx         # Macro breakdown bar
│   ├── CalorieRing.tsx          # Circular progress for daily calories
│   ├── MacroIndicator.tsx       # Individual macro progress (protein/carbs/fat)
│   ├── WaterTracker.tsx         # Water intake widget (+250ml, +500ml buttons)
│   ├── StreakBadge.tsx           # Fire streak counter
│   └── ChartCard.tsx            # Wrapper for chart components
│
├── db/                          # SQLite layer
│   ├── database.ts              # DB initialization & migrations
│   ├── meals.ts                 # Meal CRUD operations
│   ├── water.ts                 # Water intake CRUD
│   ├── profile.ts               # User profile CRUD
│   ├── streaks.ts               # Streak tracking logic
│   └── queries.ts               # Analytics queries (daily totals, trends, etc.)
│
├── services/                    # External services
│   ├── ai.ts                    # AI orchestrator (tries API → fallback prompt)
│   ├── aiApi.ts                 # Tier 1: Direct API client (provider-agnostic)
│   ├── aiPrompt.ts              # Tier 2: Generates copy-paste prompts + parses results
│   ├── goalCalculator.ts        # TDEE / calorie goal auto-calculation
│   └── csvExport.ts             # Export meals to CSV
│
├── store/                       # Zustand stores
│   ├── useMealStore.ts          # Meal state management
│   ├── useWaterStore.ts         # Water intake state
│   ├── useProfileStore.ts       # User profile & goals
│   └── useStreakStore.ts        # Streak state
│
├── utils/                       # Helpers
│   ├── uuid.ts                  # UUID generation
│   └── date.ts                  # Date formatting utilities
│
├── constants/                   # App constants
│   ├── colors.ts                # Dark theme color palette
│   └── config.ts                # Defaults (water step sizes, etc.)
│
├── assets/                      # Images, fonts
├── app.json                     # Expo config
├── package.json
├── tsconfig.json
│
├── references/                  # Design reference images
├── ARCHITECTURE.md
├── DATABASE.md
├── PROJECT_STRUCTURE.md
└── SCALABILITY.md
```

## Key Decisions

- **Expo Router** for file-based routing (tabs + onboarding flow + dynamic meal routes)
- **Gluestack UI** for unstyled base primitives — full design freedom for dark theme
- **`db/` layer** abstracts all SQLite operations — when Phase 2 adds sync, only this layer changes
- **`services/ai.ts`** orchestrates the hybrid AI strategy — provider-agnostic prompt, not tied to any API
- **`services/goalCalculator.ts`** handles TDEE calculation from onboarding data
- **`services/csvExport.ts`** exports meal data for the user
- **Fallback prompt flow** keeps the app functional even without an API key
- **No `backend/` directory** in Phase 1 — added only when needed
