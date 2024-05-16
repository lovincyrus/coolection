"use client";

import { SearchIcon, XCircleIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { lazy, Suspense, useRef } from "react";
import { useHotkeys } from "reakeys";
import { useDebouncedCallback } from "use-debounce";

import { ResultItemSkeletons } from "./result-item-skeletons";

const Results = lazy(() => import("./results"));

// After user stops typing for 300ms, update the URL with the new search query
const DEBOUNCE_TIME = 300;

export function Search() {
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

  const querySearchParam = searchParams.get("q")?.toString() ?? "";

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
    <>
      <div className="relative mb-8">
        <SearchIcon className="text-muted-foreground absolute left-2 top-[0.6rem] h-4 w-4 opacity-60 grayscale" />
        <input
          ref={inputRef}
          type="text"
          className="focus:shadow-outline w-full appearance-none rounded border bg-black/5 px-3 py-2 pl-8 pr-8 text-sm leading-tight text-gray-700 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
          placeholder="What are you looking for?"
          defaultValue={querySearchParam}
          onChange={handleSearch}
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              inputRef.current.value = "";
              replace(pathname);
              inputRef.current.focus();
            }
          }}
        />
        {querySearchParam && (
          <XCircleIcon
            className="text-muted-foreground absolute right-2 top-[0.6rem] h-4 w-4 transform cursor-pointer opacity-60 grayscale"
            onClick={() => {
              inputRef.current.value = "";
              replace(pathname);
              inputRef.current.focus();
            }}
          />
        )}
      </div>

      <Suspense fallback={<ResultItemSkeletons />}>
        <Results query={querySearchParam} />
      </Suspense>
    </>
  );
}
