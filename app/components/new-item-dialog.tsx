"use client";

import { PlusIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { isTwitterPostOrBookmarkUrl, isValidUrl } from "@/lib/url";

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
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

export function NewItemDialog() {
  const [inputText, setInputText] = useState("");
  const { openNewItemDialog, setOpenNewItemDialog } = useGlobals();
  const { items, mutate } = useItems();

  useEffect(() => {
    if (!openNewItemDialog) {
      setInputText("");
    }
  }, [openNewItemDialog]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!inputText.trim()) {
        return;
      }
      if (!isValidUrl(inputText)) {
        return;
      }

      const toastMessage = isTwitterPostOrBookmarkUrl(inputText)
        ? "tweet"
        : "website";

      const saveItem = async () => {
        const response = await fetch("/api/item/save-item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: inputText,
          }),
        });

        if (!response.ok) {
          let errorMessage = "Failed to add the item";

          if (response.status === 409) {
            errorMessage = "Item already exists";
          } else {
            const responseText = await response.text();
            errorMessage = responseText || errorMessage;
          }

          toast.error(errorMessage);
          throw new Error(errorMessage);
        }

        const newItem = await response.json();

        mutate([newItem.item, ...items]);

        return newItem;
      };

      toast.promise(saveItem(), {
        loading: `Adding ${toastMessage}...`,
        success: `${
          toastMessage.charAt(0).toUpperCase() + toastMessage.slice(1)
        } added successfully`,
        // error: `Failed to add the ${toastMessage}`,
      });

      setInputText("");
      setOpenNewItemDialog(false);
    },
    [inputText, mutate, items, setOpenNewItemDialog],
  );

  return (
    <Dialog open={openNewItemDialog} onOpenChange={setOpenNewItemDialog}>
      <DialogTrigger asChild>
        <Button className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground ml-auto h-[30px] items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50">
          <PlusIcon className="mr-1 h-4 w-4" />
          New item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
          <DialogDescription>
            Add a website or a tweet you want to keep track of
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="pb-6">
            <Input
              placeholder="https://coolection.co"
              value={inputText}
              onChange={handleInputChange}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground ml-auto w-fit items-center justify-center whitespace-nowrap rounded-md border bg-white/80 px-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
              type="submit"
              disabled={!inputText.trim() || !isValidUrl(inputText)}
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
