"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { SWRConfig } from "swr";

import { GlobalsProvider } from "./components/provider/globals-provider";
import { getAllLists, getItems } from "./data";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <SWRConfig
        value={{
          fallback: {
            "/api/lists": getAllLists(),
            "/api/items?page=1&limit=10": getItems(1, 10),
          },
        }}
      >
        <GlobalsProvider>{children}</GlobalsProvider>
      </SWRConfig>
    </ClerkProvider>
  );
}
