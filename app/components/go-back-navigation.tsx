"use client";

import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Link } from "next-view-transitions";
import React, { useCallback } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { cn } from "@/lib/utils";

import { useLists } from "../hooks/use-lists";
import { Button } from "./ui/button";

export function GoBackNavigation({ listId }: { listId: string }) {
  const { data: lists } = useLists();
  const { mutate } = useSWRConfig();
  const { replace } = useRouter();

  function getList(listId: string) {
    const list = lists.find((list) => list.id === listId);
    return list;
  }

  const handleRemoveList = useCallback(
    async (listId: string) => {
      try {
        const response = await fetch("/api/list/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            list_id: listId,
          }),
        });

        if (response.ok) {
          mutate("/api/lists");
        } else {
          toast.error("Failed to remove list");
        }
      } catch (error) {
        toast.error("Failed to remove list");
      }
    },
    [mutate],
  );

  return (
    <div className="relative">
      <div className="mb-4 flex flex-row items-center justify-between gap-x-1">
        <div className="flex flex-row items-center gap-x-1">
          <Link href="/home">
            <Button className="flex h-6 items-center justify-center rounded-full bg-gray-900 px-3 text-center text-xs font-medium text-white shadow-sm hover:bg-gray-700">
              <ArrowLeftIcon className="mr-1.5 h-3.5 w-3.5" />
              Go back
            </Button>
          </Link>

          <ChevronRightIcon className="h-3.5 w-3.5 text-gray-400" />

          {listId && (
            <Button
              className={cn(
                "pointer-events-none flex h-6 select-none items-center justify-center rounded-full border bg-gray-50 px-3 text-center text-xs font-medium shadow-sm",
              )}
            >
              {getList(listId)?.name}
            </Button>
          )}
        </div>
        <div className="flex flex-row items-center gap-x-1">
          <Button
            className="flex h-6 select-none items-center justify-center rounded-full border bg-gray-50 px-3 text-center text-xs font-medium shadow-sm"
            onClick={() => {
              handleRemoveList(String(getList(listId)?.id));
              replace("/home");
            }}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
