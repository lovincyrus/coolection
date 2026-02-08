---
title: Chrome MV3 Extension Race Conditions in Service Worker and Options Page
category: logic-errors
tags: [race-condition, chrome-extension, mv3, service-worker, timeout-management, concurrent-requests, event-driven-architecture]
module: chrome-extension
symptom: "Double-clicking toolbar icon causes duplicate API requests and interleaved toasts; fetch hangs forever with stuck Saving... toast; new toast removed by stale fade-out timer; options form saves empty values before storage loads; success auto-clear erases subsequent error message"
root_cause: "Missing concurrency guards, no fetch timeout, untracked nested timeouts, unsynchronized form submission with async storage load, uncleared status timeout across invocations"
date_solved: "2026-02-07"
severity: P1
---

# Chrome MV3 Extension Race Conditions

## Problem

After building the Chrome MV3 extension, a multi-agent code review identified 5 race conditions across `background.js` (service worker) and `options.js` (settings page):

1. **Double-click concurrent saves (P1)** — Clicking the toolbar icon or context menu rapidly triggered overlapping `saveUrl()` calls, causing duplicate API requests and interleaved toast messages.
2. **Missing fetch timeout (P1)** — `fetch()` had no timeout. If the server hung, the "Saving..." toast stayed forever and the extension appeared frozen.
3. **Untracked inner toast timeout (P2)** — `showToast()` tracked `_coolectionTimeout` (fade delay) but not the inner `setTimeout(() => t.remove(), 200)`. A new toast appearing during the 200ms fade-out window would be deleted by the stale timer.
4. **Form submit before storage loads (P2)** — The options form could be submitted before `chrome.storage.local.get()` finished, saving empty/default values over actual settings.
5. **Status timeout collision (P2)** — `showStatus()` success auto-clear (3s) wasn't tracked. A quick save → validation error sequence would have the stale success timeout clear the error after 3s.

## Root Cause

Chrome MV3 service workers are event-driven and non-persistent. All event handlers are registered synchronously at the top level, but the handler bodies are async. Nothing prevents multiple user actions from triggering overlapping async operations. The original code assumed sequential execution that the architecture doesn't guarantee.

## Solution

### Fix 1: Double-click guard — `background.js`

```javascript
// Before: no guard, concurrent calls proceed freely
async function saveUrl(tabId, url) {
  if (!url || !/^https?:\/\//.test(url)) return;
  // ... immediately proceeds to fetch
}

// After: module-level flag prevents concurrent saves
let saving = false;
async function saveUrl(tabId, url) {
  if (!url || !/^https?:\/\//.test(url)) return;
  if (saving) return;

  saving = true;
  try {
    // ... fetch and handle response ...
  } finally {
    saving = false;
  }
}
```

### Fix 2: Fetch timeout with AbortController — `background.js`

```javascript
// Before: bare fetch(), hangs indefinitely
const response = await fetch(url, { method: "POST", ... });

// After: 10s timeout via AbortController
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch(url, {
    method: "POST",
    signal: controller.signal,
    // ...
  });
  // ... handle response ...
} catch (e) {
  if (e.name === "AbortError") {
    showToast(tabId, "Request timed out — try again");
  } else {
    showToast(tabId, "Network error — check connection");
  }
} finally {
  clearTimeout(timeout);
  saving = false;
}
```

### Fix 3: Track inner remove timeout — `background.js`

```javascript
// Before: only _coolectionTimeout tracked
if (t) {
  clearTimeout(t._coolectionTimeout);
  // inner remove timeout not cleared — can delete new toast
}

// After: both timeouts tracked and cleared
if (t) {
  clearTimeout(t._coolectionTimeout);
  clearTimeout(t._coolectionRemoveTimeout);
}
// ...
t._coolectionTimeout = setTimeout(() => {
  t.style.opacity = "0";
  t._coolectionRemoveTimeout = setTimeout(() => t.remove(), 200);
}, 2000);
```

### Fix 4: Loaded guard for options form — `options.js`

```javascript
// Before: submit handler runs immediately, storage may not be loaded
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  // could save empty values if storage hasn't loaded yet
});

// After: flag set after storage loads, checked before save
let loaded = false;

document.addEventListener("DOMContentLoaded", async () => {
  const { token, serverUrl } = await chrome.storage.local.get([...]);
  // ... populate form ...
  loaded = true;
});

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!loaded) return;
  // ... safe to save ...
});
```

### Fix 5: Track status timeout — `options.js`

```javascript
// Before: timeout not tracked, stale success clear erases error
function showStatus(message, type) {
  el.textContent = message;
  if (type === "success") {
    setTimeout(() => { el.textContent = ""; }, 3000); // untracked
  }
}

// After: clear previous timeout on each call
let statusTimeout;
function showStatus(message, type) {
  clearTimeout(statusTimeout);
  el.textContent = message;
  if (type === "success") {
    statusTimeout = setTimeout(() => { el.textContent = ""; }, 3000);
  }
}
```

## Prevention

### Code Review Checklist for Extension Code

- [ ] All async event handlers have a guard flag to prevent concurrent invocations
- [ ] All `fetch()` calls use `AbortController` with an explicit timeout
- [ ] Every `setTimeout` return value is stored and cleared on reuse or teardown
- [ ] Nested timeouts (e.g., fade then remove) are individually tracked
- [ ] Form submit handlers verify async initialization is complete before proceeding
- [ ] Auto-clearing UI feedback (success messages, toasts) tracks its timeout ID and clears on each call
- [ ] `finally` blocks reset all guard flags and clean up timers

### General Principles

- **Every timeout needs a name.** If you can't `clearTimeout(x)` on it, it's a bug waiting to happen.
- **Guard async entry points.** Service worker event handlers can fire concurrently — assume they will.
- **Always reach a terminal state.** Use `finally` to ensure flags reset and timers clear, even on errors.
- **Don't trust timing.** A "3 second auto-clear" and a "user clicks again in 2 seconds" will overlap. Design for it.

## Related Documentation

- `docs/plans/2026-02-07-feat-chrome-extension-plan.md` — Original implementation plan with toast and timeout patterns
- `docs/brainstorms/2026-02-07-chrome-extension-brainstorm.md` — Initial architecture exploration
- `ios/CoolectionSafari/CoolectionSafari Extension/Resources/background.js` — Safari extension with similar toast pattern (same class of bugs may apply)
- `docs/plans/2026-02-06-feat-safari-extension-ios-plan.md` — Safari plan noting service worker death after 30-45s on iOS

This is the first entry in `docs/solutions/`. The Safari extension's `background.js` uses the same toast reuse pattern and should be audited for the same inner-timeout tracking issue (Fix 3).
