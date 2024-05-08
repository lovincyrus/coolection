"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useRef } from "react";
import { useHotkeys } from "reakeys";
import { useDebouncedCallback } from "use-debounce";

import { Footer } from "./footer";
import { Header } from "./header";
import { Results } from "./results";

// After user stops typing for 300ms, update the URL with the new search query
const DEBOUNCE_TIME = 300;

export function HomePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useHotkeys([
    {
      name: "Focus search",
      keys: "/",
      callback: (event) => {
        event?.preventDefault();
        inputRef.current?.focus();
      },
    },
  ]);

  const handleSearch = useDebouncedCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams);
      if (event.target.value) {
        params.set("q", event.target.value);
      } else {
        params.delete("q");
      }
      replace(`${pathname}?${params.toString()}`);
    },
    DEBOUNCE_TIME,
  );

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-between">
      <div className="mx-auto mt-4 w-full max-w-2xl px-4 md:px-0">
        <Header />

        <div className="mt-20 flex flex-col">
          <div className="relative">
            <SearchIcon className="text-muted-foreground absolute left-2 top-[0.6rem] h-4 w-4 opacity-60 grayscale" />
            <input
              ref={inputRef}
              className="focus:shadow-outline w-full appearance-none rounded border bg-black/5 px-3 py-2 pl-8 text-sm leading-tight text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-1"
              placeholder="Search..."
              defaultValue={searchParams.get("q")?.toString()}
              onChange={handleSearch}
              autoFocus
            />
          </div>

          <div className="my-8">
            <Results query={searchParams.get("q")?.toString() ?? ""} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
