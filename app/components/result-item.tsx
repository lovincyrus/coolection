import { LinkIcon, StarIcon, Twitter } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useRef } from "react";
import { toast } from "sonner";

import { useIsInList } from "../hooks/use-is-in-list";
import { useOnVisible } from "../hooks/use-on-visible";
import { Item, ItemType, List } from "../types";
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

export const ResultItem = React.memo(function ResultItem({
  item,
  onArchive,
  onRemove,
  lists,
  listId,
  isLastItem,
  onLoadMore,
}: {
  item: Item & { similarity?: number };
  onArchive?: (_itemId: string) => void;
  onRemove?: (_itemId: string) => void;
  lists: List[];
  listId?: string;
  isLastItem?: boolean;
  onLoadMore?: () => void;
}) {
  const searchParams = useSearchParams();
  const querySearchParam = searchParams.get("q")?.toString() ?? "";
  const { setOpenEditItemDialog, setCurrentItem } = useGlobals();
  const isInList = useIsInList();

  const lastItemRef = useRef<HTMLAnchorElement>(null);
  useOnVisible(lastItemRef, onLoadMore);

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
          list_id: listId,
          item_id: item.id,
        }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to add the item to list ${getListName()}`;

        if (response.status === 400) {
          errorMessage = "Item is already associated with this list";
        } else {
          const responseText = await response.text();
          errorMessage = responseText || errorMessage;
        }

        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      return response.json();
    };

    toast.promise(addItemToList(), {
      loading: `Adding item to ${getListName()}...`,
      success: `Item added to ${getListName()} successfully`,
      // error: `Failed to add the item to ${getListName()}`,
    });
  };

  const handleRemoveFromList = (listId: string) => {
    const removeItemFromList = async () => {
      const response = await fetch("/api/list/remove", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          list_id: listId,
          item_id: item.id,
        }),
      });

      if (!response.ok) {
        toast.error(`Failed to remove the item from list`);
        throw new Error("Network response was not ok");
      }
    };

    toast.promise(removeItemFromList(), {
      loading: `Removing item from list...`,
      success: `Item removed from list successfully`,
      error: `Failed to remove the item from list`,
    });

    if (onRemove) {
      onRemove(item.id);
    }
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

    if (onArchive) {
      onArchive(item.id);
    }
  };

  function getDescription() {
    if (item.type === ItemType._WEBSITE || item.type === ItemType._GITHUB_STAR) {
      return item.description;
    } else if (item.type === ItemType._TWEET) {
      return item.content;
    }
    return "No description";
  }

  function getUrl() {
    if (item.type === ItemType._WEBSITE || item.type === ItemType._GITHUB_STAR) {
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
          key={item.id}
          ref={isLastItem ? lastItemRef : null}
          href={getUrl()}
          target="_blank"
          rel="noreferrer noopener"
          onPointerOver={() => {
            setCurrentItem(item);
          }}
        >
          <div className="flex select-none flex-col py-4 visited:bg-gray-50 hover:rounded-lg hover:bg-gray-50 hover:shadow">
            <div className="flex flex-col gap-1 px-4">
              <h3 className="line-clamp-1 text-sm font-medium">
                <HighlightChars
                  text={item.title}
                  searchTerm={querySearchParam}
                />
              </h3>
              {/* <code className="text-[12px]">{item.similarity}</code> */}
              <div className="flex flex-row items-center space-x-2">
                {item.type === ItemType._GITHUB_STAR ? (
                  <StarIcon className="h-3 w-3 text-amber-400" />
                ) : item.type === ItemType._TWEET ? (
                  <Twitter className="h-3 w-3 text-sky-400" />
                ) : (
                  <LinkIcon className="h-3 w-3 text-gray-400" />
                )}
                <p className="text-sm text-gray-400">
                  <HighlightChars
                    text={extractDomain(String(item.url))}
                    searchTerm={querySearchParam}
                  />
                </p>
                {item.type === ItemType._GITHUB_STAR && item.metadata?.language && (
                  <span className="text-xs text-gray-400">
                    {item.metadata.language}
                  </span>
                )}
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
      {isInList ? (
        <ContextMenuContent className="w-32 md:w-48">
          <ContextMenuItem
            onClick={() => {
              navigator.clipboard.writeText(item.url ?? "");
              toast.success("URL copied to clipboard");
            }}
          >
            Copy URL
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleRemoveFromList(listId ?? "")}>
            Remove from List
          </ContextMenuItem>
        </ContextMenuContent>
      ) : (
        <ContextMenuContent className="w-32 md:w-48">
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
              <ContextMenuSubContent className="w-32 md:w-48">
                {lists &&
                  lists.map((list) => (
                    <ContextMenuItem
                      key={list.id}
                      onClick={() => handleAddToList(list.id)}
                    >
                      {list.name}
                    </ContextMenuItem>
                  ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          <ContextMenuItem onClick={handleArchiveItem}>Archive</ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
});
