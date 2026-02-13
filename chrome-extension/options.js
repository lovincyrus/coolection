const DEFAULT_SERVER = "https://www.coolection.co";

let loaded = false;

document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get([
    "token",
    "serverUrl",
    "syncEnabled",
    "syncInterval",
    "syncStatus",
  ]);
  document.getElementById("token").value = data.token || "";
  document.getElementById("serverUrl").value = data.serverUrl || DEFAULT_SERVER;
  document.getElementById("syncEnabled").checked = !!data.syncEnabled;
  document.getElementById("syncInterval").value = String(data.syncInterval || 60);

  if (data.syncStatus) {
    showSyncStatus(data.syncStatus);
  }

  loaded = true;
});

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!loaded) return;

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

let statusTimeout;
function showStatus(message, type) {
  clearTimeout(statusTimeout);
  const el = document.getElementById("status");
  el.textContent = message;
  el.className = `status ${type}`;
  if (type === "success") {
    statusTimeout = setTimeout(() => { el.textContent = ""; el.className = "status"; }, 3000);
  }
}

// ── X Bookmark Sync controls ──

document.getElementById("syncEnabled").addEventListener("change", async (e) => {
  if (!loaded) return;
  const enabled = e.target.checked;
  const interval = Number(document.getElementById("syncInterval").value);

  await chrome.storage.local.set({ syncEnabled: enabled, syncInterval: interval });
  chrome.runtime.sendMessage({
    type: "UPDATE_SYNC_SCHEDULE",
    enabled,
    interval,
  });
});

document.getElementById("syncInterval").addEventListener("change", async (e) => {
  if (!loaded) return;
  const interval = Number(e.target.value);
  const enabled = document.getElementById("syncEnabled").checked;

  await chrome.storage.local.set({ syncInterval: interval });
  if (enabled) {
    chrome.runtime.sendMessage({
      type: "UPDATE_SYNC_SCHEDULE",
      enabled: true,
      interval,
    });
  }
});

let syncInProgress = false;
document.getElementById("syncNow").addEventListener("click", async () => {
  if (!loaded || syncInProgress) return;

  const { token } = await chrome.storage.local.get(["token"]);
  if (!token) {
    showSyncText("Set an API token first", "error");
    return;
  }

  syncInProgress = true;
  const btn = document.getElementById("syncNow");
  btn.disabled = true;
  showSyncText("Syncing bookmarks...");

  try {
    const result = await chrome.runtime.sendMessage({ type: "TRIGGER_BOOKMARK_SYNC" });

    if (result?.success) {
      const parts = [];
      if (result.added > 0) parts.push(`${result.added} added`);
      if (result.skipped > 0) parts.push(`${result.skipped} already saved`);
      if (result.failed > 0) parts.push(`${result.failed} failed`);
      showSyncText(parts.length > 0 ? parts.join(", ") : "No bookmarks found");

      if (result.lastSync) {
        showSyncStatus(result);
      }
    } else {
      showSyncText(result?.reason === "already_syncing" ? "Sync already in progress" : "Sync failed");
    }
  } catch {
    showSyncText("Sync failed — check connection");
  } finally {
    syncInProgress = false;
    btn.disabled = false;
  }
});

let syncTextTimeout;
function showSyncText(message, type) {
  clearTimeout(syncTextTimeout);
  const el = document.getElementById("syncStatusText");
  el.textContent = message;
  el.style.color = type === "error" ? "#c53030" : "";
  syncTextTimeout = setTimeout(() => { el.textContent = ""; el.style.color = ""; }, 8000);
}

function showSyncStatus(status) {
  const el = document.getElementById("syncStatusText");
  if (!status?.lastSync) return;

  const date = new Date(status.lastSync);
  const timeStr = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const parts = [`Last sync: ${timeStr}`];
  if (status.added > 0) parts.push(`${status.added} added`);
  el.textContent = parts.join(" · ");
}
