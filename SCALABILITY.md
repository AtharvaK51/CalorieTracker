# Scalability & Migration Plan

## Current State — Phase 1 (Local-First)

The app is a **single-user, local-first mobile app**.

- All data stored on-device via SQLite
- AI calls go directly to external APIs (provider-agnostic)
- No backend, no auth, no sync

### Why Start Here

- Faster development and iteration
- Offline-first functionality out of the box
- No infrastructure cost or operational overhead
- Full focus on UX and core features

---

## Phase 2 — Full-Stack Migration

When the app needs multi-user support, a backend gets introduced.

### What Gets Added

| Component        | Purpose                                     |
|------------------|---------------------------------------------|
| FastAPI backend  | Auth, sync, analytics aggregation, AI proxy |
| PostgreSQL       | Cloud storage, multi-device source of truth |
| JWT auth         | User accounts, secure API access            |
| Sync layer       | SQLite <-> PostgreSQL bidirectional sync    |

### Architecture (Phase 2)

```
┌─────────────────────┐
│   React Native App   │
│   (Expo)             │
│  ┌─────────────────┐ │         ┌──────────────────┐
│  │  SQLite (local)  │◄─────────┤  FastAPI Backend  │
│  │  - cached meals  │ sync     │  - auth (JWT)     │
│  │  - offline queue │─────────►│  - AI proxy       │
│  └─────────────────┘ │         │  - sync logic     │
└─────────────────────┘         └────────┬─────────┘
                                         │
                                ┌────────┴─────────┐
                                │   PostgreSQL      │
                                │   - permanent     │
                                │   - analytics     │
                                │   - multi-device  │
                                └──────────────────┘
```

---

## Migration Strategy

### Step 1: Backend Setup

- FastAPI server with PostgreSQL
- Mirror the SQLite schema (same tables, same columns)
- UUIDs as primary keys make this seamless — no ID remapping

### Step 2: Auth Layer

- JWT access token (short-lived) + refresh token (long-lived)
- Tokens stored in `expo-secure-store`
- Add login/signup screens to the app

### Step 3: Sync Layer

- Activate `sync_status` column (already present in schema)
- On connectivity: push `local`/`pending` records to backend
- Pull new/updated records from server
- Conflict resolution: server timestamp wins (last-write-wins)

### Step 4: AI Proxy

- Move AI API calls from app → backend
- Backend becomes the single point for AI integration
- Benefits: API key security, rate limiting, response caching

### Step 5: Advanced Analytics

- Shift aggregation queries to backend (PostgreSQL is faster for analytics)
- App fetches pre-computed stats from API
- Local SQLite still used for instant UI, synced in background

---

## Future Features (Post Phase 1)

- Push notification reminders ("Don't forget to log lunch")
- AI validation & confidence scoring
- Curated Indian food database
- Social / shared features
- Weight tracking with progress charts

---

## Why This Migration Works

| Decision Made in Phase 1         | How It Helps Phase 2                    |
|----------------------------------|-----------------------------------------|
| UUID primary keys                | No ID conflicts between local & server  |
| `sync_status` column             | Sync logic drops in without schema change|
| ISO 8601 timestamps              | Consistent time handling across systems |
| `db/` layer abstraction          | Only this layer changes for sync        |
| `services/ai.ts` abstraction     | Reroute AI calls through backend easily |
| Zustand for state                | Add sync actions without restructuring  |
| Provider-agnostic AI prompts     | Switch AI provider without code changes |

No data migration needed — existing local data syncs up on first connection.
