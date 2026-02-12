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
let saving = false;
async function saveUrl(tabId, url) {
  if (!url || !/^https?:\/\//.test(url)) return;
  if (saving) return;

  const { token, serverUrl } = await chrome.storage.local.get(["token", "serverUrl"]);
  if (!token) {
    chrome.runtime.openOptionsPage();
    return;
  }

  const server = (serverUrl || "https://www.coolection.co").replace(/\/+$/, "");

  saving = true;
  showToast(tabId, "Saving...", true);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${server}/api/item/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
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
    if (e.name === "AbortError") {
      showToast(tabId, "Request timed out — try again");
    } else {
      showToast(tabId, "Network error — check connection");
    }
  } finally {
    clearTimeout(timeout);
    saving = false;
  }
}

// ── X Bookmark Sync ──────────────────────────────────────────────────

const SYNC_ALARM_NAME = "coolection-x-bookmark-sync";
const BOOKMARKS_URL = "https://x.com/i/bookmarks";

// Re-arm the alarm on install/update if sync was previously enabled
chrome.runtime.onInstalled.addListener(async () => {
  const { syncEnabled, syncInterval } = await chrome.storage.local.get([
    "syncEnabled",
    "syncInterval",
  ]);
  if (syncEnabled) {
    scheduleSync(syncInterval || 60);
  }
});

// Listen for alarm fires
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM_NAME) {
    runBookmarkSync();
  }
});

// Listen for manual sync trigger from options page
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "TRIGGER_BOOKMARK_SYNC") {
    runBookmarkSync().then((result) => sendResponse(result));
    return true; // async response
  }
  if (message.type === "UPDATE_SYNC_SCHEDULE") {
    if (message.enabled) {
      scheduleSync(message.interval || 60);
    } else {
      chrome.alarms.clear(SYNC_ALARM_NAME);
    }
  }
});

function scheduleSync(intervalMinutes) {
  chrome.alarms.create(SYNC_ALARM_NAME, {
    delayInMinutes: intervalMinutes,
    periodInMinutes: intervalMinutes,
  });
}

let syncing = false;
async function runBookmarkSync() {
  if (syncing) return { success: false, reason: "already_syncing" };
  syncing = true;

  try {
    const { token, serverUrl, syncEnabled } = await chrome.storage.local.get([
      "token",
      "serverUrl",
      "syncEnabled",
    ]);

    // Alarm-triggered syncs respect the enabled flag; manual triggers always run
    if (!token) return { success: false, reason: "no_token" };

    const server = (serverUrl || "https://www.coolection.co").replace(/\/+$/, "");

    // Find an existing x.com/i/bookmarks tab or create one
    const tabs = await chrome.tabs.query({ url: "https://x.com/i/bookmarks*" });
    let tab;
    let createdTab = false;

    if (tabs.length > 0) {
      tab = tabs[0];
      // Make sure it's fully loaded
      if (tab.status !== "complete") {
        await waitForTabLoad(tab.id);
      }
    } else {
      tab = await chrome.tabs.create({ url: BOOKMARKS_URL, active: false });
      createdTab = true;
      await waitForTabLoad(tab.id);
      // Give X's JS extra time to render the timeline
      await sleep(3000);
    }

    // Ask the content script to scan visible bookmarks (with scrolling)
    let urls;
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "SCAN_BOOKMARKS",
        maxScrolls: 20,
        scrollDelay: 1500,
      });
      urls = response?.urls || [];
    } catch (e) {
      // Content script not ready — inject it manually and retry
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["bookmarks-content.js"],
      });
      await sleep(500);
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "SCAN_BOOKMARKS",
        maxScrolls: 20,
        scrollDelay: 1500,
      });
      urls = response?.urls || [];
    }

    // Clean up the tab we created
    if (createdTab) {
      chrome.tabs.remove(tab.id).catch(() => {});
    }

    if (urls.length === 0) {
      await updateSyncStatus({ lastSync: Date.now(), added: 0, skipped: 0, failed: 0 });
      return { success: true, added: 0, skipped: 0, total: 0 };
    }

    // Send URLs to the bulk-create endpoint in batches of 100
    let added = 0;
    let skipped = 0;
    let failed = 0;

    const BATCH_SIZE = 100;
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      try {
        const res = await fetch(`${server}/api/item/bulk-create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ urls: batch }),
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          added += data.created || 0;
          skipped += data.duplicates || 0;
          failed += data.failed || 0;
        } else {
          failed += batch.length;
        }
      } catch {
        failed += batch.length;
      } finally {
        clearTimeout(timeout);
      }
    }

    const status = { lastSync: Date.now(), added, skipped, failed };
    await updateSyncStatus(status);
    return { success: true, ...status, total: urls.length };
  } finally {
    syncing = false;
  }
}

function waitForTabLoad(tabId, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error("Tab load timeout"));
    }, timeoutMs);

    function listener(id, changeInfo) {
      if (id === tabId && changeInfo.status === "complete") {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }

    chrome.tabs.onUpdated.addListener(listener);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateSyncStatus(status) {
  await chrome.storage.local.set({ syncStatus: status });
}

// 5. Toast injection (adapted from Safari extension background.js)
function showToast(tabId, message, persistent) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (msg, stay) => {
      let t = document.getElementById("coolection-toast");
      if (t) {
        clearTimeout(t._coolectionTimeout);
        clearTimeout(t._coolectionRemoveTimeout);
        t.textContent = msg;
        t.style.opacity = "1";
      } else {
        t = document.createElement("div");
        t.id = "coolection-toast";
        t.textContent = msg;
        var d = window.matchMedia("(prefers-color-scheme:dark)").matches;
        t.style.cssText =
          "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);" +
          "background:" + (d ? "#fff" : "#000") + ";color:" + (d ? "#000" : "#fff") + ";padding:10px 20px;border-radius:8px;border:1px solid " + (d ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)") + ";" +
          "font:14px Inter,-apple-system,system-ui,sans-serif;z-index:2147483647;" +
          "opacity:0;transition:opacity .2s";
        document.body.appendChild(t);
        requestAnimationFrame(() => (t.style.opacity = "1"));
      }
      if (!stay) {
        t._coolectionTimeout = setTimeout(() => {
          t.style.opacity = "0";
          t._coolectionRemoveTimeout = setTimeout(() => t.remove(), 200);
        }, 2000);
      }
    },
    args: [message, !!persistent],
  }).catch(() => {
    // Toast injection failed (restricted page) — silent fallback
  });
}
