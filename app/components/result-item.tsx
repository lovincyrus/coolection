import { LinkIcon } from "lucide-react";
import React from "react";
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

function extractDomain(url: string) {
  const domain = url.replace("http://", "").replace("https://", "");
  return domain.split("/")[0];
}

export function ResultItem({
  item,
  onRemoveItem,
  lists,
}: {
  item: CoolectionItem & { similarity?: number };
  onRemoveItem: (_itemId: string) => void;
  lists: CoolectionList[];
}) {
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
          item_id: item.id,
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

    onRemoveItem(item.id);
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
          <a href={item.url} target="_blank" key={item.id}>
            <div className="flex flex-col py-4 hover:rounded-lg hover:bg-gray-50 hover:shadow">
              <div className="flex flex-col gap-1 px-4">
                <h3 className="text-sm font-medium">{item.title}</h3>
                {/* <code className="text-[12px]">{item.similarity}</code> */}
                <div className="flex flex-row items-center space-x-2">
                  <LinkIcon className="h-3 w-3 text-gray-400" />
                  <p className="text-sm text-gray-400">
                    {extractDomain(String(item.url))}
                  </p>
                </div>
                <p className="line-clamp-3 text-sm text-gray-600">
                  {getDescription()}
                </p>
              </div>
            </div>
          </a>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-white">
          {lists.length > 0 && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>Move...</ContextMenuSubTrigger>
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
          )}
          <ContextMenuItem onClick={handleDeleteItem}>
            Delete Item
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
