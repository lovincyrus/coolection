"use client";

import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { fetcher } from "@/lib/fetcher";

// Related: https://github.com/vercel/swr/blob/fedf233a48d40d1cd96517941b5f9e15ff2fc3ab/src/infinite/serialize.ts#L8
export const getKey: SWRInfiniteKeyLoader = (
  pageIndex: number,
  previousPageData: any | null,
) => {
  if (pageIndex === undefined)
    return `/api/items?page=1&limit=${DEFAULT_PAGE_SIZE}`;
  if (previousPageData && !previousPageData.length) return null; // reached the end
  return `/api/items?page=${pageIndex + 1}&limit=${DEFAULT_PAGE_SIZE}`;
};

export function usePaginatedItems() {
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
    parallel: true,
    suspense: true,
  });

  const isLoadingMore =
    loadingItems ||
    (size > 0 && items && typeof items[size - 1] === "undefined");
  const isEmpty = items?.[0]?.length === 0;
  const lastPage = items && items[items.length - 1];
  const isLastPageFull = lastPage?.length === DEFAULT_PAGE_SIZE;
  const totalItems = items?.flat().length;
  const isAllPagesFull = totalItems === DEFAULT_PAGE_SIZE * size;
  const isReachingEnd = isEmpty || !isLastPageFull;
  const isRefreshing = isValidating && items && items.length === size;

  return {
    data: items ?? [],
    loading: loadingItems,
    mutate: mutateItems,
    size,
    setSize,
    isValidating,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    isRefreshing,
  };
}
