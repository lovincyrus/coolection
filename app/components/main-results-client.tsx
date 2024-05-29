"use client";

import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { preload } from "swr";

import { fetcher } from "@/lib/fetcher";

import { getKey } from "../hooks/use-paginated-items";
import MainResults from "./main-results";
import { ResultItemSkeletons } from "./result-item-skeletons";

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

export function MainResultsClient(serverData: any, itemsData: any) {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onReset={() => {
        preload(getKey, fetcher);
      }}
    >
      <Suspense fallback={<ResultItemSkeletons />}>
        <MainResults serverData={serverData} itemsData={itemsData} />
      </Suspense>
    </ErrorBoundary>
  );
}
