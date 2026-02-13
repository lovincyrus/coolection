"use client";

import useSWR, { preload } from "swr";

import { fetcher } from "@/lib/fetcher";

import { Item } from "../types/coolection";

export function getListItemsKey(listId: string) {
  return `/api/lists/${listId}/items`;
}

export function preloadListItems(listId: string) {
  preload(getListItemsKey(listId), fetcher);
}

export function useItemsFromList(listId: string) {
  const { data, isLoading, mutate, error } = useSWR<Item[]>(
    listId ? getListItemsKey(listId) : null,
    fetcher,
  );

  return {
    data: data ?? [],
    loading: isLoading,
    mutate,
    error,
  };
}
