"use client";

import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

import { useItems } from "../hooks/use-items";
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
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export function EditItemDialog() {
  const { openEditItemDialog, setOpenEditItemDialog, currentItem } =
    useGlobals();
  const { mutate: mutateItems } = useItems();

  const [title, setTitle] = useState(currentItem?.title ?? "");
  const [description, setDescription] = useState(
    currentItem?.description ?? "",
  );

  const searchParams = useSearchParams();
  const querySearchParam = searchParams.get("q")?.toString() ?? "";

  useEffect(() => {
    if (currentItem && !openEditItemDialog) {
      setTitle(currentItem.title ?? "");
      setDescription(currentItem.description ?? "");
    }
  }, [openEditItemDialog, currentItem]);

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(event.target.value);
    },
    [],
  );

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(event.target.value);
    },
    [],
  );

  const haveChanges =
    currentItem &&
    (title !== currentItem.title || description !== currentItem.description);

  const searchSwrKey = `/api/search?q=${querySearchParam}`;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!haveChanges) {
        toast.error("No changes detected");
        return;
      }

      const response = await fetch("/api/item/edit", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: currentItem.id,
          title: title,
          description: description,
        }),
      });

      if (response.ok) {
        setOpenEditItemDialog(false);
        mutate(searchSwrKey);
        mutateItems();
        toast.success("Item updated successfully");
      } else {
        toast.error("Failed to update item");
      }
    },
    [
      searchSwrKey,
      mutateItems,
      setOpenEditItemDialog,
      title,
      description,
      currentItem,
      haveChanges,
    ],
  );

  return (
    <Dialog open={openEditItemDialog} onOpenChange={setOpenEditItemDialog}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
          <DialogDescription>
            Update the title and description
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 pb-6 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Title"
                value={title}
                onChange={handleTitleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="resize-none"
                placeholder="Description"
                value={description}
                onChange={handleDescriptionChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground ml-auto w-fit items-center justify-center whitespace-nowrap rounded-md border bg-white/80 px-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
              type="submit"
              disabled={!haveChanges}
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}