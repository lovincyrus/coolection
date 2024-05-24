import { LinkIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { CoolectionItem, CoolectionList, ItemType } from "../types";
import { HighlightChars } from "./highlight-chars";
import { useGlobals } from "./provider/globals-provider";
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
  onArchive,
  lists,
}: {
  item: CoolectionItem & { similarity?: number };
  onArchive: (_itemId: string) => void;
  lists: CoolectionList[];
}) {
  const searchParams = useSearchParams();
  const querySearchParam = searchParams.get("q")?.toString() ?? "";
  const { setOpenEditItemDialog, setCurrentItem } = useGlobals();

  const handleAddToList = (listId: string) => {
    function getListName() {
      const list = lists.find((l) => l.id === listId);
      return list ? list.name : "list";
    }

    const addItemToList = async () => {
      const response = await fetch("/api/list/add", {
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
        throw new Error(`Failed to add the item to list ${getListName()}`);
      }
      return response.json();
    };

    toast.promise(addItemToList(), {
      loading: `Adding item to ${getListName()}...`,
      success: `Item added to ${getListName()} successfully`,
      error: `Failed to add the item to ${getListName()}`,
    });
  };

  const handleEditItem = () => {
    setOpenEditItemDialog(true);
  };

  const handleArchiveItem = () => {
    const archiveItem = async () => {
      const response = await fetch("/api/item/archive", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_id: item.id,
        }),
      });

      if (!response.ok) {
        toast.error(`Failed to archive the item from the list`);
        throw new Error("Network response was not ok");
      }
    };

    toast.promise(archiveItem(), {
      loading: `Archiving item ${item.title}...`,
      success: `${item.title} has been archived successfully`,
      error: `Failed to archive item ${item.title}`,
    });

    onArchive(item.id);
  };

  function getDescription() {
    if (item.type === ItemType._WEBSITE) {
      return item.description;
    } else if (item.type === ItemType._TWEET) {
      return item.content;
    }
    return "No description";
  }

  function getUrl() {
    if (item.type === ItemType._WEBSITE) {
      return item.url;
    } else if (item.type === ItemType._TWEET) {
      return item.metadata?.tweet_url;
    }
    return item.url;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <a
          href={getUrl()}
          target="_blank"
          rel="noreferrer noopener"
          key={item.id}
          onPointerOver={() => {
            setCurrentItem(item);
          }}
        >
          <div className="flex select-none flex-col py-4 hover:rounded-lg hover:bg-gray-50 hover:shadow">
            <div className="flex flex-col gap-1 px-4">
              <h3 className="text-sm font-medium">
                <HighlightChars
                  text={item.title}
                  searchTerm={querySearchParam}
                />
              </h3>
              {/* <code className="text-[12px]">{item.similarity}</code> */}
              <div className="flex flex-row items-center space-x-2">
                <LinkIcon className="h-3 w-3 text-gray-400" />
                <p className="text-sm text-gray-400">
                  <HighlightChars
                    text={extractDomain(String(item.url))}
                    searchTerm={querySearchParam}
                  />
                </p>
              </div>
              <p className="line-clamp-3 text-sm text-gray-600">
                <HighlightChars
                  text={getDescription() ?? ""}
                  searchTerm={querySearchParam}
                />
              </p>
            </div>
          </div>
        </a>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-white">
        <ContextMenuItem
          onClick={() => {
            navigator.clipboard.writeText(item.url ?? "");
            toast.success("URL copied to clipboard");
          }}
        >
          Copy URL
        </ContextMenuItem>
        <ContextMenuItem onClick={handleEditItem}>Edit...</ContextMenuItem>
        {lists?.length > 0 && (
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
        <ContextMenuItem onClick={handleArchiveItem}>Archive</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
