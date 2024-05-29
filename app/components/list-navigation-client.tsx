"use client";

import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { preload } from "swr";

import { fetcher } from "@/lib/fetcher";

import ListNavigation from "./list-navigation";
import { ListNavigationSkeletons } from "./list-navigation-skeletons";

function Fallback({ resetErrorBoundary }: any) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <button
        onClick={() => {
          resetErrorBoundary();
        }}
      >
        retry
      </button>
    </div>
  );
}

export function ListNavigationClient(listsServerData: any) {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onReset={() => {
        preload("/api/lists", fetcher);
      }}
    >
      <Suspense fallback={<ListNavigationSkeletons />}>
        <ListNavigation listsServerData={listsServerData} />
      </Suspense>
    </ErrorBoundary>
  );
}
