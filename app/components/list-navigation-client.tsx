"use client";

import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { preload } from "swr";

import { fetcher } from "@/lib/fetcher";

import ListNavigation from "./list-navigation";
import { ListNavigationSkeletons } from "./list-navigation-skeletons";

// See: https://swr.vercel.app/docs/prefetching
preload("/api/lists", fetcher);

export function ListNavigationClient() {
  return (
    <ErrorBoundary fallback={<div>Could not load lists...</div>}>
      <Suspense fallback={<ListNavigationSkeletons />}>
        <ListNavigation />
      </Suspense>
    </ErrorBoundary>
  );
}
