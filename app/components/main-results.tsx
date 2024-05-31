"use client";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef } from "react";
import { unstable_serialize, useSWRConfig } from "swr";
import { useThrottledCallback } from "use-debounce";

import { useIsInList } from "../hooks/use-is-in-list";
import { useLists } from "../hooks/use-lists";
import { useLoadingWithTimeout } from "../hooks/use-loading-with-timeout";
import { getKey, usePaginatedItems } from "../hooks/use-paginated-items";
import { useSearchResults } from "../hooks/use-search-results";
import { Item } from "../types";
import { AnimatedListItem } from "./animated-list-item";
import { EditItemDialog } from "./edit-item-dialog";
import { useGlobals } from "./provider/globals-provider";
import { ResultItem } from "./result-item";
import { ResultItemSkeletons } from "./result-item-skeletons";
import { Button } from "./ui/button";

export default function MainResults(
  listsServerData: any,
  itemsServerData: any,
) {
  const isInList = useIsInList();
  const { mutate } = useSWRConfig();
  const searchParams = useSearchParams();
  const { data: lists } = useLists(listsServerData);
  const { setOpenNewItemDialog } = useGlobals();

  const {
    data,
    loading: loadingItems,
    mutate: mutateItems,
    setSize,
    isValidating,
    isFinished,
    isRefreshing,
    error,
  } = usePaginatedItems(itemsServerData);

  const loadMoreContainerRef = useRef<HTMLDivElement>(null);

  const isLoadingOrValidating = loadingItems || isValidating;

  const loadMore = useThrottledCallback(() => {
    if (!isFinished && !isLoadingOrValidating) {
      setSize((size) => size + 1);
    }
  }, 100);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: "0px", threshold: 1 },
    );

    const currentRef = loadMoreContainerRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore]);

  const querySearchParam = searchParams.get("q")?.toString() ?? "";

  const {
    data: searchResults,
    loading: searchingResults,
    mutate: mutateSearchResults,
  } = useSearchResults(querySearchParam);

  const items: Item[] = useMemo(
    () => (Array.isArray(data) ? [].concat(...data) : []),
    [data],
  );

  const results = querySearchParam.length > 0 ? searchResults : items;

  const isSearchingResultsWithTimeout = useLoadingWithTimeout(searchingResults);
  const showEmptyItemsCopy = useLoadingWithTimeout(
    !isInList &&
      querySearchParam.length === 0 &&
      Array.isArray(items) &&
      items.length === 0 &&
      !isLoadingOrValidating,
    300,
  );
  const showNoResults =
    !searchingResults &&
    querySearchParam.length > 0 &&
    (searchResults?.length ?? 0) === 0;
  const showLoadMore =
    !isFinished &&
    querySearchParam.length === 0 &&
    !isRefreshing &&
    !isLoadingOrValidating;

  const handleArchiveItem = (itemId: string) => {
    if (Array.isArray(searchResults)) {
      const updatedSearchResults = searchResults.filter(
        (item) => item.id !== itemId,
      );
      mutateSearchResults(updatedSearchResults, false);
    }

    if (Array.isArray(items)) {
      const updatedData = items.filter((item) => item.id !== itemId);
      mutateItems(updatedData, false);
    }

    mutate(unstable_serialize(getKey));
  };

  const EmptyState = () => (
    <p className="mt-4 text-center text-sm font-medium text-gray-700">
      You have no items in your coolection. Start by{" "}
      <span
        className="cursor-pointer text-sky-400 hover:underline"
        onClick={() => setOpenNewItemDialog(true)}
      >
        adding one
      </span>
      !
    </p>
  );

  const NoResultsState = () => (
    <div className="mt-4 flex w-full items-center justify-center">
      <p className="max-w-[80%] truncate text-center text-sm font-medium text-gray-700">
        No results for <q>{querySearchParam}</q>
      </p>
    </div>
  );

  return (
    <div>
      {showEmptyItemsCopy ? <EmptyState /> : null}
      {showNoResults ? <NoResultsState /> : null}
      {isLoadingOrValidating || isSearchingResultsWithTimeout ? (
        <ResultItemSkeletons />
      ) : null}

      {results && results.length > 0 ? (
        <AnimatePresence initial={false} key="results">
          {Array.isArray(results) &&
            results.map((item: Item) => (
              <AnimatedListItem key={item.id}>
                <ResultItem
                  item={item}
                  onArchive={handleArchiveItem}
                  lists={lists}
                />
              </AnimatedListItem>
            ))}
        </AnimatePresence>
      ) : null}

      <div className="h-4" />

      {showLoadMore && (
        <div ref={loadMoreContainerRef}>
          <Button
            className="h-[30px] w-full items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
            disabled={isLoadingOrValidating}
            onClick={() => (error ? mutateItems() : loadMore())}
          >
            {error
              ? "Try Again"
              : isLoadingOrValidating
                ? "Loading..."
                : "Load More"}
          </Button>
          <div className="h-8" />
        </div>
      )}

      <EditItemDialog itemsServerData={itemsServerData} />
    </div>
  );
}
