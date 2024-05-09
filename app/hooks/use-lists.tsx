"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

export function useLists() {
  const { data, isLoading, error } = useSWR("/api/lists", fetcher);

  return {
    lists: data,
    loading: isLoading,
    error,
  };
}
