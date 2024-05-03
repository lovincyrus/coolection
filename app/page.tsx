"use client";

import { Search } from "lucide-react";
import normalizeUrl from "normalize-url";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { Results } from "./components/results";

function isValidUrl(input: string) {
  try {
    new URL(input);
    return true;
  } catch {
    return false;
  }
}

function isTwitterUrl(input: string) {
  try {
    const url = new URL(input);
    return url.hostname === "twitter.com";
  } catch {
    return false;
  }
}

function _normalizeLink(input: string) {
  return normalizeUrl(input, {
    removeTrailingSlash: true,
    stripWWW: false,
  });
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    if (isValidUrl(debouncedQuery)) {
      const normalizedLink = _normalizeLink(debouncedQuery);
      setQuery(normalizedLink);
      // console.log("Adding link:", normalizedLink);
    } else {
      console.log("Performing search for:", debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleKeyPress = useCallback(async () => {
    // TODO: consolidate into a single API endpoint
    if (isTwitterUrl(query)) {
      const response = await fetch("/api/add-tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          twitterUrl: query,
        }),
      });

      if (response.ok) {
        console.log("Twitter link added successfully");
        setQuery("");
      } else {
        console.error("Failed to add the Twitter link");
      }
    } else if (isValidUrl(query)) {
      const response = await fetch("/api/add-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link: query,
        }),
      });

      if (response.ok) {
        console.log("Link added successfully");
        setQuery("");
      } else {
        console.error("Failed to add the link");
      }
    } else {
      console.log("Performing search for:", query);
    }
  }, [query]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-between w-full">
      <div className="max-w-xl px-4 md:px-0 mx-auto w-full pt-4 text-sm">
        <Header />

        <div className="mt-20">
          {/* <Intro /> */}

          <div className="flex flex-col mt-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 grayscale opacity-60 text-muted-foreground" />
              <input
                ref={inputRef}
                className="w-full pl-8 px-3 py-2 text-sm leading-tight text-gray-700 border border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline"
                placeholder="Search websites, tweets or insert a link..."
                value={query}
                onChange={handleChange}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    handleKeyPress();
                  }
                }}
              />
            </div>

            <div className="my-8">
              <h2 className="font-serif text-lg flex justify-between pb-2 gap-1">
                Results
              </h2>

              <Results query={debouncedQuery} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
