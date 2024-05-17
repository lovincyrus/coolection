"use client";

import { useEffect } from "react";
import useSWR from "swr";

import { fetcher as originalFetcher } from "@/lib/fetcher";

import { CoolectionItem } from "../types";

// Note: If we want to persist all the swr data in `localStorage`, we can use the provider
// See: https://swr.vercel.app/docs/advanced/cache.en-US#localstorage-based-persistent-cache
export function useItems() {
  const localData =
    typeof window !== "undefined" ? localStorage.getItem("/api/items") : null;
  const fallbackData = localData ? JSON.parse(localData) : [];

  // Persist the data in localStorage
  const fetcher = async (url: string) => {
    const data = await originalFetcher<CoolectionItem[]>(url);
    if (typeof window !== "undefined") {
      localStorage.setItem(url, JSON.stringify(data));
    }
    return data;
  };

  const { data, isLoading, error, mutate } = useSWR<CoolectionItem[]>(
    "/api/items",
    fetcher,
    {
      fallbackData: fallbackData,
    },
  );

  // Before unloading the app, we write back all the data into `localStorage`.
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (data) {
        localStorage.setItem("/api/items", JSON.stringify(data));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [data]);

  return {
    items: data ?? [],
    loading: isLoading,
    error,
    mutate,
  };
}
