# Database Design

## Engine

**SQLite** via `expo-sqlite` — on-device, zero-config, works offline.

## Design Principles

- **UUIDs as primary keys** — not auto-increment. Portable to PostgreSQL later.
- **ISO 8601 timestamps** on every table (`created_at`, `updated_at`).
- **`sync_status` column** included now (unused in Phase 1, ready for Phase 2).
- **JSON columns** stored as TEXT (SQLite has no native JSON type).

## Schema

### `user_profile`

| Column           | Type    | Constraints     | Description                          |
|------------------|---------|-----------------|--------------------------------------|
| `id`             | TEXT    | PRIMARY KEY     | UUID v4 (single row in Phase 1)      |
| `name`           | TEXT    |                 | User's name                          |
| `weight_kg`      | REAL    |                 | Weight in kg                         |
| `height_cm`      | REAL    |                 | Height in cm                         |
| `age`            | INTEGER |                 | Age in years                         |
| `gender`         | TEXT    |                 | male / female / other                |
| `activity_level` | TEXT    |                 | sedentary / light / moderate / active / very_active |
| `calorie_goal`   | REAL    |                 | Daily calorie target (auto or manual)|
| `protein_goal_g` | REAL    |                 | Daily protein target                 |
| `carbs_goal_g`   | REAL    |                 | Daily carbs target                   |
| `fat_goal_g`     | REAL    |                 | Daily fat target                     |
| `created_at`     | TEXT    | NOT NULL        | Record creation time                 |
| `updated_at`     | TEXT    | NOT NULL        | Last update time                     |

### `meals`

| Column        | Type    | Constraints              | Description                           |
|---------------|---------|--------------------------|---------------------------------------|
| `id`          | TEXT    | PRIMARY KEY              | UUID v4                               |
| `description` | TEXT    | NOT NULL                 | Raw user input ("Poha + chai")        |
| `parsed_items`| TEXT    |                          | JSON array of parsed food items       |
| `calories`    | REAL    |                          | Total calories (kcal)                 |
| `protein_g`   | REAL    |                          | Protein in grams                      |
| `carbs_g`     | REAL    |                          | Carbohydrates in grams                |
| `fat_g`       | REAL    |                          | Fat in grams                          |
| `fiber_g`     | REAL    |                          | Fiber in grams                        |
| `meal_type`   | TEXT    |                          | breakfast / lunch / dinner / snack    |
| `logged_at`   | TEXT    | NOT NULL                 | When the meal was eaten (ISO 8601)    |
| `created_at`  | TEXT    | NOT NULL                 | Record creation time                  |
| `updated_at`  | TEXT    | NOT NULL                 | Last update time                      |
| `sync_status` | TEXT    | DEFAULT 'local'          | local / pending / synced / failed     |

### `water_intake`

| Column        | Type    | Constraints              | Description                           |
|---------------|---------|--------------------------|---------------------------------------|
| `id`          | TEXT    | PRIMARY KEY              | UUID v4                               |
| `amount_ml`   | REAL    | NOT NULL                 | Water amount in milliliters           |
| `logged_at`   | TEXT    | NOT NULL                 | When the water was logged (ISO 8601)  |
| `created_at`  | TEXT    | NOT NULL                 | Record creation time                  |
| `sync_status` | TEXT    | DEFAULT 'local'          | local / pending / synced / failed     |

### `streaks`

| Column        | Type    | Constraints              | Description                           |
|---------------|---------|--------------------------|---------------------------------------|
| `id`          | TEXT    | PRIMARY KEY              | UUID v4                               |
| `date`        | TEXT    | NOT NULL UNIQUE          | Date (YYYY-MM-DD)                     |
| `has_logged`  | INTEGER | NOT NULL DEFAULT 0       | 1 if user logged at least one meal    |

## SQL

```sql
CREATE TABLE IF NOT EXISTS user_profile (
    id              TEXT PRIMARY KEY,
    name            TEXT,
    weight_kg       REAL,
    height_cm       REAL,
    age             INTEGER,
    gender          TEXT,
    activity_level  TEXT,
    calorie_goal    REAL,
    protein_goal_g  REAL,
    carbs_goal_g    REAL,
    fat_goal_g      REAL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meals (
    id            TEXT PRIMARY KEY,
    description   TEXT NOT NULL,
    parsed_items  TEXT,
    calories      REAL,
    protein_g     REAL,
    carbs_g       REAL,
    fat_g         REAL,
    fiber_g       REAL,
    meal_type     TEXT,
    logged_at     TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status   TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS water_intake (
    id          TEXT PRIMARY KEY,
    amount_ml   REAL NOT NULL,
    logged_at   TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    sync_status TEXT DEFAULT 'local'
);

CREATE TABLE IF NOT EXISTS streaks (
    id         TEXT PRIMARY KEY,
    date       TEXT NOT NULL UNIQUE,
    has_logged INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_meals_logged_at ON meals(logged_at);
CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_meals_sync_status ON meals(sync_status);
CREATE INDEX IF NOT EXISTS idx_water_logged_at ON water_intake(logged_at);
CREATE INDEX IF NOT EXISTS idx_streaks_date ON streaks(date);
```

## Why This Schema is Backend-Ready

When Phase 2 arrives:

1. Same schema mirrors to PostgreSQL (TEXT → UUID, REAL → DOUBLE PRECISION)
2. `sync_status` activates — `local` entries get pushed to server
3. UUIDs prevent ID conflicts between local and server records
4. Timestamps enable conflict resolution (last-write-wins)
