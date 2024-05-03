import React, { useEffect, useState } from "react";

import { searchCoolection } from "../actions";
import { CoolectionItem, CoolectionList } from "../types";
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

function ResultItem({
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
    try {
      const response = await fetch("/api/lists/add-item", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listId: listId,
          itemId: item.id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Item added to list:", data);
        // Handle successful addition to list here
      } else {
        console.error("Failed to add item to list:", data);
        // Handle failure here
      }
    } catch (error) {
      console.error("Failed to add item to list:", error);
      // Handle error here
    }
  };

  function getDescription() {
    if (item.type === "website") {
      return item.description;
    } else if (item.type === "tweet") {
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
              <h3 className="text-lg font-serif">{item.title ?? "Untitled"}</h3>
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
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

export function Results({ query }: { query: string }) {
  const [searchResults, setSearchResults] = useState<
    Array<CoolectionItem & { similarity?: number }>
  >([]);

  useEffect(() => {
    let current = true;
    if (query.trim().length > 0) {
      searchCoolection(query).then((results) => {
        if (current) {
          setSearchResults(results);
        }
      });
    }
    return () => {
      current = false;
    };
  }, [query]);

  return (
    <>
      {query.length === 0 && searchResults.length === 0 ? (
        <p className="text-sm text-gray-700">
          Search for websites, tweets, or bookmarks
        </p>
      ) : null}

      {searchResults.length === 0 && query.trim().length > 0 ? (
        <p className="text-sm text-gray-700">Sip, sip, sippity, sip...</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4">
        {searchResults.map((item) => (
          <ResultItem key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
