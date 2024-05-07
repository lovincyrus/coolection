"use client";

import { Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

import { Footer } from "./footer";
import { useGlobals } from "./globals-provider";
import { Header } from "./header";
import { Results } from "./results";

export function HomePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleSearch } = useGlobals();

  useEffect(() => {
    if (toggleSearch) {
      inputRef.current?.focus();
    }
  }, [toggleSearch]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("search");
    if (searchQuery) {
      setQuery(searchQuery);
    }
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    const newRelativePathQuery = `${
      window.location.pathname
    }?${params.toString()}`;
    history.pushState(null, "", newRelativePathQuery);

    setQuery(debouncedQuery);
  }, [debouncedQuery]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-between w-full">
      <div className="max-w-2xl px-4 md:px-0 mx-auto w-full mt-4">
        <Header />

        <div className="flex flex-col mt-20">
          {toggleSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 grayscale opacity-60 text-muted-foreground" />
              <input
                ref={inputRef}
                className="w-full pl-8 px-3 py-2 text-sm leading-tight text-gray-700 border border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline"
                placeholder="Search websites, tweets"
                value={query}
                onChange={handleChange}
                autoFocus
              />
            </div>
          )}

          <div className="my-8">
            {/* <h2 className="font-serif text-lg flex justify-between gap-1 px-4">
              Results
            </h2> */}

            <Results query={debouncedQuery} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
