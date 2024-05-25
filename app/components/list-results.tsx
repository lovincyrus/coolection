"use client";

import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import { unstable_serialize, useSWRConfig } from "swr";

import { useIsInList } from "../hooks/use-is-in-list";
import { useItemsFromList } from "../hooks/use-items-from-list";
import { useLists } from "../hooks/use-lists";
import { useLoadingWithTimeout } from "../hooks/use-loading-with-timeout";
import { getKey, usePaginatedItems } from "../hooks/use-paginated-items";
import { useSearchResults } from "../hooks/use-search-results";
import { CoolectionItem } from "../types";
import { AnimatedListItem } from "./animated-list-item";
import { EditItemDialog } from "./edit-item-dialog";
import { ResultItem } from "./result-item";

export function ListResults({ listId }: { listId?: string }) {
  const searchParams = useSearchParams();
  const {
    data,
    mutate: mutateItems,
    size,
    setSize,
    isLoadingMore,
    isReachingEnd,
    loading: loadingItems,
  } = usePaginatedItems();
  const isInList = useIsInList();

  const { mutate } = useSWRConfig();

  const { data: lists } = useLists();

  const currentList = lists?.find((list) => list.id === listId);
  console.log("currentList: ", currentList);

  const querySearchParam = searchParams.get("q")?.toString() ?? "";

  const { data: itemsFromList } = useItemsFromList(listId ? listId : "");

  const {
    data: searchResults,
    loading: searchingResults,
    mutate: mutateSearchResults,
  } = useSearchResults(querySearchParam);

  const items = useMemo(() => (data ? [].concat(...data) : []), [data]);

  const results = itemsFromList;

  const showEmptyListItemsCopy = useLoadingWithTimeout(
    !isInList && Object.keys(itemsFromList).length === 0,
    300,
  );

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
    <div className="mb-8">
      <AnimatePresence initial={false}>
        {showEmptyListItemsCopy ? (
          <div className="mt-4 flex w-full justify-center">
            <p className="max-w-[80%] truncate text-center text-sm font-medium text-gray-700">
              There is nothing in this list yet.
            </p>
          </div>
        ) : null}

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
      </AnimatePresence>

      <EditItemDialog />
    </div>
  );
}
