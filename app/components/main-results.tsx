"use client";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useScroll,
} from "framer-motion";
import { CircleArrowUpIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { unstable_serialize, useSWRConfig } from "swr";

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

export default function MainResults({
  listsServerData,
  itemsServerData,
}: {
  listsServerData: any;
  itemsServerData: any;
}) {
  const isInList = useIsInList();
  const { mutate } = useSWRConfig();
  const searchParams = useSearchParams();
  const { data: lists } = useLists(listsServerData);
  const { setOpenNewItemDialog } = useGlobals();
  const { scrollYProgress } = useScroll();

  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const isLoadingOrValidating = loadingItems || isValidating;

  const loadMore = useCallback(() => {
    if (!isFinished && !isLoadingOrValidating) {
      setSize((size) => size + 1);
    }
  }, [isFinished, isLoadingOrValidating, setSize]);

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
      !isLoadingOrValidating &&
      !isValidating &&
      !error,
    300,
  );
  const showNoResults =
    !searchingResults &&
    querySearchParam.length > 0 &&
    Array.isArray(searchResults) &&
    searchResults.length === 0;
  const showLoadMore =
    !isFinished && !querySearchParam && !isRefreshing && (!!error || !isLoadingOrValidating);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latestValue) => {
      setShowScrollTop((prev) => {
        const next = latestValue > 0.2;
        return prev === next ? prev : next;
      });
    });

    return () => {
      unsubscribe();
    };
  }, [scrollYProgress]);

  const handleArchiveItem = useCallback(
    (itemId: string) => {
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
    },
    [searchResults, mutateSearchResults, items, mutateItems, mutate],
  );

  return (
    <LazyMotion features={domAnimation}>
      <div>
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
          <div className="mt-4 flex w-full items-center justify-center">
            <p className="max-w-[80%] truncate text-center text-sm font-medium text-gray-700">
              No results for <q>{querySearchParam}</q>
            </p>
          </div>
        ) : null}

        {loadingItems || isSearchingResultsWithTimeout ? (
          <ResultItemSkeletons />
        ) : null}

        {results && results.length > 0 ? (
          <AnimatePresence initial={false} mode="popLayout" key="results">
            {Array.isArray(results) &&
              results.map((item: Item, idx: number) => {
                return (
                  <AnimatedListItem key={item.id}>
                    <ResultItem
                      item={item}
                      onArchive={handleArchiveItem}
                      lists={lists}
                      isLastItem={idx === results.length - 1}
                      onLoadMore={
                        idx === results.length - 1 &&
                        querySearchParam.length === 0
                          ? loadMore
                          : undefined
                      }
                    />
                  </AnimatedListItem>
                );
              })}
          </AnimatePresence>
        ) : null}

        <div className="h-4" />

        {showLoadMore && (
          <div>
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

        <AnimatePresence>
          {showScrollTop && !isInList && (
            <m.div
              key="scroll-top"
              className="fixed bottom-3 right-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 300,
                damping: 100,
              }}
              whileHover={{
                scale: 1.1,
                transition: {
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1],
                  stiffness: 300,
                },
              }}
            >
              <CircleArrowUpIcon
                strokeWidth={1.5}
                className="h-6 w-6 cursor-pointer rounded-full text-gray-500 drop-shadow backdrop-blur-sm"
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              />
            </m.div>
          )}
        </AnimatePresence>

        <EditItemDialog itemsServerData={itemsServerData} />
      </div>
    </LazyMotion>
  );
}
