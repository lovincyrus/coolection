"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

export function useItemsFromLIst(listId: string) {
  const { data, isLoading, error } = useSWR(
    `/api/lists/${listId}/items`,
    fetcher,
  );

  return {
    itemsFromList: data,
    loading: isLoading,
    error,
  };
}
