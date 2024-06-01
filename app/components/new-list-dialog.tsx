"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { useGlobals } from "./provider/globals-provider";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";

export function NewListDialog() {
  const { openNewListDialog, setOpenNewListDialog } = useGlobals();
  const { mutate } = useSWRConfig();

  const [listName, setListName] = useState("");

  useEffect(() => {
    if (openNewListDialog) {
      setListName("");
    }
  }, [openNewListDialog, setListName]);

  const handleNewListChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setListName(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const response = await fetch("/api/list/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            list_name: listName,
          }),
        });

        if (response.ok) {
          const newListData = await response.json();
          toast.success(newListData.message);
          mutate("/api/lists");
          setListName("");
          setOpenNewListDialog(false);
        } else {
          toast.error("Failed to create list");
        }
      } catch (error) {
        toast.error("Failed to create list");
      }
    },
    [listName, setOpenNewListDialog, mutate],
  );

  return (
    <Dialog open={openNewListDialog} onOpenChange={setOpenNewListDialog}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New list</DialogTitle>
          <DialogDescription>
            Create a new list to organize your items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 pb-6 pt-2">
            <div className="grid gap-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="My Favorites"
                  value={listName}
                  onChange={handleNewListChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className=" border-input bg-background hover:bg-accent hover:text-accent-foreground ml-auto w-fit items-center justify-center whitespace-nowrap rounded-md border bg-white/80 px-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
              type="submit"
              disabled={!listName}
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
