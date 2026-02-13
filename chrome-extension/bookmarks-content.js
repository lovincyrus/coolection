// bookmarks-content.js — Content script injected on x.com/i/bookmarks
// Extracts tweet URLs from the bookmarks timeline DOM.

(() => {
  /**
   * Scan the current DOM for tweet links inside the bookmarks timeline.
   * Twitter/X renders bookmarked tweets as <article> elements containing
   * links that match /{username}/status/{id}.
   * Returns a de-duplicated array of full tweet URLs.
   */
  function extractBookmarkUrls() {
    const tweetLinkPattern = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/\d+$/;
    const seen = new Set();
    const urls = [];

    const articles = document.querySelectorAll("article[data-testid='tweet']");
    for (const article of articles) {
      const links = article.querySelectorAll("a[href*='/status/']");
      for (const link of links) {
        const href = link.href.split("?")[0]; // strip query params
        if (tweetLinkPattern.test(href) && !seen.has(href)) {
          seen.add(href);
          urls.push(href);
        }
      }
    }

    return urls;
  }

  /**
   * Scroll down to load more bookmarks, then extract URLs.
   * Uses a MutationObserver to detect when new tweets are loaded.
   * Resolves with the full set of URLs found after scrolling completes.
   */
  function scrollAndCollect(maxScrolls = 50, scrollDelay = 1500, knownUrls = new Set()) {
    return new Promise((resolve) => {
      const allUrls = new Set();
      let scrollCount = 0;
      let lastCount = 0;
      let stableRounds = 0;
      let consecutiveKnown = 0;

      function collectCurrent() {
        for (const url of extractBookmarkUrls()) {
          if (allUrls.has(url)) continue;
          allUrls.add(url);

          // Track consecutive known URLs to detect previously-synced territory
          if (knownUrls.has(url)) {
            consecutiveKnown++;
          } else {
            consecutiveKnown = 0;
          }
        }
      }

      function doScroll() {
        collectCurrent();

        if (allUrls.size === lastCount) {
          stableRounds++;
        } else {
          stableRounds = 0;
          lastCount = allUrls.size;
        }

        // Stop if we've hit 5 consecutive known URLs (reached synced territory)
        if (consecutiveKnown >= 5) {
          resolve([...allUrls]);
          return;
        }

        // Stop if we've scrolled enough or no new items appeared after 3 rounds
        if (scrollCount >= maxScrolls || stableRounds >= 3) {
          resolve([...allUrls]);
          return;
        }

        scrollCount++;
        window.scrollBy(0, window.innerHeight);
        setTimeout(doScroll, scrollDelay);
      }

      doScroll();
    });
  }

  function showOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "coolection-sync-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483647",
      background: "rgba(255,255,255,0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "not-allowed",
    });
    overlay.innerHTML =
      '<div style="text-align:center;font-family:Inter,system-ui,sans-serif">' +
      '<div style="font-size:32px;margin-bottom:12px">🍵</div>' +
      '<div style="font-size:14px;font-weight:500;color:#111">Syncing bookmarks…</div>' +
      '<div style="font-size:12px;color:#6b7280;margin-top:4px">Don\u2019t close this tab</div>' +
      "</div>";
    // Block all interaction underneath
    overlay.addEventListener("click", (e) => e.stopPropagation(), true);
    overlay.addEventListener("keydown", (e) => e.stopPropagation(), true);
    document.body.appendChild(overlay);
  }

  function removeOverlay() {
    document.getElementById("coolection-sync-overlay")?.remove();
  }

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "SCAN_BOOKMARKS") {
      const maxScrolls = message.maxScrolls ?? 50;
      const scrollDelay = message.scrollDelay ?? 1500;
      const knownUrls = new Set(message.knownUrls || []);

      showOverlay();
      scrollAndCollect(maxScrolls, scrollDelay, knownUrls).then((urls) => {
        removeOverlay();
        sendResponse({ urls });
      });

      // Return true to indicate async response
      return true;
    }
  });
})();
