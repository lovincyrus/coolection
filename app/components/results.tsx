import React, { useEffect, useMemo, useState } from "react";

import { searchCoolection } from "../actions";
import { CoolectionItem } from "../types";
import { ResultItem } from "./result-item";

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

  const filteredResults = useMemo(() => {
    return searchResults.filter((item) => !item.isDeleted);
  }, [searchResults]);

  return (
    <>
      {query.length === 0 && filteredResults.length === 0 ? (
        <p className="text-sm text-gray-700">
          Search for websites, tweets, or bookmarks
        </p>
      ) : null}

      {filteredResults.length === 0 && query.trim().length > 0 ? (
        <p className="text-sm text-gray-700">Sip, sip, sippity, sip...</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4">
        {filteredResults.map((item) => (
          <ResultItem key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
