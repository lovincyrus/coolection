# X Bookmarks Sync Brainstorm

**Date:** 2026-02-12
**Status:** Implemented (PR #17, merged)

## What We Built

Sync X (Twitter) bookmarks into Coolection via the Chrome extension. The extension opens x.com/i/bookmarks, scrolls through the timeline extracting tweet URLs, and bulk-creates them as items.

## How It Works

### Architecture

1. **Content script** (`bookmarks-content.js`) — injected on x.com/i/bookmarks, extracts tweet URLs from the DOM
2. **Background service worker** (`background.js`) — orchestrates sync: opens tab, communicates with content script, sends URLs to server
3. **Options page** (`options.html` + `options.js`) — UI for manual sync trigger and auto-sync configuration
4. **Bulk-create endpoint** (`POST /api/item/bulk-create`) — processes batches of URLs

### Sync Flow

1. User clicks "Sync Now" or alarm fires (auto-sync)
2. Background worker finds or creates x.com/i/bookmarks tab
3. Tab is placed in a collapsed "Coolection Sync" tab group (non-disruptive)
4. Content script shows a blocking overlay ("Syncing bookmarks...")
5. Content script scrolls through the bookmarks timeline extracting tweet URLs from `<article>` elements
6. URLs are sent to `/api/item/bulk-create` in batches of 100
7. Server deduplicates and creates items (tweets get full metadata via `addTwitterPostOrBookmark`)
8. Tab is closed if it was created by the extension

### Early Stop Optimization

To avoid scrolling the entire timeline on every sync:
1. After each sync, the last 500 URLs are cached in `chrome.storage.local`
2. On subsequent syncs, cached URLs are passed to the content script as `knownUrls`
3. Content script stops scrolling after 5 consecutive known URLs (reached previously-synced territory)
4. Since bookmarks are newest-first, only new bookmarks at the top need scanning

### Display

Tweet items show a sky-blue bird (Twitter) icon instead of the default link icon.

## Key Decisions

- **DOM scraping** — no Twitter API needed, works with any user's bookmarks as long as they're logged in
- **Tab groups** — sync tab is created in a collapsed group so it doesn't disrupt the user
- **Manual vs automatic sync** — manual brings tab to foreground with overlay; automatic runs silently in collapsed group
- **Local URL cache** — avoids server round trip for early stop detection
- **Content script overlay** — prevents user from navigating away during scan

## Permissions

```json
{
  "permissions": ["activeTab", "scripting", "contextMenus", "storage", "alarms", "tabs", "tabGroups"],
  "host_permissions": ["https://www.coolection.co/*", "https://x.com/i/bookmarks*"],
  "optional_host_permissions": ["https://*/*", "http://localhost/*"]
}
```

## Auto-Sync

- Configurable interval: 30m, 1h, 2h, 6h, 12h, 24h
- Uses `chrome.alarms` API for scheduling
- Respects `syncEnabled` flag
- `_syncInProgress` flag prevents concurrent syncs

## Future Work

- Progress indicator showing number of bookmarks found during scroll
- Sync status notifications for auto-sync results
