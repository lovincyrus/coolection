"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { unstable_serialize, useSWRConfig } from "swr";

import { isTwitterPostOrBookmarkUrl } from "@/lib/url";

import { useClipboardUrl } from "../hooks/use-clipboard-url";
import { getKey } from "../hooks/use-paginated-items";

export function ClipboardUrlDetector() {
  const { mutate } = useSWRConfig();

  const saveUrl = useCallback(
    async (url: string) => {
      const toastMessage = isTwitterPostOrBookmarkUrl(url)
        ? "tweet"
        : "website";

      const saveItem = async () => {
        const response = await fetch("/api/item/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to add the item";
          if (response.status === 409) {
            errorMessage = "Item already exists";
          } else {
            const responseText = await response.text();
            errorMessage = responseText || errorMessage;
          }
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        const newItem = await response.json();
        // Revalidate the paginated items list
        mutate(unstable_serialize(getKey));
        return newItem;
      };

      toast.promise(saveItem(), {
        loading: `Adding ${toastMessage}...`,
        success: `${toastMessage.charAt(0).toUpperCase() + toastMessage.slice(1)} added successfully`,
      });
    },
    [mutate],
  );

  const handleUrlDetected = useCallback(
    (url: string) => {
      toast("URL found in clipboard", {
        description: url,
        action: {
          label: "Save to Coolection",
          onClick: () => saveUrl(url),
        },
        duration: 8000,
      });
    },
    [saveUrl],
  );

  useClipboardUrl(handleUrlDetected);

  return null;
}
