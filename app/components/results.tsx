import React, { useCallback } from "react";
import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";

import { useItems } from "../hooks/use-items";
import { useLists } from "../hooks/use-lists";
import { CoolectionItem } from "../types";
import { ResultItem } from "./result-item";

export function Results({ query }: { query: string }) {
  const { items, mutate } = useItems();
  const { lists } = useLists();

  // See: https://swr.vercel.app/docs/advanced/understanding#return-previous-data-for-better-ux
  const { data: searchResults } = useSWR(`/api/search?q=${query}`, fetcher, {
    keepPreviousData: true,
  });

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (Array.isArray(items)) {
        mutate(items.filter((item) => item.id !== itemId));
      }
    },
    [items, mutate],
  );

  const results = query.length > 0 ? searchResults : items;

  return (
    <div className="relative mx-auto w-full">
      {query.length === 0 && items?.length === 0 ? (
        <p className="mt-4 text-center text-sm text-gray-700">
          Search for a website or paste a URL.
        </p>
      ) : null}

      {query.length > 0 && results?.length === 0 ? (
        <p className="mt-4 text-center text-sm text-gray-700">
          Sip, sip, sippity, sip...
        </p>
      ) : null}

      {results?.map((item: CoolectionItem) => (
        <ResultItem
          key={item.id}
          item={item}
          onRemoveItem={handleRemoveItem}
          lists={lists}
        />
      ))}
    </div>
  );
}
