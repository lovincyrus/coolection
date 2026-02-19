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

// See: https://github.com/vercel/swr/issues/2702
export function usePaginatedItems(itemsServerData: any) {
  const {
    data: items,
    mutate: mutateItems,
    size,
    setSize,
    isValidating,
    isLoading: loadingItems,
    error,
  } = useSWRInfinite(getKey, fetcher, {
    // See: https://swr.vercel.app/docs/pagination#parameters
    initialSize: 1,
    parallel: true,
    suspense: true,
    fallbackData: itemsServerData,
    onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
      // Never retry on 404.
      if (error.status === 404) return;

      // Only retry up to 3 times.
      if (retryCount >= 3) return;

      // Retry after 5 seconds.
      setTimeout(() => revalidate({ retryCount }), 5_000);
    },
  });

  const isLoadingMore =
    loadingItems ||
    (size > 0 && items && typeof items[size - 1] === "undefined");
  const isEmpty = items?.[0]?.length === 0;
  const lastPage = items && items[items.length - 1];
  const totalItemsRetrieved = (Array.isArray(items) ? [].concat(...items) : [])
    .length;

  // FIXME: lastPage?.length will become undefined after archiving an item
  const isFinished = lastPage?.length < DEFAULT_PAGE_SIZE;
  const isRefreshing = isValidating && items && items.length === size;

  return {
    data: Array.isArray(items) ? items : [],
    loading: loadingItems,
    mutate: mutateItems,
    size,
    setSize,
    isValidating,
    isLoadingMore,
    isEmpty,
    isFinished,
    isRefreshing,
    totalItemsRetrieved,
    error,
  };
}
