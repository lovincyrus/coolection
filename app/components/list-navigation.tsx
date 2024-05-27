"use client";

import { ListPlusIcon } from "lucide-react";
import { Link } from "next-view-transitions";
import React from "react";

import { useLists } from "../hooks/use-lists";
import { useGlobals } from "./provider/globals-provider";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export default function ListNavigation() {
  const { data: lists } = useLists();
  const { setOpenNewListDialog } = useGlobals();

  return (
    <div className="relative">
      <ScrollArea className="max-w-2xl lg:max-w-none">
        <div className="flex items-center gap-x-1">
          {lists.map((list) => (
            <Link key={list.name} href={`/lists/${list.id}`}>
              <Button className="flex h-6 select-none items-center justify-center rounded-full bg-gray-100 px-3 text-center text-xs font-medium hover:bg-gray-200">
                {list.name}
              </Button>
            </Link>
          ))}
          <Button
            className="flex h-6 select-none items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 px-3 text-center text-xs font-medium hover:bg-transparent"
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
