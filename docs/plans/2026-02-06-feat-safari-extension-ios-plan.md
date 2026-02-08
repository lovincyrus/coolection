---
title: Safari Web Extension for iOS
type: feat
date: 2026-02-06
deepened: 2026-02-06
reviewed: 2026-02-06
---

# Safari Web Extension for iOS

## Overview

Add a Safari Web Extension for iOS that lets users save the current tab to coolection with a single tap on a toolbar button. The extension authenticates via a personal API token and calls the existing `POST /api/item/create` endpoint.

Two workstreams: **backend** (API token system + settings UI) and **iOS** (Xcode project with container app + Safari Web Extension).

> **Note:** Safari App Extensions (native Swift) are macOS-only. iOS requires a Safari Web Extension (JS/HTML/CSS wrapped in a native container app). The container app is still SwiftUI.

## Problem Statement

Users currently need to open coolection in their browser, press `c`, and paste a URL to save a link. There's no way to save a page directly from Safari on iOS while browsing.

## Proposed Solution

### Architecture

```
┌─────────────────────────────────────────────┐
│  coolection.co (Next.js)                    │
│                                             │
│  ┌──────────────┐  ┌────────────────────┐   │
│  │ /settings    │  │ /api/item/create   │   │
│  │ Token mgmt   │  │ Bearer + Clerk auth│   │
│  └──────────────┘  └────────────────────┘   │
│                           ▲                 │
└───────────────────────────┼─────────────────┘
                            │ POST (Bearer token)
┌───────────────────────────┼─────────────────┐
│  iOS App                  │                 │
│                           │                 │
│  ┌──────────────┐  ┌──────┴──────────────┐  │
│  │ Container App│  │ Safari Web Extension│  │
│  │ (SwiftUI)    │  │ (JS background.js)  │  │
│  │ - Token entry│  │ - Toolbar button    │  │
│  └──────┬───────┘  └──────┬──────────────┘  │
│         │    Keychain /    │                 │
│         └── App Group ─────┘                 │
└─────────────────────────────────────────────┘
```

### Token Flow

1. User generates token in coolection web settings → shown once, copy to clipboard
2. User opens iOS container app → pastes token → stored in shared Keychain (App Group)
3. User enables extension in iOS Settings → Safari → Extensions
4. User taps toolbar icon in Safari → background.js gets token via native messaging → POSTs URL with `Authorization: Bearer coolection_<token>` → shows badge confirmation

## Technical Approach

### Decision: Custom Tokens (not Clerk API Keys)

Clerk v5+ has built-in API key support via `auth({ acceptsToken })`, but it requires a paid plan and ties token management to their platform. Custom tokens are simpler, free, and give full control.

### Phase 1: Backend — API Token System

**Database schema** — `prisma/schema.prisma`

```prisma
model ApiToken {
  id        String   @id @default(uuid())
  userId    String   @unique
  tokenHash String   @unique
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("api_token")
}

model User {
  // ... existing fields ...
  apiToken ApiToken?
}
```

Design notes:
- **3 data fields** — id, userId, tokenHash. That's it.
- `@unique` on `userId` — enforces one token per user, enables `upsert` for regeneration
- No `revokedAt` — regenerating a token just overwrites the hash. No soft delete needed.
- No `tokenSalt` — tokens are 256-bit random; salt only helps low-entropy passwords
- No `name`, `prefix`, `lastUsed` — YAGNI for single token per user
- `onDelete: Cascade` — token deleted when user deleted

**New file** — `app/api/token/generate/route.ts`

```typescript
// POST /api/token/generate
// - Requires Clerk session (web only)
// - Generates token: "coolection_" + crypto.randomBytes(32).toString('base64url')
// - Hashes with SHA-256: crypto.createHash('sha256').update(token).digest('hex')
// - Upserts into ApiToken (regenerate replaces old hash)
// - Returns plaintext token once: { token: "coolection_..." }
```

No separate revoke or status routes:
- **Revoke** = regenerate (upsert replaces old hash)
- **Status** = settings page calls generate endpoint or checks existence client-side

**Modified file** — `app/api/item/create/route.ts`

Inline Bearer token check directly in this route (~10 lines). No shared utility file until a second route needs it:

```typescript
// app/api/item/create/route.ts
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  // Check Bearer token first
  let userId: string | null = null;
  const authorization = headers().get("authorization");

  if (authorization?.startsWith("Bearer coolection_")) {
    const token = authorization.substring(7);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      select: { userId: true },
    });
    userId = apiToken?.userId ?? null;
  } else {
    const clerkAuth = auth();
    userId = clerkAuth.userId;
  }

  if (!userId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ... existing item creation logic unchanged ...
}
```

Key points:
- **No `lib/get-user-id.ts`** — inline until a second route needs Bearer auth. Premature abstraction otherwise.
- **No regex validation** — `findUnique` returns null for any invalid token. The DB is the validator.
- **No `x-api-user-id` header** — custom headers set in middleware can be spoofed by any client. Token validation must happen per-route.
- **No middleware changes for auth** — Clerk middleware stays as-is. Bearer check is route-level only.
- **Only this route gets Bearer auth** — don't migrate all routes. That's scope creep. Add to other routes later when needed.

### Phase 2: Backend — Settings Page

**New file** — `app/settings/page.tsx`

Client component that manages token generation:
- "Generate API Token" button → calls `POST /api/token/generate`
- Shows token ONCE in a copy-able box: "Save this — you won't see it again"
- "Regenerate Token" button with confirmation (replaces old token)
- Single line: "Install the Coolection iOS app and paste this token"

No `app/settings/layout.tsx` — single page, use root layout.

**Modified file** — `app/components/header.tsx`

Add settings icon/link next to the logout button, routing to `/settings`.

**Modified file** — `middleware.ts`

Add `/settings(.*)` to protected routes. No other middleware changes.

### Phase 3: iOS — Xcode Project

**Project location:** `/ios` directory in the same repo (not a separate repo).

```
ios/
├── CoolectionSafari/                    # Container app (SwiftUI)
│   ├── CoolectionSafariApp.swift        # App entry point
│   ├── ContentView.swift                # Token entry screen
│   ├── KeychainHelper.swift             # Keychain read/write via App Group
│   └── Assets.xcassets/                 # App icon
├── CoolectionExtension/                 # Safari Web Extension target
│   ├── SafariWebExtensionHandler.swift  # Native message handler
│   ├── Resources/
│   │   ├── manifest.json                # Extension manifest
│   │   ├── background.js                # Service worker — toolbar click handler
│   │   └── images/                      # Toolbar icons (48, 96, 128, 144)
│   └── Info.plist
└── CoolectionSafari.xcodeproj
```

**Container app** (`ContentView.swift`) — 4 UI elements:
1. Coolection logo
2. Text field with placeholder: "Paste API token from coolection.co/settings"
3. "Save" button → validates prefix (`coolection_`) → stores in shared Keychain
4. Single line: "After saving, enable extension in Settings → Safari → Extensions"

**Extension manifest** (`manifest.json`):

```json
{
  "manifest_version": 3,
  "name": "Coolection",
  "version": "1.0",
  "description": "Save the current page to Coolection",
  "permissions": ["tabs", "nativeMessaging"],
  "action": {
    "default_icon": {
      "48": "images/icon-48.png",
      "96": "images/icon-96.png",
      "128": "images/icon-128.png",
      "144": "images/icon-144.png"
    },
    "default_title": "Save to Coolection"
  },
  "background": {
    "service_worker": "background.js",
    "persistent": false
  }
}
```

Icon notes: Safari prefers grayscale toolbar icons. Keep them simple — they render at very small sizes.

**Background script** (`background.js`):

```javascript
browser.action.onClicked.addListener(async (tab) => {
  const url = tab.url;
  if (!url || !/^https?:\/\//.test(url)) return;

  const response = await browser.runtime.sendNativeMessage(
    "application.id",
    { action: "getToken" }
  );
  if (!response.token) return;

  try {
    const result = await fetch("https://coolection.co/api/item/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${response.token}`,
      },
      body: JSON.stringify({ url }),
    });

    if (result.ok || result.status === 409) {
      browser.action.setBadgeText({ text: "✓" });
      setTimeout(() => browser.action.setBadgeText({ text: "" }), 2000);
    }
  } catch {
    // Silent failure — no badge for errors
  }
});
```

Badge behavior:
- **Success (200) or duplicate (409):** "✓" for 2 seconds, then clear
- **Everything else:** silent. No "!" or "✗" badges — they confuse more than help when there's no way to show details.

**Critical iOS constraints:**

1. **Service worker death (iOS 17.4+):** Background scripts are killed after 30-45s. All logic must complete in a single event callback. Do NOT store state in memory — fetch token from Keychain on every tap.

2. **Do NOT use `browser.storage.local`:** Safari 18 can erase it during iOS updates. Token lives in Keychain via App Group only.

3. **Only background.js can use native messaging:** Content scripts cannot call `browser.runtime.sendNativeMessage()`.

**Native bridge** (`SafariWebExtensionHandler.swift`):
- Receives messages from background.js via `NSExtensionRequestHandling`
- Reads API token from shared Keychain (App Group)
- Returns `{ token: "coolection_..." }` or `{ error: "no_token" }`

**Shared Keychain** — App Group:

```swift
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: "com.coolection.api-token",
    kSecAttrAccount as String: "api_token",
    kSecAttrAccessGroup as String: "group.coolection.app",
    kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
    kSecValueData as String: tokenData,
]
```

Entitlements: `com.apple.security.application-groups` → `group.coolection.app` on **both** targets. Must enable on developer.apple.com AND in Xcode capabilities.

### Phase 4: Testing

- Test on **real iOS device** — simulator doesn't fully reproduce service worker behavior
- Test service worker death: wait 60s between taps, verify it still works
- Test error states (401, 409, 500, offline)
- Test token regeneration flow end-to-end
- Test extension enable/disable lifecycle in iOS Settings
- Test CORS early — Safari extensions use `safari-web-extension://` origin; may need CORS headers on API
- Filter invalid URLs client-side: reject `about:`, `file:`, `javascript:`, `data:` schemes
- Build with **Xcode 16+ using iOS 18 SDK**

Debugging: Cannot inspect service workers in Safari DevTools on iOS. Use native messaging to log from background.js → Swift → Xcode console during development.

## Acceptance Criteria

- [x] User can generate an API token from `/settings`
- [x] Token shown only once with copy button
- [x] Regenerating replaces the old token
- [x] `POST /api/item/create` accepts `Authorization: Bearer coolection_<token>`
- [x] Existing Clerk session auth continues working unchanged
- [x] iOS container app stores token in Keychain
- [x] Safari toolbar button saves current tab URL to coolection
- [x] "✓" badge on success/duplicate, clears after 2s
- [x] Invalid URLs (about:, file://) rejected client-side
- [x] Token hashed with SHA-256, never stored in plaintext
- [x] Extension only requests `tabs` and `nativeMessaging` permissions
- [x] Background script is non-persistent and fully stateless
- [ ] Works on iOS 17+ (needs real device testing)

## Implementation Order

1. **Prisma schema** — Add ApiToken model, run migration
2. **Token endpoint** — `POST /api/token/generate`
3. **Inline Bearer auth** — Add ~10 lines to `app/api/item/create/route.ts`
4. **Settings page** — Client component at `/settings`
5. **Header link** — Add settings link to header
6. **Xcode project** — Container app + extension target + App Group entitlements in `/ios`
7. **Container app** — Token entry, Keychain storage
8. **Extension** — manifest.json, background.js, native bridge, toolbar icons
9. **End-to-end testing** — Full flow on real device

## Files Changed Summary

### New Files (4)
- `app/api/token/generate/route.ts` — Token generation endpoint
- `app/settings/page.tsx` — Settings page (client component)
- `prisma/migrations/[timestamp]_add_api_token/` — Migration
- `ios/` — Xcode project directory (container app + extension)

### Modified Files (3)
- `prisma/schema.prisma` — Add ApiToken model
- `app/api/item/create/route.ts` — Inline Bearer token check (~10 lines)
- `app/components/header.tsx` — Add settings link
- `middleware.ts` — Add `/settings` to protected routes

## References

### Internal
- `app/api/item/create/route.ts` — Existing item creation endpoint
- `middleware.ts` — Clerk auth middleware
- `prisma/schema.prisma` — Database schema
- `lib/url.ts`, `lib/check-duplicate-item.ts` — Existing patterns
- `docs/brainstorms/2026-02-06-safari-extension-brainstorm.md` — Brainstorm decisions

### External
- [Creating a Safari Web Extension — Apple Developer](https://developer.apple.com/documentation/safariservices/creating-a-safari-web-extension)
- [Meet Safari Web Extensions on iOS — WWDC21](https://developer.apple.com/videos/play/wwdc2021/10104/)
- [Messaging between app and JS in Safari Web Extension](https://developer.apple.com/documentation/safariservices/safari_web_extensions/messaging_between_the_app_and_javascript_in_a_safari_web_extension)
- [Sharing access to Keychain items among apps](https://developer.apple.com/documentation/security/keychain_services/keychain_items/sharing_access_to_keychain_items_among_a_collection_of_apps/)
- [iOS service worker death bug — Apple Forums](https://developer.apple.com/forums/thread/758346)
- [Safari 18 storage data loss warning](https://underpassapp.com/news/2024/9/6.html)
