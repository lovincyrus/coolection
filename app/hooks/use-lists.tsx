"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

import { CoolectionList } from "../types";

export function useLists() {
  const { data, isLoading, mutate, error } = useSWR<CoolectionList[]>(
    "/api/lists",
    fetcher,
  );

  return {
    data: data ?? [],
    loading: isLoading,
    mutate,
    error,
  };
}
