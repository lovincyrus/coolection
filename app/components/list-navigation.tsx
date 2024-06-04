"use client";

import { ListPlusIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import React from "react";

import { useLists } from "../hooks/use-lists";
import { useGlobals } from "./provider/globals-provider";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export default function ListNavigation(listsServerData: any) {
  const { data: lists } = useLists(listsServerData);
  const { setOpenNewListDialog } = useGlobals();

  return (
    <div className="relative">
      <ScrollArea className="max-w-2xl lg:max-w-none">
        {/* p-1 is to make focus ring visible */}
        <div className="flex items-center gap-x-1 p-1">
          {Array.isArray(lists) &&
            lists.map((list) => (
              <Link key={list.name} href={`/lists/${list.id}`} tabIndex={-1}>
                <Button className="flex h-6 select-none items-center justify-center rounded-full border bg-gray-100 px-3 text-center text-xs font-medium hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-1">
                  {list.name}
                </Button>
              </Link>
            ))}
          <Button
            className="flex h-6 select-none items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 px-3 text-center text-xs font-medium hover:bg-transparent focus-visible:outline-none focus-visible:ring-1"
            onClick={() => setOpenNewListDialog(true)}
          >
            <ListPlusIcon className="mr-1.5 h-3.5 w-3.5" />
            New List
          </Button>
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
