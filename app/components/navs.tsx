"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";

import { useLists } from "../hooks/use-lists";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface ExamplesNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ExamplesNav({ className, ...props }: ExamplesNavProps) {
  const pathname = usePathname();
  const { lists } = useLists();
  const router = useRouter();

  const handleListClick = (listId: string) => {
    router.push(`/lists/${listId}`);
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
                "hover:text-primary flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors",
                pathname.includes(list.name.toLowerCase().replace(/\s+/g, "-"))
                  ? "bg-muted text-primary font-medium"
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
