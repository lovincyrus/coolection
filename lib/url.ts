import normalizeUrl from "normalize-url";

export function isValidUrl(input: string) {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

// Bookmark: https://twitter.com/i/bookmarks?post_id=1784694622566187100
// Post: https://twitter.com/rauchg/status/1784694622566187100
// Profile: https://twitter.com/emilkowalski_
export function isTwitterPostOrBookmarkUrl(input: string) {
  try {
    const url = new URL(input);
    const postUrlRegex = /^https:\/\/twitter\.com\/[A-Za-z0-9_]+\/status\/\d+/;
    const bookmarkUrlRegex = /^https:\/\/twitter\.com\/i\/bookmarks\?post_id=/;

    if (url.hostname === "twitter.com") {
      const pathSegments = url.pathname
        .split("/")
        .filter((segment) => segment !== "");

      if (
        pathSegments.length >= 2 &&
        pathSegments[1] === "status" &&
        postUrlRegex.test(input)
      ) {
        // Check if it's a tweet URL
        return true;
      }

      if (bookmarkUrlRegex.test(input)) {
        // Check if it's a bookmark URL
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function isTwitterAccountUrl(href: string) {
  const twitterProfileRegex =
    /^(https?:\/\/)?(www\.)?twitter\.com\/[a-zA-Z0-9_]{1,15}\/?$/;

  // Excluding bookmarks and status posts
  const excludeRegex = /(\/i\/bookmarks\?post_id=)|(\/status\/)/;

  return twitterProfileRegex.test(href) && !excludeRegex.test(href);
}

export function normalizeLink(input: string) {
  return normalizeUrl(input, {
    removeTrailingSlash: true,
    stripWWW: false,
  });
}
