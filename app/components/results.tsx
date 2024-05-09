import { useAuth } from "@clerk/nextjs";
import React, { useCallback, useEffect, useMemo } from "react";

import { searchCoolection } from "../actions";
import { useFetchLists } from "../hooks/use-fetch-lists";
import { useResults } from "./provider/results-provider";
import { ResultItem } from "./result-item";

export function Results({ query }: { query: string }) {
  const { userId } = useAuth();
  const { results, updateResults } = useResults();
  const { lists, loading: _listsLoading, error: _listsError } = useFetchLists();

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
    [results, updateResults],
  );

  return (
    <div className="relative mx-auto w-full">
      {query.length === 0 && filteredResults.length === 0 ? (
        <p className="mt-4 text-center text-sm text-gray-700">
          Search for websites or tweets
        </p>
      ) : null}

      {query.length > 0 && filteredResults.length === 0 ? (
        <p className="mt-4 text-center text-sm text-gray-700">
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
