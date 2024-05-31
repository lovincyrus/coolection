"use client";

import { List } from "@prisma/client";
import useSWR from "swr";

import { getLists } from "../data";

export function useLists() {
  // const { data, isLoading, mutate, error } = useSWR<List[]>(
  //   "/api/lists",
  //   fetcher,
  //   {
  //     suspense: true,
  //   },
  // );

  const { data } = useSWR<List[]>("lists", getLists);

  return {
    data: data ?? [],
    // loading: isLoading,
    // mutate,
    // error,
  };
}
