import { AnimatePresence } from "framer-motion";
import React, { useCallback, useMemo } from "react";
import { unstable_serialize, useSWRConfig } from "swr";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

import { useLists } from "../hooks/use-lists";
import { useLoadingWithTimeout } from "../hooks/use-loading-with-timeout";
import { getKey, usePaginatedItems } from "../hooks/use-paginated-items";
import { useSearchResults } from "../hooks/use-search-results";
import { CoolectionItem } from "../types";
import { AnimatedListItem } from "./animated-list-item";
import { EditItemDialog } from "./edit-item-dialog";
import { useGlobals } from "./provider/globals-provider";
import { ResultItem } from "./result-item";
import { ResultItemSkeletons } from "./result-item-skeletons";
import { Button } from "./ui/button";

export function Results({ query }: { query: string }) {
  const {
    data,
    mutate: mutateItems,
    size,
    setSize,
    isLoadingMore,
    isReachingEnd,
    loading: loadingItems,
  } = usePaginatedItems();

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

  // TODO: revisit
  // useEffect(() => {
  //   if (Array.isArray(itemsOrSearchResults)) {
  //     document.title = `Home · Coolection (${itemsOrSearchResults.length})`;
  //   }
  // }, [itemsOrSearchResults]);

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
        const updatedSearchResults = searchResults.filter(
          (item) => item.id !== itemId,
        );
        mutateSearchResults(updatedSearchResults, false);
      }

      if (Array.isArray(items)) {
        const updatedData = (items as CoolectionItem[]).filter(
          (item) => item.id !== itemId,
        );
        mutateItems(updatedData, false);
      }

      mutate(unstable_serialize(getKey));
    },
    [searchResults, mutateSearchResults, mutate, items, mutateItems],
  );

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
          <ResultItemSkeletons count={DEFAULT_PAGE_SIZE} />
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

      {!isReachingEnd && !query && (
        <Button
          className="mt-4 h-[30px] w-full items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
          disabled={isLoadingMore || isReachingEnd}
          onClick={() => {
            setSize(size + 1);
          }}
        >
          {isLoadingMore ? "Loading..." : "Load More"}
        </Button>
      )}

      <EditItemDialog />
    </>
  );
}
