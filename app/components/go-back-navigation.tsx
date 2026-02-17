"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Link } from "next-view-transitions";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { useLists } from "../hooks/use-lists";
import { EditableText } from "./editable-text";
import { Spinner } from "./icon-spinner";
import { Button } from "./ui/button";

type ButtonCopyState = "default" | "confirmation" | "loading";
const buttonCopy = {
  default: "Remove",
  confirmation: "Are you sure?",
  loading: <Spinner size={16} color="var(--color-spinner)" />,
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
        }
      } catch (error) {
        toast.error("Failed to remove list");
      }
    },
    [mutate, cache],
  );

  const handleEditName = useCallback(
    async (listId: string, newName: string) => {
      try {
        await fetch("/api/list/edit", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            list_id: listId,
            name: newName,
          }),
        });

        mutate("/api/lists");
      } catch (error) {
        toast.error("Failed to update list name");
      }
    },
    [mutate],
  );

  return (
    <div className="relative">
      <div className="mb-4 flex flex-row items-center justify-between gap-x-1">
        {/* p-1 is to make focus ring visible */}
        <div className="flex flex-row items-center gap-x-1 p-1">
          <Link href="/home" tabIndex={-1}>
            <Button className="flex h-6 select-none items-center justify-center rounded-full bg-inverted px-3 text-center text-xs font-medium text-text-inverted shadow-sm hover:opacity-90">
              <ArrowLeftIcon className="mr-1.5 h-3.5 w-3.5" />
              Go back
            </Button>
          </Link>

          <ChevronRightIcon className="h-3.5 w-3.5 text-text-quaternary" />

          {listId && (
            <EditableText
              fieldName="listName"
              value={String(getList(listId)?.name)}
              inputLabel="List name"
              buttonLabel="Edit list name"
              onSubmit={(newValue) => {
                const list = getList(listId);
                if (list) {
                  handleEditName(list.id, newValue);
                }
              }}
            />
          )}
        </div>
        <div className="hidden flex-row items-center gap-x-1 md:flex">
          <Button
            className="relative flex h-6 select-none items-center justify-center overflow-hidden rounded-full border bg-surface px-3 text-center text-xs font-medium hover:bg-surface-hover"
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
