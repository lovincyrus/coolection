"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { GlobalsProvider } from "./components/provider/globals-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <GlobalsProvider>{children}</GlobalsProvider>
    </ClerkProvider>
  );
}
