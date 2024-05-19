import { AnimatePresence } from "framer-motion";
import React, { useCallback, useEffect, useMemo } from "react";
import { unstable_serialize, useSWRConfig } from "swr";

import { INITIAL_ITEMS_COUNT } from "@/lib/constants";

import { getKey, useItems } from "../hooks/use-items";
import { useLists } from "../hooks/use-lists";
import { useLoadingWithTimeout } from "../hooks/use-loading-with-timeout";
import { useSearchResults } from "../hooks/use-search-results";
import { CoolectionItem } from "../types";
import { AnimatedListItem } from "./animated-list-item";
import { EditItemDialog } from "./edit-item-dialog";
import { useGlobals } from "./provider/globals-provider";
import { ResultItem } from "./result-item";
import { ResultItemSkeletons } from "./result-item-skeletons";
import { Button } from "./ui/button";

export default function Results({ query }: { query: string }) {
  const {
    data,
    mutate: mutateItems,
    size,
    setSize,
    isValidating,
    loading: loadingItems,
  } = useItems();

  const { mutate } = useSWRConfig();
  const { data: lists } = useLists();
  const { setOpenNewItemDialog } = useGlobals();

  const {
    data: searchResults,
    loading: searchingResults,
    mutate: mutateSearchResults,
  } = useSearchResults(query);

  const items = useMemo(() => (data ? [].concat(...data) : []), [data]);

  const itemsOrSearchResults = query.length > 0 ? searchResults : items;

  useEffect(() => {
    if (Array.isArray(itemsOrSearchResults)) {
      document.title = `Home · Coolection (${itemsOrSearchResults.length})`;
    }
  }, [itemsOrSearchResults]);

  const isSearchingResultsWithTimeout = useLoadingWithTimeout(searchingResults);
  const showEmptyItemsCopy = useLoadingWithTimeout(
    query.length === 0 &&
      Array.isArray(items) &&
      items.length === 0 &&
      !loadingItems,
    300,
  );
  const showNoResults =
    !searchingResults &&
    query.length > 0 &&
    Array.isArray(searchResults) &&
    searchResults.length === 0;

  const handleArchiveItem = useCallback(
    (itemId: string) => {
      if (Array.isArray(searchResults)) {
        mutateSearchResults(
          searchResults.filter((item) => item.id !== itemId),
          false,
        );
      }
      if (Array.isArray(items)) {
        mutateItems(
          (items as CoolectionItem[]).filter((item) => item?.id !== itemId),
          false,
        );
      }

      mutate(unstable_serialize(getKey));
    },
    [searchResults, mutateSearchResults, mutateItems, mutate, items],
  );

  const isLoadingMore =
    searchingResults ||
    (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < INITIAL_ITEMS_COUNT);
  const _isRefreshing = isValidating && data && data.length === size;

  return (
    <>
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
          <div className="mt-4 flex w-full justify-center">
            <p className="max-w-[80%] truncate text-center text-sm font-medium text-gray-700">
              No results for <q>{query}</q>
            </p>
          </div>
        ) : null}

        {loadingItems || isSearchingResultsWithTimeout ? (
          <ResultItemSkeletons count={INITIAL_ITEMS_COUNT} />
        ) : (
          <>
            {Array.isArray(itemsOrSearchResults) &&
              itemsOrSearchResults.map((item: CoolectionItem) => (
                <AnimatedListItem key={item.id}>
                  <ResultItem
                    item={item}
                    onArchive={handleArchiveItem}
                    lists={lists}
                  />
                </AnimatedListItem>
              ))}
          </>
        )}
      </AnimatePresence>

      {!isReachingEnd && !query && !showNoResults && (
        <Button
          disabled={isLoadingMore || isReachingEnd}
          onClick={() => setSize(size + 1)}
          className="mt-4 w-full border"
        >
          {isLoadingMore ? "Loading..." : "Load more"}
        </Button>
      )}

      <EditItemDialog />
    </>
  );
}
