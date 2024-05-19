import React from "react";

import { DEAFULT_PAGE_SIZE } from "@/lib/constants";

import { Skeleton } from "./ui/skeleton";

export function ResultItemSkeletons({
  count = DEAFULT_PAGE_SIZE,
}: {
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, idx) => (
        <div className="flex flex-col rounded-lg py-4" key={idx}>
          <div className="flex flex-col gap-1 px-4">
            <Skeleton className="h-4 w-60" />
            <div className="flex flex-row items-center space-x-2">
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </>
  );
}
