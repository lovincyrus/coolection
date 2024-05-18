"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

import { CoolectionItem } from "../types";

export function getSearchSwrKey(query: string) {
  return `/api/search?q=${query}`;
}

export function useSearchResults(query: string) {
  const searchSwrKey = getSearchSwrKey(query);
  const { data, isLoading, error, mutate } = useSWR<CoolectionItem[]>(
    query ? searchSwrKey : null,
    fetcher,
    {
      // See: https://swr.vercel.app/docs/advanced/understanding#return-previous-data-for-better-ux
      keepPreviousData: true,
    },
  );

  return {
    data: data ?? [],
    loading: isLoading,
    error,
    mutate,
  };
}
