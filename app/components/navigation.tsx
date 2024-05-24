"use client";

import { useRouter } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";

import { useLists } from "../hooks/use-lists";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Navigation({ className, ...props }: NavProps) {
  const router = useRouter();
  const { data: lists } = useLists();

  const handleListClick = (slug: string) => {
    router.push(`/lists/${slug}`);
  };

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div
          className={cn("mb-4 flex items-center gap-x-1", className)}
          {...props}
        >
          {lists.map((list) => (
            <button
              onClick={() => handleListClick(list.slug)}
              key={list.name}
              className={cn(
                "flex h-6 items-center justify-center rounded-full border bg-gray-50 px-3 text-center text-xs font-medium shadow-sm hover:bg-gray-100",
              )}
            >
              {list.name}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
