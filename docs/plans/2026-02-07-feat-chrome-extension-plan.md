---
title: "feat: Chrome Extension — Save to Coolection"
type: feat
date: 2026-02-07
deepened: 2026-02-07
reviewed: 2026-02-07
---

# feat: Chrome Extension — Save to Coolection

## Overview

A minimal Chrome MV3 extension that lets users save the current page to Coolection via right-click context menu ("Add to Coolection") or toolbar icon click. Plain HTML/JS, no framework, no build step. Mirrors the existing Safari extension architecture.

## Problem Statement / Motivation

Coolection currently only has a Safari Web Extension for iOS. Chrome users have no quick way to save pages — they must manually copy/paste URLs into the web app. A Chrome extension provides the same one-click save experience for the majority of desktop browser users.

## Proposed Solution

### Architecture: No Popup, Options Page for Settings

- **No `default_popup`** in the manifest — clicking the toolbar icon triggers `chrome.action.onClicked`
- `onClicked` handler saves the current page (or opens options page if no token is configured)
- Settings (token input, server URL) live in an **options page** accessible via right-click extension icon → "Options"
- This matches the Safari extension pattern: toolbar click = save, companion UI for settings

> **Constraint:** If `default_popup` is ever added, `action.onClicked` stops firing entirely. These are mutually exclusive in Chrome MV3.

### Extension File Structure

```
chrome-extension/
├── manifest.json          # MV3 manifest
├── background.js          # Service worker: context menu, action click, API calls, toast injection
├── options.html           # Settings page: token + server URL (CSS + JS inlined)
└── icons/
    ├── icon-16.png        # Favicon, context menu
    ├── icon-48.png        # Extensions management page (reuse from Safari)
    └── icon-128.png       # Chrome Web Store, install dialog (reuse from Safari)
```

3 code files + 3 icons. CSS and JS inlined in `options.html` — a two-field settings form does not need separate files.

### Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Manifest version | MV3 | Required for new Chrome Web Store submissions |
| Popup | None | Allows `action.onClicked` to fire for one-click save |
| Settings UI | `options_ui` (embedded) | Accessible via right-click → Options |
| Storage | `chrome.storage.local` for both | One API, one `get`, one `set`. No half-configured sync state across devices. |
| Context menu | Page only (`contexts: ["page"]`) | Simple, single menu item |
| Toast injection | `chrome.scripting.executeScript` | Same pattern as Safari extension. Uses `textContent` (not `innerHTML`) — safe against XSS. |
| URL filtering | `documentUrlPatterns: ["http://*/*", "https://*/*"]` | Hide context menu on restricted pages |
| Build step | None | Plain JS, consumed directly by Chrome |
| Host permissions | Narrow default + optional for self-hosted | Passes Chrome Web Store review with minimal friction |

## Technical Approach

### Phase 1: Manifest & Service Worker

#### `manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Coolection",
  "version": "1.0.0",
  "description": "Save the current page to Coolection",
  "permissions": ["activeTab", "scripting", "contextMenus", "storage"],
  "host_permissions": ["https://www.coolection.co/*"],
  "optional_host_permissions": ["https://*/*"],
  "action": {
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    },
    "default_title": "Save to Coolection"
  },
  "options_ui": {
    "page": "options.html",
    "open_in_tab": false
  },
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

**Permissions justification** (also used in Chrome Web Store developer dashboard):
- `activeTab` — reads the URL of the active tab when the user clicks the extension icon
- `scripting` — injects a small toast notification into the active tab to confirm the save
- `contextMenus` — adds "Add to Coolection" to the right-click menu
- `storage` — persists the API token and server URL configuration
- `host_permissions: ["https://www.coolection.co/*"]` — sends saved page URLs to the Coolection API
- `optional_host_permissions: ["https://*/*"]` — Coolection is self-hostable; users who run their own server grant access to their custom domain at runtime via `chrome.permissions.request()`

No `content_security_policy` needed — MV3 defaults (`script-src 'self'; object-src 'none'`) are sufficient since the extension does not use `eval()`, inline scripts in content pages, or remote code.

#### `background.js`

All event handlers MUST be registered synchronously at the top level of the service worker. Chrome registers which events your worker listens to during synchronous execution. Handlers inside `await` or async functions may not be dispatched.

```javascript
// background.js

// 1. Install/update: register context menu + open options on first install
chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "add-to-coolection",
      title: "Add to Coolection",
      contexts: ["page"],
      documentUrlPatterns: ["http://*/*", "https://*/*"],
    });
  });

  if (details.reason === "install") {
    chrome.runtime.openOptionsPage();
  }
});

// 2. Toolbar icon click — MUST be at top level
chrome.action.onClicked.addListener((tab) => {
  saveUrl(tab.id, tab.url);
});

// 3. Context menu click — MUST be at top level
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-to-coolection" && tab?.id != null) {
    saveUrl(tab.id, tab.url);
  }
});

// 4. Shared save function — handles token check, API call, and feedback
async function saveUrl(tabId, url) {
  if (!url || !/^https?:\/\//.test(url)) return;

  const { token, serverUrl } = await chrome.storage.local.get(["token", "serverUrl"]);
  if (!token) {
    chrome.runtime.openOptionsPage();
    return;
  }

  const server = (serverUrl || "https://www.coolection.co").replace(/\/+$/, "");

  showToast(tabId, "Saving...", true);

  try {
    const response = await fetch(`${server}/api/item/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });

    if (response.ok) {
      showToast(tabId, "Saved to Coolection");
    } else if (response.status === 409) {
      showToast(tabId, "Already saved");
    } else if (response.status === 401) {
      showToast(tabId, "Token invalid — update in extension options");
    } else {
      console.error("Coolection: save failed", response.status);
      showToast(tabId, `Failed to save (${response.status})`);
    }
  } catch (e) {
    showToast(tabId, "Network error — check connection");
  }
}

// 5. Toast injection (adapted from Safari extension background.js)
function showToast(tabId, message, persistent) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (msg, stay) => {
      let t = document.getElementById("coolection-toast");
      if (t) {
        clearTimeout(t._coolectionTimeout);
        t.textContent = msg;
        t.style.opacity = "1";
      } else {
        t = document.createElement("div");
        t.id = "coolection-toast";
        t.textContent = msg;
        t.style.cssText =
          "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);" +
          "background:#000;color:#fff;padding:10px 20px;border-radius:8px;" +
          "font:14px Inter,-apple-system,system-ui,sans-serif;z-index:2147483647;" +
          "opacity:0;transition:opacity .2s";
        document.body.appendChild(t);
        requestAnimationFrame(() => (t.style.opacity = "1"));
      }
      if (!stay) {
        t._coolectionTimeout = setTimeout(() => {
          t.style.opacity = "0";
          setTimeout(() => t.remove(), 200);
        }, 2000);
      }
    },
    args: [message, !!persistent],
  }).catch(() => {
    // Toast injection failed (restricted page) — silent fallback
  });
}
```

### Phase 2: Options Page (Settings)

#### `options.html` (CSS + JS inlined)

The options page follows Coolection's design language. Two fields, one button. Everything inlined in a single file.

**Fields:**

| Field | Type | Default | Storage Key | Validation |
|---|---|---|---|---|
| API Token | password input | empty | `token` | Server validates; no client-side prefix check needed |
| Server URL | url input | `https://www.coolection.co` | `serverUrl` | Must be valid URL, `https://` required (except localhost). Strip trailing slash. |

**Behavior:**
- On load: read `chrome.storage.local` and populate fields
- On save: validate URL, strip trailing slash, write to `chrome.storage.local`, show inline "Saved" confirmation
- Server URL change: if non-default URL entered, call `chrome.permissions.request()` to grant host permission for that server
- First run: auto-opened by `onInstalled` listener in background.js

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Coolection Settings</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, -apple-system, system-ui, sans-serif;
      font-size: 13px;
      color: #111827;
      background: #fff;
      padding: 20px 24px;
      min-width: 420px;
      max-width: 520px;
    }
    .header { display: flex; align-items: center; gap: 6px; margin-bottom: 20px; }
    .header span:first-child { font-size: 20px; }
    .header span:last-child { font-size: 13px; font-weight: 500; color: #1f2937; }
    .field { margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; }
    input {
      width: 100%;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      color: #111827;
      background: #fafafa;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 8px 12px;
    }
    input:focus { outline: none; border-color: #9ca3af; }
    input:focus-visible { outline: 2px solid #6b7280; outline-offset: 1px; }
    .hint { font-size: 11px; color: #6b7280; margin-top: 4px; }
    .actions { display: flex; align-items: center; gap: 12px; margin-top: 20px; }
    button[type="submit"] {
      font-family: Inter, sans-serif; font-size: 13px; font-weight: 500;
      color: #1f2937; background: #fff;
      border: 1px solid #e5e7eb; border-radius: 6px;
      padding: 6px 16px; cursor: pointer;
    }
    button[type="submit"]:hover { background: #f9fafb; }
    .status { font-size: 12px; min-height: 16px; }
    .status.success { color: #2f855a; }
    .status.error { color: #c53030; }
  </style>
</head>
<body>
  <div class="header">
    <span>🍵</span>
    <span>Coolection</span>
  </div>

  <form id="form" novalidate>
    <div class="field">
      <label for="serverUrl">Server URL</label>
      <input id="serverUrl" type="url" placeholder="https://www.coolection.co"
        autocomplete="off" spellcheck="false" aria-describedby="serverUrl-hint" />
      <div id="serverUrl-hint" class="hint">Leave default unless self-hosting.</div>
    </div>

    <div class="field">
      <label for="token">API Token</label>
      <input id="token" type="password" placeholder="coolection_..."
        autocomplete="off" spellcheck="false" aria-describedby="token-hint" />
      <div id="token-hint" class="hint">Generate at your server's /settings page.</div>
    </div>

    <div class="actions">
      <button type="submit">Save</button>
      <span id="status" class="status" role="status"></span>
    </div>
  </form>

  <script>
    const DEFAULT_SERVER = "https://www.coolection.co";

    document.addEventListener("DOMContentLoaded", async () => {
      const { token, serverUrl } = await chrome.storage.local.get(["token", "serverUrl"]);
      document.getElementById("token").value = token || "";
      document.getElementById("serverUrl").value = serverUrl || DEFAULT_SERVER;
    });

    document.getElementById("form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const token = document.getElementById("token").value.trim();
      const serverUrl = document.getElementById("serverUrl").value.trim().replace(/\/+$/, "") || DEFAULT_SERVER;

      // Validate server URL
      try {
        const parsed = new URL(serverUrl);
        if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
          showStatus("Server URL must use https:// (except localhost)", "error");
          return;
        }
      } catch {
        showStatus("Invalid URL", "error");
        return;
      }

      // Request host permission for non-default server
      if (serverUrl !== DEFAULT_SERVER) {
        const origin = new URL(serverUrl).origin + "/*";
        const granted = await chrome.permissions.request({ origins: [origin] });
        if (!granted) {
          showStatus("Permission denied — cannot reach this server", "error");
          return;
        }
      }

      await chrome.storage.local.set({ token, serverUrl });
      showStatus("Settings saved", "success");
    });

    function showStatus(message, type) {
      const el = document.getElementById("status");
      el.textContent = message;
      el.className = `status ${type}`;
      if (type === "success") {
        setTimeout(() => { el.textContent = ""; el.className = "status"; }, 3000);
      }
    }
  </script>
</body>
</html>
```

### Phase 3: Icons

Chrome needs icons at 16, 48, and 128 pixels.

- **48px and 128px:** Reuse directly from Safari extension (`ios/CoolectionSafari/CoolectionSafari Extension/Resources/images/`)
- **16px:** Generate by downscaling the 48px icon (`sips -z 16 16 icon-48.png --out icon-16.png`)

## Acceptance Criteria

### Functional Requirements

- [ ] Right-click on any HTTP/HTTPS page shows "Add to Coolection" in context menu
- [ ] Clicking "Add to Coolection" saves the current page URL via `POST /api/item/create`
- [ ] Clicking the toolbar icon saves the current page URL (same API call)
- [ ] If no token is configured, both triggers open the options page instead of saving
- [ ] Toast notification appears on the page: "Saved to Coolection" (200), "Already saved" (409), "Token invalid" (401), "Network error" (catch)
- [ ] "Saving..." toast appears immediately and is replaced by the result
- [ ] Options page allows entering/updating API token and server URL
- [ ] Server URL defaults to `https://www.coolection.co`
- [ ] Server URL trailing slash is stripped before storage
- [ ] Non-default server URL triggers `chrome.permissions.request` for that origin
- [ ] Context menu does not appear on `chrome://`, `about:`, or other restricted pages
- [ ] Non-HTTP URLs are silently ignored (no API call, no error)
- [ ] Options page auto-opens on first install

### Non-Functional Requirements

- [ ] No build step — plain HTML/JS, loadable via "Load unpacked" in Chrome
- [ ] Token persists across browser restarts via `chrome.storage.local`
- [ ] Service worker is stateless — no in-memory caching of token/settings
- [ ] All event handlers registered synchronously at service worker top level
- [ ] Options page accessible via keyboard (Tab, Enter, Space)

## Web App Change

Update the settings page description to be browser-generic:

**File:** `app/settings/page.tsx`

Two Safari-specific strings need updating:
1. "Generate a token to use with the Coolection Safari extension for iOS" → "Generate a token to use with the Coolection browser extension"
2. "Install the Coolection iOS app and paste this token to start saving links from Safari" → "Paste this token into your browser extension to start saving links"

## Dependencies & Risks

**Dependencies:**
- Existing `POST /api/item/create` endpoint (already built and working)
- Existing token auth flow via `resolveUserId()` (already built)
- Icon assets from Safari extension (already exist at 48px and 128px)

**Risks:**

| Risk | Severity | Mitigation |
|---|---|---|
| Chrome Web Store review delay | Low | Narrow `host_permissions` + `optional_host_permissions`. Clear justifications. |
| Toast injection fails on restricted pages | Low | `.catch()` handles silently. Save still succeeds server-side. |
| 401 response is plain text, not JSON | Low | Check `response.status` before parsing body. |
| Token stored without OS-level encryption | Medium | `chrome.storage.local` — inherent Chrome limitation vs. iOS Keychain. |

## References

### Internal

- Safari extension background.js: `ios/CoolectionSafari/CoolectionSafari Extension/Resources/background.js`
- Safari extension manifest: `ios/CoolectionSafari/CoolectionSafari Extension/Resources/manifest.json`
- API create endpoint: `app/api/item/create/route.ts`
- Token auth resolver: `lib/resolve-user-id.ts`
- Token generation: `app/api/token/generate/route.ts`
- Settings page (design reference): `app/settings/page.tsx`
- Icon assets: `ios/CoolectionSafari/CoolectionSafari Extension/Resources/images/`

### External

- [Chrome MV3 Service Worker Lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
- [chrome.storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [chrome.scripting API](https://developer.chrome.com/docs/extensions/reference/api/scripting)
- [chrome.contextMenus API](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
- [Chrome Declare Permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Chrome Web Store Review Process](https://developer.chrome.com/docs/webstore/review-process)

### Brainstorm

- `docs/brainstorms/2026-02-07-chrome-extension-brainstorm.md`
