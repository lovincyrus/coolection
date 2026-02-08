function showToast(tabId, message, persistent) {
  browser.scripting.executeScript({
    target: { tabId },
    func: (msg, stay) => {
      let t = document.getElementById("coolection-toast");
      if (t) {
        t.textContent = msg;
      } else {
        t = document.createElement("div");
        t.id = "coolection-toast";
        t.textContent = msg;
        t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.55);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);color:#fff;padding:10px 20px;border-radius:8px;font:14px -apple-system,sans-serif;z-index:2147483647;opacity:0;transition:opacity .2s";
        document.body.appendChild(t);
        requestAnimationFrame(() => (t.style.opacity = "1"));
      }
      if (!stay) {
        setTimeout(() => {
          t.style.opacity = "0";
          setTimeout(() => t.remove(), 200);
        }, 2000);
      }
    },
    args: [message, !!persistent],
  });
}

browser.action.onClicked.addListener(async (tab) => {
  const url = tab.url;
  if (!url || !/^https?:\/\//.test(url)) return;

  let response;
  try {
    response = await browser.runtime.sendNativeMessage(
      "co.coolection.safari",
      { action: "getToken" }
    );
  } catch (e) {
    showToast(tab.id, "Extension error: no token");
    return;
  }

  if (!response || !response.token) {
    showToast(tab.id, "Open Coolection app to set token");
    return;
  }

  const serverURL = response.serverURL || "https://www.coolection.co";

  showToast(tab.id, "Saving...", true);

  try {
    const result = await fetch(`${serverURL}/api/item/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${response.token}`,
      },
      body: JSON.stringify({ url }),
    });

    if (result.ok) {
      showToast(tab.id, "Saved to Coolection");
    } else if (result.status === 409) {
      showToast(tab.id, "Already saved");
    } else {
      showToast(tab.id, "Failed to save (" + result.status + ")");
    }
  } catch (e) {
    showToast(tab.id, "Network error — check connection");
  }
});
