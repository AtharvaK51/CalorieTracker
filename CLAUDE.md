# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npx expo start                # Start dev server (scan QR with Expo Go)
npx expo run:android          # Native build + install via ADB (requires Android SDK)
npx tsc --noEmit              # Type check (no tests or linter configured yet)
```

### Android native build requirements

The device owner runs Arch Linux. Native builds need:
- **JDK 17** (`/usr/lib/jvm/java-17-openjdk`) — system default is JDK 26 which Gradle doesn't support
- **Android SDK** at `~/Android/Sdk`
- Gradle is configured to use JDK 17 via `android/gradle.properties` (`org.gradle.java.home`)
- Environment variables needed: `ANDROID_HOME`, `JAVA_HOME` (set in `.zshrc`)

If building fails with "Unsupported class file major version", check that `JAVA_HOME` points to JDK 17, not the system default.

### APK builds

```bash
npx expo prebuild --platform android        # Generate android/ directory
cd android && ./gradlew assembleDebug       # Debug APK
cd android && ./gradlew assembleRelease     # Release APK (needs signing key)
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

## Architecture

Local-first, single-user calorie tracking app. React Native (Expo SDK 55) + SQLite + AI-powered meal analysis. No backend — all data on-device. UI components from **Gluestack UI** (headless/unstyled).

### Layered data flow

```
Screens (app/) → Zustand Stores (store/) → DB Layer (db/) → SQLite
                                         → Services (services/) → External AI APIs
```

- **Screens** never call `db/` directly for writes — always go through stores
- **Stores** orchestrate DB operations + service calls, then update UI state. Each store owns one domain: meals, water, profile, streaks. Screens reload data via `useFocusEffect` (not on mount) so navigating back to a tab always shows fresh data
- **`db/`** is the only layer that touches SQLite — designed so only this layer changes when migrating to PostgreSQL in Phase 2
- **`services/`** handles external concerns: AI analysis (`ai.ts` orchestrator), CSV export (`csvExport.ts`), TDEE goal calculation (`goalCalculator.ts`)

### AI two-tier system

1. **Tier 1** (`aiApi.ts`): Direct API call to Gemini or OpenAI using stored API key
2. **Tier 2** (`aiPrompt.ts`): Generates a prompt the user copies into any AI tool, then pastes the JSON result back

The prompt template lives in `constants/config.ts` (`aiPromptTemplate`). Response parsing handles markdown code blocks and validates the `{ items, total }` JSON structure.

### Database design decisions

- **UUID primary keys** everywhere (not auto-increment) — portable to PostgreSQL
- **`sync_status` column** on meals and water tables — unused now, pre-wired for Phase 2 sync
- **ISO 8601 timestamps** on all records
- `db/database.ts` uses singleton pattern with lazy init; schema created via `execAsync` on first access
- `db/profile.ts` auto-creates a default profile row if none exists

### Routing

Expo Router with file-based routing. `app/_layout.tsx` checks `profile.onboarding_done` to decide between onboarding flow and main tabs.

- `app/(tabs)/` — 5 tabs: Home (`index`), Add (`add`), History (`history`), Stats (`stats`), Settings (`settings`)
- `app/onboarding/` — Multi-step wizard (single screen with internal step state)
- `app/meal/[id].tsx` — Modal screen for viewing/editing a meal

### Dark theme

All colors centralized in `constants/colors.ts`. Dark background (#0F0F0F), green primary (#4ADE80), macro colors: protein=red, carbs=amber, fat=blue, fiber=purple.

## Key conventions

- All dates/times stored as ISO 8601 strings, never Date objects in the DB
- `utils/date.ts` provides helpers — `today()` returns `YYYY-MM-DD`, `now()` returns full ISO string
- Meal is always saved to SQLite immediately on add, before AI analysis completes
- CSV export uses SAF (Storage Access Framework) on Android for "Save to Downloads", share sheet on iOS
- API keys stored in `expo-secure-store`, not in app state or config files
- `expo-file-system` uses the `/legacy` import path (e.g. `from 'expo-file-system/legacy'`)
- `utils/uuid.ts` generates UUIDs without `crypto.getRandomValues` (not available in React Native) — uses `Math.random` based RFC 4122 v4
- `parsed_items` on a meal is a **JSON string** (not an object) — always `JSON.parse()` before use and `JSON.stringify()` before writing
