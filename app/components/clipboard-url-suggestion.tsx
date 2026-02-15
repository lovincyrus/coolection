"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { isTwitterPostOrBookmarkUrl } from "@/lib/url";

import { useClipboardUrl } from "../hooks/use-clipboard-url";

export function ClipboardUrlSuggestion() {
  const { isSignedIn } = useAuth();
  const { mutate } = useSWRConfig();

  const handleSave = useCallback(
    async (url: string) => {
      const toastMessage = isTwitterPostOrBookmarkUrl(url) ? "tweet" : "website";

      const saveItem = async () => {
        const response = await fetch("/api/item/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const errorMessage =
            response.status === 409
              ? "Item already exists"
              : (await response.text()) || "Failed to add the item";

          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        // Revalidate items so the new item appears
        mutate((key: string) => typeof key === "string" && key.startsWith("/api/items"));

        return await response.json();
      };

      toast.promise(saveItem(), {
        loading: `Adding ${toastMessage}...`,
        success: `${toastMessage.charAt(0).toUpperCase() + toastMessage.slice(1)} added successfully`,
      });
    },
    [mutate],
  );

  useClipboardUrl(handleSave, !!isSignedIn);

  return null;
}
