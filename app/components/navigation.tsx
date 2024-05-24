"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";

import { useLists } from "../hooks/use-lists";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Navigation({ className, ...props }: NavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const { data: lists } = useLists();

  const handleListClick = (listId: string) => {
    const params = new URLSearchParams(searchParams);
    if (listId) {
      params.set("list", listId);
    } else {
      params.delete("list");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("mb-4 flex items-center", className)} {...props}>
          {lists.map((list) => (
            <button
              onClick={() => handleListClick(list.id)}
              key={list.name}
              className={cn(
                "hover:text-primary flex h-7 items-center justify-center rounded-full px-4 text-center text-sm",
                searchParams.get("list") === list.id
                  ? "font-semibold"
                  : "text-muted-foreground",
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
