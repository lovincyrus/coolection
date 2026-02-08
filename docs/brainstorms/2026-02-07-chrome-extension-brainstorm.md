# Chrome Extension Brainstorm

**Date:** 2026-02-07
**Status:** Ready for planning

## What We're Building

A Chrome extension that lets users save the current website to Coolection via:
1. **Right-click context menu** — "Add to Coolection"
2. **Toolbar icon click** — saves immediately

Feedback is shown as an injected toast notification on the page (same pattern as the Safari extension).

## Why This Approach

**Minimal MV3 extension** — plain HTML/JS, no framework. Mirrors the Safari extension architecture:

- Service worker (`background.js`) handles context menu + toolbar click
- Small popup page for settings only (token input, server URL)
- Token stored in `chrome.storage.sync`
- Toast injected via `chrome.scripting.executeScript`
- Calls existing `POST /api/item/create` with Bearer token auth

This keeps it simple, fast to build, and consistent with the existing Safari extension.

## Key Decisions

- **Auth:** Paste API token from `/settings` page (same as Safari extension)
- **Save triggers:** Both context menu right-click AND toolbar icon click
- **Feedback:** Injected toast notification (no popup, no badge)
- **Self-hosted support:** Yes — configurable server URL, defaults to `www.coolection.co`
- **Architecture:** Minimal MV3, plain HTML/JS, no build step
- **Storage:** `chrome.storage.sync` for token + server URL

## Extension Structure

```
chrome-extension/
  manifest.json        # MV3 manifest
  background.js        # Service worker: context menu + action click + API calls
  popup.html           # Settings: token input + server URL
  popup.js             # Settings logic
  popup.css            # Settings styles
  icons/               # Extension icons (16, 32, 48, 128)
```

## API Integration

Reuses the existing endpoint:

```
POST /api/item/create
Authorization: Bearer coolection_<token>
Content-Type: application/json
Body: { "url": "https://current-page-url.com" }
```

Responses:
- 200: Saved successfully
- 409: Already saved (duplicate)
- 401: Invalid token
- 500: Server error

## Open Questions

- Chrome Web Store listing details (description, screenshots) — defer to launch time
- Icon design — reuse existing Coolection icon assets or create new?
- Should first toolbar click (when no token configured) open the popup for setup?
