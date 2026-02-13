# GitHub Stars Sync Brainstorm

**Date:** 2026-02-12
**Status:** Implemented (PR #18, merged)

## What We Built

Sync GitHub starred repositories into Coolection as items. Users enter their GitHub username in Settings and click "Sync Stars" to import all public starred repos.

## How It Works

1. **Settings UI** (`app/settings/page.tsx`) — GitHub username input + Sync button with status display
2. **Sync endpoint** (`POST /api/github-stars/sync`) — validates username, triggers sync
3. **Status endpoint** (`GET /api/github-stars/status`) — returns sync configuration state
4. **Core sync logic** (`lib/github-stars.ts`) — paginated GitHub API fetch with ETag caching

### Sync Flow

1. User enters GitHub username and clicks "Sync Stars"
2. POST to `/api/github-stars/sync` with `{ githubUsername }`
3. Check `GitHubStarsSync` table for existing ETag
4. Fetch page 1 of starred repos with `If-None-Match` header (conditional request)
5. If 304 Not Modified, return "already up to date" (1 API call)
6. Otherwise, paginate up to 50 pages of 100 stars each (caps at 5,000)
7. Deduplicate against existing items by URL
8. Batch insert new stars via `prisma.item.createMany()`
9. Save ETag and `lastSyncedAt` to `GitHubStarsSync`

### Item Data

Each starred repo is saved as an Item with:
- `type`: `github_star`
- `title`: `owner/repo` (full_name)
- `description`: repo description
- `image`: owner avatar URL
- `url`: repo HTML URL
- `metadata`: `{ language, stars, topics, starred_at }`
- `createdAt`: original starred_at timestamp

### Display

GitHub star items show an amber star icon instead of the default link icon, plus the programming language badge.

## Key Decisions

- **ETag caching** — subsequent syncs with no changes cost 1 API call
- **`GITHUB_TOKEN` optional** — without it, 60 req/hr; with it, 5,000 req/hr
- **`skipDuplicates: true`** — safe to retry syncs without creating duplicates
- **Public stars only** — no OAuth needed, just a username
- **Newest-first sort** — `sort=created&direction=desc` so most recent stars sync first

## Schema

```prisma
model GitHubStarsSync {
  id             String    @id @default(uuid())
  userId         String    @unique
  githubUsername  String
  etag           String?
  lastSyncedAt   DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("github_stars_sync")
}
```

## Future Work

- Background sync with `waitUntil` + Vercel Cron (see issue #21)
- Chunked pagination for very large star counts on hobby tier
