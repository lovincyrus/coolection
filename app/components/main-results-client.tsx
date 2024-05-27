"use client";

import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { preload } from "swr";

import { fetcher } from "@/lib/fetcher";

import MainResults from "./main-results";
import { ResultItemSkeletons } from "./result-item-skeletons";

// See: https://swr.vercel.app/docs/prefetching
preload("/api/items?page=1&limit=10", fetcher);

export function MainResultsClient() {
  return (
    <ErrorBoundary fallback={<div>Could not load results...</div>}>
      <Suspense fallback={<ResultItemSkeletons />}>
        <MainResults />
      </Suspense>
    </ErrorBoundary>
  );
}
