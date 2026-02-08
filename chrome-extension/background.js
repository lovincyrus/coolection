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
