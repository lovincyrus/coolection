"use client";

import { AnimatePresence } from "framer-motion";
import React from "react";

import { useIsInList } from "../hooks/use-is-in-list";
import { useItemsFromList } from "../hooks/use-items-from-list";
import { useLists } from "../hooks/use-lists";
import { useLoadingWithTimeout } from "../hooks/use-loading-with-timeout";
import { CoolectionItem } from "../types";
import { AnimatedListItem } from "./animated-list-item";
import { EditItemDialog } from "./edit-item-dialog";
import { ResultItem } from "./result-item";

export function ListResults({ listId }: { listId?: string }) {
  const isInList = useIsInList();
  const { data: lists } = useLists();
  const { data: itemsFromList, mutate: mutateItemsFromList } = useItemsFromList(
    listId ?? "",
  );

  const showEmptyListItemsCopy = useLoadingWithTimeout(
    isInList && Object.keys(itemsFromList).length === 0,
    300,
  );

  return (
    <div className="mb-8">
      <AnimatePresence initial={false}>
        {showEmptyListItemsCopy ? (
          <div className="mt-4 flex min-h-48 w-full items-center justify-center">
            <p className="max-w-[80%] truncate text-center text-sm font-medium text-gray-700">
              There is nothing in this list yet
            </p>
          </div>
        ) : null}

        {Array.isArray(itemsFromList) &&
          itemsFromList.map((item: CoolectionItem) => (
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

      <EditItemDialog />
    </div>
  );
}
