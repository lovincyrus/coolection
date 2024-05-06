"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { GlobalsProvider } from "./components/globals-provider";
import { ResultsProvider } from "./components/results-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <GlobalsProvider>
        <ResultsProvider>{children}</ResultsProvider>
      </GlobalsProvider>
    </ClerkProvider>
  );
}
