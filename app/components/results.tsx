import { useAuth } from "@clerk/nextjs";
import React, { useEffect, useMemo, useState } from "react";

import { searchCoolection } from "../actions";
import { CoolectionItem } from "../types";
import { ResultItem } from "./result-item";

export function Results({ query }: { query: string }) {
  const { userId } = useAuth();
  const [searchResults, setSearchResults] = useState<
    Array<CoolectionItem & { similarity?: number }>
  >([]);

  useEffect(() => {
    let current = true;
    if (query.trim().length > 0) {
      searchCoolection(query, userId).then((results) => {
        if (current) {
          setSearchResults(results);
        }
      });
    }
    return () => {
      current = false;
    };
  }, [query, userId]);

  const filteredResults = useMemo(() => {
    return searchResults.filter((item) => !item.isDeleted);
  }, [searchResults]);

  return (
    <div className="w-full mx-auto">
      {query.length === 0 && filteredResults.length === 0 ? (
        <p className="text-sm text-gray-700 mt-4 text-center">
          Search for websites, tweets, or bookmarks
        </p>
      ) : null}

      {filteredResults.length === 0 && query.trim().length > 0 ? (
        <p className="text-sm text-gray-700 mt-4 text-center">
          Sip, sip, sippity, sip...
        </p>
      ) : null}

      {filteredResults.map((item) => (
        <ResultItem key={item.id} item={item} />
      ))}
    </div>
  );
}
