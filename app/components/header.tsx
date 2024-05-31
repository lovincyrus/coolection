"use client";

import { useClerk } from "@clerk/clerk-react";
import { LogOutIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import React from "react";

import { useLists } from "../hooks/use-lists";
import { NewItemDialog } from "./new-item-dialog";
import { NewListDialog } from "./new-list-dialog";
import { Button } from "./ui/button";

export function Header({
  heading,
  listId,
  listsServerData,
  itemsServerData,
}: {
  heading?: string;
  listId?: string;
  listsServerData?: any;
  itemsServerData?: any;
}) {
  const { signOut } = useClerk();
  const { data: lists } = useLists(listsServerData);

  function getListName(listId: string) {
    const list = lists.find((list) => list.id === listId);
    return list?.name;
  }

  return (
    <div className="mx-auto w-full max-w-2xl xl:max-w-4xl 2xl:max-w-6xl">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center space-x-1">
          <div className="flex h-8 w-8 items-center justify-center text-2xl">
            <Link href="/home">🍵</Link>
            <span className="sr-only">Coolection</span>
          </div>
          {heading && (
            <span className="ml-1 max-w-[120px] truncate text-xs font-medium text-gray-800">
              {heading}
            </span>
          )}
          {listId && (
            <span className="ml-1 max-w-[240px] truncate text-xs font-medium text-gray-800">
              {getListName(listId)}
            </span>
          )}
        </div>

        {!listId && (
          <div className="flex flex-row gap-1">
            <NewListDialog />
            <NewItemDialog itemsServerData={itemsServerData} />

            <Button
              className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground ml-auto h-[30px] items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => signOut()}
            >
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
