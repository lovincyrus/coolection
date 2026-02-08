"use client";

import { useClerk } from "@clerk/clerk-react";
import { LogOutIcon, PanelLeftIcon, SettingsIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import React from "react";

import { useLists } from "../hooks/use-lists";
import { NewItemDialog } from "./new-item-dialog";
import { NewListDialog } from "./new-list-dialog";
import { useGlobals } from "./provider/globals-provider";
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
  const { sidebarOpen, setSidebarOpen } = useGlobals();

  function getListName(listId: string) {
    const list = lists.find((list) => list.id === listId);
    return list?.name;
  }

  return (
    <div className="mx-auto w-full max-w-2xl xl:max-w-4xl 2xl:max-w-6xl">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center space-x-1">
          <Button
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground h-[30px] items-center justify-center whitespace-nowrap rounded-lg border bg-white px-2 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <PanelLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center">
            <Link href="/home">
              <img
                src="/favicon.ico"
                alt="Coolection"
                className="h-5 w-5"
              />
            </Link>
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

            <Link href="/settings">
              <Button className="border-input bg-background hover:bg-accent hover:text-accent-foreground h-[30px] items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              className="border-input bg-background hover:bg-accent hover:text-accent-foreground h-[30px] items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
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
