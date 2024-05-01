import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { searchCoolection } from "../actions";

export interface SearchProps {
  searchPokedex: (
    content: string
  ) => Promise<Array<Coolection & { similarity: number }>>;
}

export function Results({ query }: { query: string }) {
  const [searchResults, setSearchResults] = useState<
    Array<Coolection & { similarity?: number }>
  >([]);
  const [debouncedQuery] = useDebounce(query, 150);

  useEffect(() => {
    let current = true;
    if (debouncedQuery.trim().length > 0) {
      searchCoolection(debouncedQuery).then((results) => {
        if (current) {
          setSearchResults(results);
        }
      });
    }
    return () => {
      current = false;
    };
  }, [debouncedQuery]);

  return (
    <>
      {query.length === 0 && searchResults.length === 0 ? (
        <p className="text-sm text-gray-700">
          Search for websites, tweets, or bookmarks
        </p>
      ) : null}

      {searchResults.length === 0 && debouncedQuery.trim().length > 0 ? (
        <p className="text-sm text-gray-700">Sip, sip, sip...</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4">
        {searchResults.map((item) => (
          <a href={item.url} target="_blank" key={item.id}>
            <div className="flex flex-col p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-serif">{item.title ?? "Untitled"}</h3>
              <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                {item.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
