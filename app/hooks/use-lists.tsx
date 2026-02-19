"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

import { List } from "../types";

export function useLists(listsServerData: any) {
  const { data, isLoading, mutate, error } = useSWR<List[]>(
    "/api/lists",
    fetcher,
    {
      suspense: true,
      fallbackData: listsServerData,
    },
  );

  return {
    data: Array.isArray(data) ? data : [],
    loading: isLoading,
    mutate,
    error,
  };
}
