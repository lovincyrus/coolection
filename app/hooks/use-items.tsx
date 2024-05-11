"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

import { CoolectionItem } from "../types";

export function useItems() {
  const { data, isLoading, error, mutate } = useSWR<CoolectionItem[]>(
    "/api/items",
    fetcher,
  );

  return {
    items: data,
    loading: isLoading,
    error,
    mutate,
  };
}
