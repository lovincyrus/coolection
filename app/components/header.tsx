"use client";

import { PlusIcon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

import { isTwitterUrl, isValidUrl } from "@/lib/url";

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

export function Header() {
  const [inputText, setInputText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault(); // Prevent the default form submission behavior
      if (!inputText.trim()) {
        return;
      }
      if (!isValidUrl(inputText)) {
        return;
      }

      const toastMessage = isTwitterUrl(inputText) ? "tweet" : "website";

      const saveItem = async () => {
        const response = await fetch("/api/save-item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: inputText,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to add the ${toastMessage}`);
        }
        return response.json();
      };

      toast.promise(saveItem(), {
        loading: `Adding ${toastMessage}...`,
        success: `${
          toastMessage.charAt(0).toUpperCase() + toastMessage.slice(1)
        } added successfully`,
        error: `Failed to add the ${toastMessage}`,
      });

      setInputText("");
      setIsOpen(false);
    },
    [inputText]
  );

  return (
    <div className="flex flex-row justify-between items-center gap-2">
      <div className="flex flex-row items-center gap-2">
        <div className="flex items-center justify-center w-5 h-5">🍵</div>
        <div className="text-gray-500">Coolection</div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="items-center bg-white justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md px-3 text-xs ml-auto hidden h-8 lg:flex">
            <PlusIcon className="mr-1 h-4 w-4" />
            New item
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>New item</DialogTitle>
            <DialogDescription>
              Add a new item to your collection. You can add a website or a
              tweet you want to keep track of.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="pb-6">
              <Input
                placeholder="https://coolection.co"
                value={inputText}
                onChange={handleInputChange}
              />
            </div>
            <DialogFooter>
              <button
                className="items-center bg-white/80 justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md px-3 text-xs ml-auto hidden h-8 lg:flex"
                type="submit"
                disabled={!inputText.trim() || !isValidUrl(inputText)}
              >
                Submit
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
