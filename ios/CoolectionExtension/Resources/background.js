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
      browser.action.setBadgeText({ text: "\u2713" });
      setTimeout(() => browser.action.setBadgeText({ text: "" }), 2000);
    }
  } catch {
    // Silent failure
  }
});
