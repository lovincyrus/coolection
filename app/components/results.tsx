import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { v4 as uuid } from "uuid";

import { searchCoolection } from "../actions";

interface Coolection {
  id: string;
  url: string;
  title: string;
  description: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

const data: Coolection[] = [
  {
    id: uuid(),
    url: "https://cooking.nytimes.com/recipes/1018684-classic-tiramisu",
    title: "Classic Tiramisù Recipe (with Video) - NYT Cooking",
    description:
      "Done correctly, a classic tiramisù can be transcendent A creamy dessert of espresso-soaked ladyfingers surrounded by lightly sweetened whipped cream and a rich mascarpone, tiramisù relies heavily on the quality of its ingredients If you don’t have a barista setup at home, pick up the espresso at a local coffee shop, or use strongly brewed coffee",
  },
  {
    id: uuid(),
    url: "https://sfcompute.com",
    title: "The San Francisco Compute Company",
    description: "A large, low-cost H100 cluster you can rent by the hour",
  },
  {
    id: uuid(),
    url: "https://latecheckout.studio",
    title: "Late Checkout",
    description:
      "Late Checkout is a community + product design firm. We are an agency, studio and fund building community-based businesses.",
  },
];

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

  // TODO: fuzzy
  // const filteredData = data.filter((item) =>
  //   item.title.toLowerCase().includes(query.toLowerCase())
  // );

  return (
    <>
      <h2 className="font-serif text-lg flex justify-between pb-2 gap-1">
        Results
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {(searchResults.length === 0 ? data : searchResults).map((item) => (
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
