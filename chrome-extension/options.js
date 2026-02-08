const DEFAULT_SERVER = "https://www.coolection.co";

let loaded = false;

document.addEventListener("DOMContentLoaded", async () => {
  const { token, serverUrl } = await chrome.storage.local.get(["token", "serverUrl"]);
  document.getElementById("token").value = token || "";
  document.getElementById("serverUrl").value = serverUrl || DEFAULT_SERVER;
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
