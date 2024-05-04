"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { CoolectionList } from "../types/coolection";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

const useFetchLists = () => {
  const [lists, setLists] = useState<CoolectionList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/lists")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(setLists)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { lists, loading, error };
};

interface ExamplesNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ExamplesNav({ className, ...props }: ExamplesNavProps) {
  const pathname = usePathname();
  const { lists, loading, error } = useFetchLists();
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
                "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                pathname.includes(list.name.toLowerCase().replace(/\s+/g, "-"))
                  ? "bg-muted font-medium text-primary"
                  : "text-muted-foreground"
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

export function Header() {
  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <div className="flex items-center justify-center w-5 h-5">🍵</div>
        <div className="text-gray-500">Coolection</div>
      </div>
      {/* <ExamplesNav className="mt-4" /> */}
    </>
  );
}
