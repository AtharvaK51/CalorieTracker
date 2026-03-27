import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('calorietracker.db');
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

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
      water_goal_ml   REAL DEFAULT 2500,
      onboarding_done INTEGER DEFAULT 0,
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
  `);
}
