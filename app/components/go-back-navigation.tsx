"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Link } from "next-view-transitions";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { cn } from "@/lib/utils";

import { useLists } from "../hooks/use-lists";
import { Spinner } from "./icon-spinner";
import { Button } from "./ui/button";

type ButtonCopyState = "default" | "confirmation" | "loading";
const buttonCopy = {
  default: "Remove",
  confirmation: "Are you sure?",
  loading: <Spinner size={16} color="rgba(0, 0, 0, 0.85)" />,
};

export function GoBackNavigation({
  listId,
  listsServerData,
}: {
  listId: string;
  listsServerData: any;
}) {
  const { data: lists } = useLists(listsServerData);
  const { mutate, cache } = useSWRConfig();
  const { replace } = useRouter();

  const [areYouSure, setAreYouSure] = useState(false);
  const [buttonState, setButtonState] = useState("default");

  // JIC users change their mind
  useEffect(() => {
    if (areYouSure) {
      const timeout = setTimeout(() => {
        setAreYouSure(false);
        setButtonState("default");
      }, 5_000);

      return () => clearTimeout(timeout);
    }
  }, [areYouSure]);

  function getList(listId: string) {
    const list = lists.find((list) => list.id === listId);
    return list;
  }

  const handleRemoveList = useCallback(
    async (listId: string) => {
      try {
        const response = await fetch("/api/list/delete", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            list_id: listId,
          }),
        });

        if (response.ok) {
          mutate("/api/lists");
          cache.delete(`/api/lists/${listId}/items`);
          toast.success("List removed successfully");
        } else {
          toast.error("Failed to remove list");
        }
      } catch (error) {
        toast.error("Failed to remove list");
      }
    },
    [mutate, cache],
  );

  return (
    <div className="relative">
      <div className="mb-4 flex flex-row items-center justify-between gap-x-1">
        <div className="flex flex-row items-center gap-x-1">
          <Link href="/home">
            <Button className="flex h-6 select-none items-center justify-center rounded-full bg-gray-900 px-3 text-center text-xs font-medium text-white shadow-sm hover:bg-gray-700">
              <ArrowLeftIcon className="mr-1.5 h-3.5 w-3.5" />
              Go back
            </Button>
          </Link>

          <ChevronRightIcon className="h-3.5 w-3.5 text-gray-400" />

          {listId && (
            <Button
              className={cn(
                "pointer-events-none flex h-6 max-w-[200px] select-none items-center justify-center truncate rounded-full border bg-gray-50 px-3 text-center text-xs font-medium shadow-sm md:max-w-none",
              )}
            >
              {getList(listId)?.name}
            </Button>
          )}
        </div>
        <div className="hidden flex-row items-center gap-x-1 md:flex">
          <Button
            className="relative flex h-6 select-none items-center justify-center overflow-hidden rounded-full border bg-gray-50 px-3 text-center text-xs font-medium shadow-sm"
            disabled={buttonState === "loading"}
            onClick={() => {
              setButtonState("loading");

              if (areYouSure) {
                setTimeout(() => {
                  handleRemoveList(String(getList(listId)?.id));
                  replace("/home");
                }, 1750);
              } else {
                setAreYouSure(true);
                setButtonState("confirmation");
              }
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                initial={{ opacity: 0, y: -25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 25 }}
                key={buttonState}
              >
                {buttonCopy[buttonState as ButtonCopyState]}
              </motion.span>
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}
