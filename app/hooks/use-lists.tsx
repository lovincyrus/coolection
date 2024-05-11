"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

import { CoolectionList } from "../types";

export function useLists() {
  const { data, isLoading, error } = useSWR<CoolectionList[]>(
    "/api/lists",
    fetcher,
  );

  return {
    lists: data ?? [],
    loading: isLoading,
    error,
  };
}