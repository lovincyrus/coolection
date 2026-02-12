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
  function scrollAndCollect(maxScrolls = 50, scrollDelay = 1500) {
    return new Promise((resolve) => {
      const allUrls = new Set();
      let scrollCount = 0;
      let lastCount = 0;
      let stableRounds = 0;

      function collectCurrent() {
        for (const url of extractBookmarkUrls()) {
          allUrls.add(url);
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

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "SCAN_BOOKMARKS") {
      const maxScrolls = message.maxScrolls ?? 50;
      const scrollDelay = message.scrollDelay ?? 1500;

      scrollAndCollect(maxScrolls, scrollDelay).then((urls) => {
        sendResponse({ urls });
      });

      // Return true to indicate async response
      return true;
    }

    if (message.type === "SCAN_BOOKMARKS_VISIBLE") {
      // Quick scan — only what's currently visible, no scrolling
      sendResponse({ urls: extractBookmarkUrls() });
      return false;
    }
  });
})();
