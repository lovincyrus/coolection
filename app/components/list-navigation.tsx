"use client";

import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

import { useLists } from "../hooks/use-lists";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

export function ListNavigation() {
  const { data: lists } = useLists();

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("mb-4 flex items-center gap-x-1")}>
          {lists.map((list) => (
            <Link key={list.name} href={`/lists/${list.id}`}>
              <Button
                className={cn(
                  "flex h-6 items-center justify-center rounded-full bg-gray-100 px-3 text-center text-xs font-medium hover:bg-gray-200",
                )}
              >
                {list.name}
              </Button>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
