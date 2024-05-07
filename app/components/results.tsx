import { useAuth } from "@clerk/nextjs";
import React, { useCallback, useEffect, useMemo } from "react";

import { searchCoolection } from "../actions";
import { useFetchItems } from "../hooks/use-fetch-items";
import { useFetchLists } from "../hooks/use-fetch-lists";
import { ResultItem } from "./result-item";
import { useResults } from "./results-provider";

export function Results({ query }: { query: string }) {
  const { userId } = useAuth();
  const { results, updateResults } = useResults();
  const { items, loading: itemLoading, error: itemError } = useFetchItems();
  const { lists, loading: listsLoading, error: listsError } = useFetchLists();

  useEffect(() => {
    const fetchResults = async () => {
      const response = await fetch(`/api/items`);
      if (response.ok) {
        const latestResults = await response.json();
        updateResults(latestResults);
      }
    };

    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query === "") {
      updateResults(items);
    }
  }, [query, updateResults, items]);

  useEffect(() => {
    let current = true;
    if (query.trim().length > 0 && userId) {
      searchCoolection(query, userId).then((results) => {
        if (current) {
          updateResults(results);
        }
      });
    }

    return () => {
      current = false;
    };
  }, [query, userId, updateResults]);

  const filteredResults = useMemo(() => {
    return results.filter((item) => !item.isDeleted);
  }, [results]);

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      updateResults(results.filter((item) => item.id !== itemId));
    },
    [results, updateResults]
  );

  return (
    <div className="w-full mx-auto">
      {query.length === 0 && filteredResults.length === 0 ? (
        <p className="text-sm text-gray-700 mt-4 text-center">
          Search for websites or tweets
        </p>
      ) : null}

      {query.length > 0 && filteredResults.length === 0 ? (
        <p className="text-sm text-gray-700 mt-4 text-center">
          Sip, sip, sippity, sip...
        </p>
      ) : null}

      {filteredResults.map((item) => (
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
