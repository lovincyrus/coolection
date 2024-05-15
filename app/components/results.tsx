import { AnimatePresence } from "framer-motion";
import React, { useCallback } from "react";
import useSWR from "swr";

import { INITIAL_ITEMS_COUNT } from "@/lib/constants";
import { fetcher } from "@/lib/fetcher";

import { useItems } from "../hooks/use-items";
import { useLists } from "../hooks/use-lists";
import { useLoadingWithTimeout } from "../hooks/use-loading-with-timeout";
import { CoolectionItem } from "../types";
import { AnimatedListItem } from "./animated-list-item";
import { useGlobals } from "./provider/globals-provider";
import { ResultItem } from "./result-item";
import { Skeleton } from "./ui/skeleton";

function ResultItemSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, idx) => (
        <div className="flex flex-col rounded-lg py-4" key={idx}>
          <div className="flex flex-col gap-1 px-4">
            <Skeleton className="h-4 w-60" />
            <div className="flex flex-row items-center space-x-2">
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </>
  );
}

export function Results({ query }: { query: string }) {
  const { items, mutate, loading: loadingItems } = useItems();
  const { lists } = useLists();
  const { setOpenNewItemDialog } = useGlobals();

  // See: https://swr.vercel.app/docs/advanced/understanding#return-previous-data-for-better-ux
  const {
    data: searchResults,
    isLoading: searchingResults,
    mutate: mutateSearchResults,
  } = useSWR<CoolectionItem[]>(
    query ? `/api/search?q=${query}` : null,
    fetcher,
    {
      keepPreviousData: true,
    },
  );

  const isSearchingResultsWithTimeout = useLoadingWithTimeout(searchingResults);
  const showEmptyItemsCopy = useLoadingWithTimeout(
    query.length === 0 &&
      Array.isArray(items) &&
      items.length === 0 &&
      !loadingItems,
    300,
  );
  const showNoResults =
    query.length > 0 &&
    Array.isArray(searchResults) &&
    searchResults.length === 0;

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (Array.isArray(items)) {
        mutate(items.filter((item) => item.id !== itemId));
      }
      if (Array.isArray(searchResults)) {
        mutateSearchResults(
          searchResults.filter((item) => item.id !== itemId),
          false,
        );
      }
    },
    [items, mutate, mutateSearchResults, searchResults],
  );

  const results = query.length > 0 ? searchResults : items;

  return (
    <div className="mb-8 w-full">
      <AnimatePresence initial={false}>
        {showEmptyItemsCopy ? (
          <p className="mt-4 text-center text-sm font-medium text-gray-700">
            You have no items in your coolection. Start by{" "}
            <span
              className="cursor-pointer text-sky-400 hover:underline"
              onClick={() => setOpenNewItemDialog(true)}
            >
              adding some
            </span>
            !
          </p>
        ) : null}

        {showNoResults ? (
          <p className="mt-4 text-center text-sm font-medium text-gray-700">
            No results for <q className="truncate">{query}</q>
          </p>
        ) : null}

        {loadingItems || isSearchingResultsWithTimeout ? (
          <ResultItemSkeletons count={INITIAL_ITEMS_COUNT} />
        ) : (
          <>
            {Array.isArray(results) &&
              results.map((item: CoolectionItem) => (
                <AnimatedListItem key={item.id}>
                  <ResultItem
                    key={item.id}
                    item={item}
                    onRemoveItem={handleRemoveItem}
                    lists={lists}
                  />
                </AnimatedListItem>
              ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
