import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { CoolectionItem, CoolectionList, ItemType } from "../types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./ui/context-menu";

const useFetchLists = () => {
  const [lists, setLists] = useState<CoolectionList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/lists")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(setLists)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { lists, loading, error };
};

export function ResultItem({
  item,
}: {
  item: CoolectionItem & { similarity?: number };
}) {
  const { lists, loading, error } = useFetchLists();

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    // eslint-disable-next-line no-console
    console.log("Right-clicked on item:", item.title);
  };

  const handleAddToList = async (listId: string) => {
    function getListName() {
      const list = lists.find((l) => l.id === listId);
      return list ? list.name : "list";
    }

    const addItemToList = async () => {
      const response = await fetch("/api/list/add-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listId: listId,
          itemId: item.id,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to add the item to ${getListName()}`);
      }
      return response.json();
    };

    toast.promise(addItemToList(), {
      loading: `Adding item to ${getListName()}...`,
      success: `${
        item.title.charAt(0).toUpperCase() + item.title.slice(1)
      } added to ${getListName()} successfully`,
      error: `Failed to add the item to ${getListName()}`,
    });
  };

  const handleDeleteItem = async () => {
    const deleteItem = async () => {
      const response = await fetch(`/api/item/delete-item`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: item.id,
        }),
      });

      if (!response.ok) {
        toast.error(`Failed to delete the item from the list`);
        throw new Error("Network response was not ok");
      }
    };

    toast.promise(deleteItem(), {
      loading: `Deleting item ${item.title}...`,
      success: `${item.title} has been deleted successfully`,
      error: `Failed to delete item ${item.title}`,
    });

    // TODO: Bump searchResults after deletion
  };

  function getDescription() {
    if (item.type === ItemType._WEBSITE) {
      return item.description;
    } else if (item.type === ItemType._TWEET) {
      return item.content;
    }
    return "No description";
  }

  return (
    <div onContextMenu={handleRightClick}>
      <ContextMenu>
        <ContextMenuTrigger>
          <a href={`${item.url}?ref=coolection`} target="_blank" key={item.id}>
            <div className="flex flex-col p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-serif">{item.title}</h3>
              <code className="mt-1">{item.similarity}</code>
              <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                {getDescription()}
              </p>
            </div>
          </a>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-white">
          {/* <ContextMenuItem>Options</ContextMenuItem> */}
          <ContextMenuSub>
            <ContextMenuSubTrigger inset>Move...</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48 bg-white">
              {lists.map((list) => (
                <ContextMenuItem
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                >
                  Add to {list.name}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem onClick={handleDeleteItem}>
            Delete Item
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
