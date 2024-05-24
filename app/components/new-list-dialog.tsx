"use client";

import { FolderPlusIcon, XIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

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

  const [lists, setLists] = useState<string[]>([]);
  const [newList, setNewList] = useState("");

  console.log("listsData: ", listsData);

  useEffect(() => {
    if (currentItem) {
      setNewList("");
      setLists(listsData.map((l) => l.name));
    }
  }, [currentItem, setNewList, listsData]);

  // useEffect(() => {
  //   // TODO: move to swr hook
  //   const fetchLists = async () => {
  //     try {
  //       const response = await fetch(`/api/lists`);

  //       if (response.ok) {
  //         const lists = await response.json();
  //         setLists(lists.map((l) => l.name));
  //       } else {
  //         toast.error("Failed to fetch lists");
  //       }
  //     } catch (error) {
  //       toast.error("Failed to fetch lists");
  //     }
  //   };

  //   if (currentItem) {
  //     fetchLists();
  //   }
  // }, [currentItem]);

  const handleNewListChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewList(event.target.value);
    },
    [],
  );

  const handleRemoveList = useCallback(async (listNameToRemove: string) => {
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
      } else {
        toast.error("Failed to remove list");
      }
    } catch (error) {
      toast.error("Failed to remove list");
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const response = await fetch("/api/list/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          list_name: newList,
        }),
      });

      if (response.ok) {
        const newListData = await response.json();
        toast.success(newListData.message);
        setNewList("");
        setOpenNewListDialog(false);
      } else {
        toast.error("Failed to create list");
      }
    },
    [newList, setOpenNewListDialog],
  );

  return (
    <Dialog open={openNewListDialog} onOpenChange={setOpenNewListDialog}>
      <DialogTrigger asChild>
        <Button className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground ml-auto h-[30px] items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
          <FolderPlusIcon className="mr-1.5 h-4 w-4" />
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
                  value={newList}
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
              disabled={!newList}
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
