"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

export function useItems() {
  const { data, isLoading, error } = useSWR("/api/items", fetcher);

  return {
    items: data,
    loading: isLoading,
    error,
  };
}
