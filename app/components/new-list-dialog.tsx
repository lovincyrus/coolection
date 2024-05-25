"use client";

import { ListPlusIcon, XIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { useLists } from "../hooks/use-lists";
import { useGlobals } from "./provider/globals-provider";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

export function NewListDialog() {
  const { openNewListDialog, setOpenNewListDialog, currentItem } = useGlobals();
  const { data: listsData } = useLists();
  const { mutate } = useSWRConfig();

  const [lists, setLists] = useState<string[]>([]);
  const [listName, setListName] = useState("");

  useEffect(() => {
    if (currentItem) {
      setListName("");
      setLists(listsData.map((l) => l.name));
    }
  }, [currentItem, setListName, listsData]);

  const handleNewListChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setListName(event.target.value);
    },
    [],
  );

  const handleRemoveList = useCallback(
    async (listNameToRemove: string) => {
      try {
        const response = await fetch("/api/list/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            list_name: listNameToRemove,
          }),
        });

        if (response.ok) {
          setLists((prevLists) =>
            prevLists.filter((list) => list !== listNameToRemove),
          );

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

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

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
        setLists((prevLists) => [...prevLists, listName]);
        mutate("/api/lists");
        setListName("");
        setOpenNewListDialog(false);
      } else {
        toast.error("Failed to create list");
      }
    },
    [listName, setOpenNewListDialog, mutate],
  );

  return (
    <Dialog open={openNewListDialog} onOpenChange={setOpenNewListDialog}>
      <DialogTrigger asChild>
        <Button className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground ml-auto h-[30px] items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
          <ListPlusIcon className="mr-1.5 h-4 w-4" />
          New List
        </Button>
      </DialogTrigger>
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
                  placeholder="New list"
                  value={listName}
                  onChange={handleNewListChange}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {lists.map((tag) => (
                  <span
                    key={tag}
                    className="flex select-none items-center gap-1 rounded bg-gray-200 px-2 py-1 text-xs"
                  >
                    {tag}
                    <XIcon size={12} onClick={() => handleRemoveList(tag)} />
                  </span>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground ml-auto w-fit items-center justify-center whitespace-nowrap rounded-md border bg-white/80 px-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
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
