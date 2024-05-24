"use client";

import { XIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

import { usePaginatedItems } from "../hooks/use-paginated-items";
import { getSearchSwrKey } from "../hooks/use-search-results";
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
  const { mutate } = useSWRConfig();
  const { mutate: mutateItems } = usePaginatedItems();

  const [title, setTitle] = useState(currentItem?.title ?? "");
  const [description, setDescription] = useState(
    currentItem?.description ?? "",
  );
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  const searchParams = useSearchParams();
  const querySearchParam = searchParams.get("q")?.toString() ?? "";

  useEffect(() => {
    if (currentItem) {
      setTitle(currentItem.title ?? "");
      setDescription(currentItem.description ?? "");
      setNewTag("");
    }
  }, [openEditItemDialog, currentItem, setNewTag]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(
          `/api/item/tags?item_id=${currentItem?.id}`,
        );
        if (response.ok) {
          const tags = await response.json();
          setTags(tags.map((tag) => tag.tag.name));
        } else {
          toast.error("Failed to fetch tags");
        }
      } catch (error) {
        toast.error("Failed to fetch tags");
      }
    };

    if (currentItem) {
      fetchTags();
    }
  }, [currentItem]);

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

  const handleNewTagChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNewTag(event.target.value);
    },
    [],
  );

  const handleAddNewTag = async () => {
    try {
      const response = await fetch("/api/tags/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: currentItem.id,
          tag_name: newTag,
        }),
      });

      if (response.ok) {
        const newTagData = await response.json();
        setTags((prevTags) => [...prevTags, newTagData.name]);
        setNewTag("");
      } else {
        toast.error("Failed to create tag");
      }
    } catch (error) {
      toast.error("Failed to create tag");
    }
  };

  const handleRemoveTag = useCallback(async (tagToRemove: string) => {
    try {
      const response = await fetch("/api/tags/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag_name: tagToRemove,
        }),
      });

      if (response.ok) {
        setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
      } else {
        toast.error("Failed to remove tag");
      }
    } catch (error) {
      toast.error("Failed to remove tag");
    }
  }, []);

  const haveChanges =
    currentItem &&
    (title !== currentItem.title || description !== currentItem.description);

  const searchSwrKey = getSearchSwrKey(querySearchParam);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
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
      mutate,
      setOpenEditItemDialog,
      title,
      description,
      currentItem,
      haveChanges,
      mutateItems,
    ],
  );

  return (
    <Dialog open={openEditItemDialog} onOpenChange={setOpenEditItemDialog}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
          <DialogDescription>
            Update the title, description, and tags
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
            <div className="grid gap-2">
              <Label htmlFor="tags">Tag</Label>
              <div className="flex gap-2">
                <Input
                  id="newTag"
                  type="text"
                  placeholder="New tag"
                  value={newTag}
                  onChange={handleNewTagChange}
                  onKeyPress={(event) => {
                    if (event.key === "Enter") {
                      if (!newTag) {
                        return;
                      }
                      handleAddNewTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddNewTag}
                  disabled={!newTag}
                >
                  Add Tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex select-none items-center gap-1 rounded bg-gray-200 px-2 py-1 text-xs"
                  >
                    {tag}
                    <XIcon size={12} onClick={() => handleRemoveTag(tag)} />
                  </span>
                ))}
              </div>
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
