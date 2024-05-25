"use client";

import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

import { useLists } from "../hooks/use-lists";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export function HomeNavigation({ listId }: { listId?: string }) {
  const { data: lists } = useLists();

  function getListName(listId: string) {
    const list = lists.find((list) => list.id === listId);
    return list?.name;
  }

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("mb-4 flex items-center gap-x-1")}>
          {listId && (
            <Link href={`/home`}>
              <Button className="flex h-6 items-center justify-center rounded-full bg-gray-900 px-3 text-center text-xs font-medium text-white shadow-sm hover:bg-gray-700">
                <ArrowLeftIcon className="mr-1.5 h-3.5 w-3.5" />
                Go back
              </Button>
            </Link>
          )}
          <ChevronRightIcon className="h-3.5 w-3.5 text-gray-400" />
          <Button
            className={cn(
              "flex h-6 items-center justify-center rounded-full border bg-gray-50 px-3 text-center text-xs font-medium shadow-sm hover:bg-gray-100",
            )}
          >
            {getListName(listId ?? "")}
          </Button>
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
