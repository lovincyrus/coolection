"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { GlobalsProvider } from "./components/provider/globals-provider";
import { ResultsProvider } from "./components/provider/results-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <GlobalsProvider>
        <ResultsProvider>{children}</ResultsProvider>
      </GlobalsProvider>
    </ClerkProvider>
  );
}
