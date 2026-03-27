# Architecture

## Overview

A single-user, local-first mobile meal tracking app with AI-powered nutritional analysis. Users log meals in natural language (e.g., "Poha + chai"), and the app uses AI to extract nutritional data. All data is stored on-device.

## Phase 1 — Current Build

```
┌──────────────────────────┐
│    React Native App       │
│    (Expo + Gluestack UI)  │
│                           │
│  ┌──────────────────────┐ │        ┌─────────────────┐
│  │  SQLite (on-device)  │ │        │  Any AI Provider │
│  │  - meals & nutrition │ │        │  (provider-      │
│  │  - water intake      │ │◄──────►│   agnostic)      │
│  │  - user profile      │ │  HTTP  │  - meal parsing  │
│  │  - analytics         │ │        │  - nutrition     │
│  └──────────────────────┘ │        └─────────────────┘
└──────────────────────────┘
```

No backend. No auth. No sync. Just the app + AI API + local storage.

## Stack

| Layer            | Technology                              |
|------------------|-----------------------------------------|
| Framework        | React Native (Expo)                     |
| UI Library       | Gluestack UI                            |
| State management | Zustand                                 |
| Local DB         | `expo-sqlite`                           |
| Charts           | `victory-native` or `react-native-chart-kit` |
| AI               | Provider-agnostic (any API via prompt)  |
| Language         | TypeScript                              |

### Why Gluestack UI

- Headless/unstyled — full design freedom for the custom dark theme
- Solid base primitives (buttons, inputs, modals, bottom sheets)
- Good Expo support
- Doesn't impose Material/iOS aesthetic — lets us match the reference designs

## Data Flow

### Adding a Meal

```
User types "Poha + chai"
       │
       ▼
┌───────────────────────────────┐
│ 1. Save raw entry to SQLite   │  ← instant, partial record
│ 2. Call AI API directly       │  ← parse meal → nutrition data
│ 3. Update SQLite with         │
│    nutrition breakdown        │  ← complete record
└───────────────────────────────┘
```

### Loading Dashboard

```
1. Query SQLite directly   ← all data is local
2. Render charts/stats     ← no network needed
```

### AI Failure Handling

- If the AI API call fails, the app falls back to a copy-paste prompt workflow (see below)
- Meal is always saved immediately — nutrition fields populated later
- App never blocks on network — meal entry is always instant

## Calorie Estimation — Hybrid AI Strategy

The app is **provider-agnostic** — it uses a well-crafted prompt, not a specific API. Any AI provider that accepts text and returns JSON works.

### Tier 1: Automatic API Analysis (Primary)

When a valid API key is configured:

```
User input: "2 idlis with sambar and chutney"
       │
       ▼
  AI API call (any provider)
       │
       ▼
  Structured JSON response:
  { calories, protein_g, carbs_g, fat_g }
       │
       ▼
  SQLite updated automatically
```

Seamless, zero-friction experience.

### Tier 2: Copy-Paste Prompt Fallback

When no API key is set, or the API call fails:

```
User input: "2 idlis with sambar and chutney"
       │
       ▼
  App generates a ready-made prompt:
  "Analyze this meal: 2 idlis with sambar and chutney.
   Return calories, protein, carbs, and fats in JSON format."
       │
       ▼
  User copies prompt → pastes into any AI tool
       │
       ▼
  User pastes JSON result back into the app
       │
       ▼
  SQLite updated
```

### Why This Matters

- **Zero hard dependency** on any single AI provider
- Works in offline or restricted environments (fallback is manual)
- User can choose their preferred AI tool
- Extensible for future integrations (local models, food databases)

## Features — Phase 1

### Core
- Meal logging (natural language input)
- AI-powered nutritional analysis (provider-agnostic)
- Meal editing and deletion (swipe to delete)
- Water intake tracking (quick-add: +250ml, +500ml on home screen)
- Daily calorie/macro goal with circular progress ring
- Streak counter (consecutive days logged)

### Onboarding
- Multi-step wizard (skippable): name → weight/height → activity level → auto-calculated goal
- Goals editable later in Settings

### Screens
- **Home** — daily dashboard: calorie ring, macro breakdown, water tracker, recent meals
- **Add Meal** — text input, AI analysis result, edit before saving
- **History** — scrollable meal list with filters (date range, meal type)
- **Stats/Analytics** — charts with period tabs: 90 Days / 6 Months / 1 Year / All time
- **Settings** — daily goal config, API key input, theme toggle, export CSV, about/version

### Data Export
- Export all meal data as CSV from Settings

## Future Enhancements

- Push notification reminders ("Don't forget to log lunch")
- Automatic validation of AI-returned nutritional data
- Confidence scoring for AI-generated results
- Curated database of Indian foods for improved accuracy
