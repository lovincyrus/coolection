"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

import { CoolectionItem } from "../types/coolection";

export function useItemsFromList(listId: string) {
  const { data, isLoading, mutate, error } = useSWR<CoolectionItem[]>(
    listId ? `/api/lists/${listId}/items` : null,
    fetcher,
  );

  return {
    data: data ?? [],
    loading: isLoading,
    mutate,
    error,
  };
}
