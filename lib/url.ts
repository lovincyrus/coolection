import normalizeUrl from "normalize-url";

export function isValidUrl(input: string) {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

export function isTwitterUrl(input: string) {
  try {
    const url = new URL(input);
    return url.hostname === "twitter.com";
  } catch {
    return false;
  }
}

export function normalizeLink(input: string) {
  return normalizeUrl(input, {
    removeTrailingSlash: true,
    stripWWW: false,
  });
}
