import { beforeEach, describe, expect, it } from "vitest";

/**
 * Test the bookmark URL extraction logic from bookmarks-content.js.
 * We replicate the extraction function here to test it in isolation,
 * since the content script runs as an IIFE in the browser.
 */

const TWEET_LINK_PATTERN = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/\d+$/;

function extractBookmarkUrls(root: Document | Element): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  const articles = root.querySelectorAll("article[data-testid='tweet']");
  for (const article of articles) {
    const links = article.querySelectorAll("a[href*='/status/']");
    for (const link of links) {
      const href = (link as HTMLAnchorElement).href.split("?")[0];
      if (TWEET_LINK_PATTERN.test(href) && !seen.has(href)) {
        seen.add(href);
        urls.push(href);
      }
    }
  }

  return urls;
}

function createTweetArticle(
  username: string,
  tweetId: string,
  extraLinks: string[] = [],
): HTMLElement {
  const article = document.createElement("article");
  article.setAttribute("data-testid", "tweet");

  const link = document.createElement("a");
  link.href = `https://x.com/${username}/status/${tweetId}`;
  article.appendChild(link);

  for (const href of extraLinks) {
    const extra = document.createElement("a");
    extra.href = href;
    article.appendChild(extra);
  }

  return article;
}

describe("extractBookmarkUrls", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.innerHTML = "";
    document.body.appendChild(container);
  });

  it("extracts tweet URLs from article elements", () => {
    container.appendChild(createTweetArticle("rauchg", "1784694622566187100"));
    container.appendChild(createTweetArticle("dan_abramov", "1800000000000000000"));

    const urls = extractBookmarkUrls(document);

    expect(urls).toEqual([
      "https://x.com/rauchg/status/1784694622566187100",
      "https://x.com/dan_abramov/status/1800000000000000000",
    ]);
  });

  it("deduplicates URLs", () => {
    container.appendChild(createTweetArticle("rauchg", "1784694622566187100"));
    container.appendChild(createTweetArticle("rauchg", "1784694622566187100"));

    const urls = extractBookmarkUrls(document);

    expect(urls).toEqual([
      "https://x.com/rauchg/status/1784694622566187100",
    ]);
  });

  it("ignores non-tweet links inside articles", () => {
    const article = createTweetArticle("rauchg", "1784694622566187100", [
      "https://x.com/rauchg", // profile link, not a status
      "https://t.co/abc123/status/fake", // different domain
    ]);
    container.appendChild(article);

    const urls = extractBookmarkUrls(document);

    expect(urls).toEqual([
      "https://x.com/rauchg/status/1784694622566187100",
    ]);
  });

  it("strips query params from URLs", () => {
    const article = document.createElement("article");
    article.setAttribute("data-testid", "tweet");

    const link = document.createElement("a");
    link.href = "https://x.com/rauchg/status/1784694622566187100?s=20&t=abc";
    article.appendChild(link);

    container.appendChild(article);

    const urls = extractBookmarkUrls(document);

    expect(urls).toEqual([
      "https://x.com/rauchg/status/1784694622566187100",
    ]);
  });

  it("returns empty array when no tweet articles exist", () => {
    const div = document.createElement("div");
    div.innerHTML = "<p>No bookmarks</p>";
    container.appendChild(div);

    const urls = extractBookmarkUrls(document);

    expect(urls).toEqual([]);
  });

  it("ignores articles without data-testid=tweet", () => {
    const article = document.createElement("article");
    const link = document.createElement("a");
    link.href = "https://x.com/rauchg/status/1784694622566187100";
    article.appendChild(link);
    container.appendChild(article);

    const urls = extractBookmarkUrls(document);

    expect(urls).toEqual([]);
  });

  it("handles underscores in usernames", () => {
    container.appendChild(createTweetArticle("emilkowalski_", "999999999999999999"));

    const urls = extractBookmarkUrls(document);

    expect(urls).toEqual([
      "https://x.com/emilkowalski_/status/999999999999999999",
    ]);
  });
});
