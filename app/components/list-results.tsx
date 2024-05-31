"use client";

import { AnimatePresence } from "framer-motion";
import React from "react";

import { useIsInList } from "../hooks/use-is-in-list";
import { useItemsFromList } from "../hooks/use-items-from-list";
import { useLists } from "../hooks/use-lists";
import { useLoadingWithTimeout } from "../hooks/use-loading-with-timeout";
import { Item } from "../types";
import { AnimatedListItem } from "./animated-list-item";
import { ResultItem } from "./result-item";
import { ResultItemSkeletons } from "./result-item-skeletons";

export function ListResults({
  listId,
  listsServerData,
}: {
  listId: string;
  listsServerData: any;
}) {
  const isInList = useIsInList();
  const { data: lists } = useLists(listsServerData);
  const {
    data: itemsFromList,
    loading,
    mutate: mutateItemsFromList,
  } = useItemsFromList(listId);

  const showEmptyListItemsCopy = useLoadingWithTimeout(
    isInList && Object.keys(itemsFromList).length === 0 && !loading,
    300,
  );

  return (
    <div className="mb-8">
      {showEmptyListItemsCopy ? (
        <div className="mt-4 flex min-h-48 w-full items-center justify-center">
          <p className="max-w-[80%] truncate text-center text-sm font-medium text-gray-700">
            There is nothing in this list yet.
          </p>
        </div>
      ) : null}

      {loading ? (
        <ResultItemSkeletons />
      ) : (
        <AnimatePresence initial={false}>
          {Array.isArray(itemsFromList) &&
            itemsFromList.map((item: Item) => (
              <AnimatedListItem key={item.id}>
                <ResultItem
                  item={item}
                  onRemove={() => {
                    mutateItemsFromList(
                      itemsFromList.filter((result) => result.id !== item.id),
                      false,
                    );
                  }}
                  lists={lists}
                  listId={listId}
                />
              </AnimatedListItem>
            ))}
        </AnimatePresence>
      )}
    </div>
  );
}
