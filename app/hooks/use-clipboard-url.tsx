"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import { isValidUrl } from "@/lib/url";

export function useClipboardUrl(
  onSave: (_url: string) => Promise<void>,
  enabled: boolean,
) {
  const lastSuggestedUrl = useRef<string | null>(null);

  const checkClipboard = useCallback(async () => {
    if (!enabled) return;

    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();

      if (!trimmed || !isValidUrl(trimmed)) return;
      if (trimmed === lastSuggestedUrl.current) return;

      lastSuggestedUrl.current = trimmed;

      toast("URL found in clipboard", {
        description: trimmed,
        classNames: {
          description: "!text-sm !text-text-quaternary line-clamp-2 break-all",
        },
        action: {
          label: "Save",
          onClick: () => onSave(trimmed),
        },
        duration: 8000,
      });
    } catch {
      // Clipboard API not available or permission denied — silently ignore
    }
  }, [onSave, enabled]);

  useEffect(() => {
    checkClipboard();

    const handleFocus = () => checkClipboard();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [checkClipboard]);
}
