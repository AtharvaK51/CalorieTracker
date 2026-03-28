# CalorieTracker

A local-first calorie tracking app built with React Native (Expo) and SQLite. Log meals in natural language, get AI-powered nutritional breakdowns, and track your daily intake — all on-device, no backend required.

## Features

- **Natural language meal logging** — type "Poha + chai" and get a full nutritional breakdown
- **AI-powered analysis** — works with Gemini or OpenAI APIs; falls back to a copy-paste prompt workflow if no API key is set
- **Water tracking** — quick-add buttons (+250ml, +500ml) on the home screen
- **Daily goals** — circular calorie ring + macro breakdown (protein, carbs, fat)
- **Streak tracking** — consecutive days logged
- **History & analytics** — filterable meal history, charts with period tabs (90d / 6mo / 1yr / all time)
- **CSV export** — export all meal data from Settings
- **Dark theme** — designed for OLED screens
- **Fully offline** — all data stored on-device via SQLite

## Tech Stack

| Layer            | Technology                     |
|------------------|--------------------------------|
| Framework        | React Native (Expo SDK 55)     |
| UI               | Gluestack UI                   |
| State            | Zustand                        |
| Database         | expo-sqlite                    |
| Charts           | react-native-chart-kit         |
| Routing          | Expo Router (file-based)       |
| Language         | TypeScript                     |

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) app on your phone (for quick testing)
- Android SDK + JDK 17 (for native APK builds)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/AtharvaK51/CalorieTracker.git
cd CalorieTracker

# Install dependencies
npm install

# Start the dev server (scan QR with Expo Go)
npx expo start
```

### Build APK

```bash
# Generate native android project
npx expo prebuild --platform android

# Debug APK
cd android && ./gradlew assembleDebug

# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

> **Note:** Gradle requires JDK 17. If you get "Unsupported class file major version", set `JAVA_HOME` to your JDK 17 path.

## Project Structure

```
CalorieTracker/
├── app/                    # Screens (Expo Router)
│   ├── (tabs)/             # Tab navigation (Home, Add, History, Stats, Settings)
│   ├── onboarding/         # Multi-step onboarding wizard
│   ├── meal/[id].tsx       # Meal detail / edit screen
│   └── _layout.tsx         # Root layout
├── components/             # Reusable UI (CalorieRing, MealCard, WaterTracker, etc.)
├── db/                     # SQLite abstraction layer
├── services/               # AI orchestrator, CSV export, goal calculator
├── store/                  # Zustand stores (meals, water, profile, streaks)
├── utils/                  # Date helpers, UUID generation
└── constants/              # Colors, config defaults
```

## How AI Analysis Works

The app uses a two-tier system:

1. **Tier 1 (Automatic):** If an API key is configured (Gemini or OpenAI), the app calls the API directly and populates nutrition data automatically.
2. **Tier 2 (Fallback):** If no API key is set or the call fails, the app generates a ready-made prompt. Copy it into any AI tool, paste the JSON result back.

Configure your API key in **Settings > AI Provider**.

## License

MIT
