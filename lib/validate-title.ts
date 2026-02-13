// Titles returned by bot-protection pages, interstitials, and challenge screens.
// These should never be saved as item titles.
const BLOCKED_TITLES = [
  "just a moment...",
  "attention required!",
  "access denied",
  "please wait...",
  "checking your browser...",
  "one moment, please...",
  "you are being redirected...",
  "security check",
  "please verify you are a human",
  "forbidden",
  "403 forbidden",
  "bot verification",
];

/**
 * Returns true if the title looks like real page content rather than a
 * bot-protection interstitial or empty value.
 */
export function isValidTitle(
  title: string | undefined | null,
): title is string {
  if (!title) return false;

  const trimmed = title.trim();
  if (trimmed.length === 0) return false;

  return !BLOCKED_TITLES.includes(trimmed.toLowerCase());
}

/**
 * Derives a human-readable fallback title from a URL.
 *
 * Examples:
 *   "https://www.julian.com"             → "julian.com"
 *   "https://playground.ai.cloudflare.com/" → "playground.ai.cloudflare.com"
 *   "https://example.com/blog/my-post"   → "my-post"
 */
export function titleFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "");

    // Use the last meaningful path segment if available
    const segments = parsed.pathname
      .split("/")
      .filter((s) => s.length > 0);

    if (segments.length > 0) {
      const last = segments[segments.length - 1];
      // Decode URI components and replace common separators with spaces
      return decodeURIComponent(last).replace(/[-_]/g, " ");
    }

    return hostname;
  } catch {
    return undefined;
  }
}
