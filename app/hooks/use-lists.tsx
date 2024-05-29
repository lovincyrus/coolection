"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

import { CoolectionList } from "../types";

export function useLists(listsServerData: any) {
  const { data, isLoading, mutate, error } = useSWR<CoolectionList[]>(
    "/api/lists",
    fetcher,
    {
      suspense: true,
      fallbackData: listsServerData,
    },
  );

  return {
    data: data ?? [],
    loading: isLoading,
    mutate,
    error,
  };
}
