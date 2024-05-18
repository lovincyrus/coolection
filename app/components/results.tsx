import { AnimatePresence } from "framer-motion";
import React, { useCallback } from "react";

import { INITIAL_ITEMS_COUNT } from "@/lib/constants";

import { useItems } from "../hooks/use-items";
import { useLists } from "../hooks/use-lists";
import { useLoadingWithTimeout } from "../hooks/use-loading-with-timeout";
import { useSearchResults } from "../hooks/use-search-results";
import { CoolectionItem } from "../types";
import { AnimatedListItem } from "./animated-list-item";
import { EditItemDialog } from "./edit-item-dialog";
import { useGlobals } from "./provider/globals-provider";
import { ResultItem } from "./result-item";
import { ResultItemSkeletons } from "./result-item-skeletons";

export default function Results({ query }: { query: string }) {
  const {
    data: items,
    loading: loadingItems,
    mutate: mutateItems,
  } = useItems();
  const { data: lists } = useLists();
  const { setOpenNewItemDialog } = useGlobals();

  const {
    data: searchResults,
    loading: searchingResults,
    mutate: mutateSearchResults,
  } = useSearchResults(query);

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
          items.filter((item) => item.id !== itemId),
          false,
        );
      }
    },
    [searchResults, mutateSearchResults, items, mutateItems],
  );

  const results = query.length > 0 ? searchResults : items;

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
            {Array.isArray(results) &&
              results.map((item: CoolectionItem) => (
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

      <EditItemDialog />
    </>
  );
}
