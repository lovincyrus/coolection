"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

export function useItemsFromList(listId: string) {
  const { data, isLoading, error } = useSWR(
    listId ? `/api/lists/${listId}/items` : null,
    fetcher,
  );

  return {
    data: data ?? [],
    loading: isLoading,
    error,
  };
}
