"use client";

import useSWRInfinite from "swr/infinite";

import { INITIAL_ITEMS_COUNT } from "@/lib/constants";
import { fetcher } from "@/lib/fetcher";

// Get the SWR key of each page
export const getKey = (
  pageIndex: number,
  previousPageData: CoolectionItem[],
) => {
  if (previousPageData && !previousPageData.length) return null;
  return `/api/items?page=${pageIndex + 1}&limit=${INITIAL_ITEMS_COUNT}`;
};

export function useItems() {
  const {
    data: items,
    mutate: mutateItems,
    size,
    setSize,
    isValidating,
    isLoading: loadingItems,
  } = useSWRInfinite(getKey, fetcher, {
    // See: https://swr.vercel.app/docs/pagination#parameters
    initialSize: 1,
    revalidateAll: true,
  });

  return {
    data: items ?? [],
    loading: loadingItems,
    mutate: mutateItems,
    size,
    setSize,
    isValidating,
  };
}
