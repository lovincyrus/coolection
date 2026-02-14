"use client";

import { useCallback, useEffect, useRef } from "react";

import { isValidUrl } from "@/lib/url";

const DISMISSED_URLS_KEY = "coolection:dismissed-clipboard-urls";

function getDismissedUrls(): Set<string> {
  try {
    const stored = sessionStorage.getItem(DISMISSED_URLS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function dismissUrl(url: string) {
  const dismissed = getDismissedUrls();
  dismissed.add(url);
  sessionStorage.setItem(
    DISMISSED_URLS_KEY,
    JSON.stringify(Array.from(dismissed)),
  );
}

export function useClipboardUrl(onUrlDetected: (_url: string) => void) {
  const lastCheckedRef = useRef<string | null>(null);

  const checkClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();

      if (!trimmed || !isValidUrl(trimmed)) return;
      if (trimmed === lastCheckedRef.current) return;
      if (getDismissedUrls().has(trimmed)) return;

      lastCheckedRef.current = trimmed;
      dismissUrl(trimmed);
      onUrlDetected(trimmed);
    } catch {
      // Clipboard permission denied or unavailable — silently ignore
    }
  }, [onUrlDetected]);

  useEffect(() => {
    // Check once on mount
    checkClipboard();

    const handleFocus = () => checkClipboard();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkClipboard]);
}
