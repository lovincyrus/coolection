"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  simpleStorageHandler,
  useCacheProvider,
} from "@piotr-cz/swr-idb-cache";
import { SWRConfig } from "swr";

import { GlobalsProvider } from "./components/provider/globals-provider";

const storageHandler = {
  ...simpleStorageHandler,
  replace: (key: any, value: any) =>
    // Only cache the first page of items
    key === "/api/items?page=1&limit=10"
      ? simpleStorageHandler.replace(key, value)
      : undefined,
};

export function Providers({ children }: { children: React.ReactNode }) {
  const cacheProvider = useCacheProvider({
    dbName: "coolection_db",
    storeName: "swr-cache",
    storageHandler: storageHandler,
  });

  if (!cacheProvider) {
    return null;
  }

  return (
    <ClerkProvider>
      <SWRConfig value={{ provider: cacheProvider }}>
        <GlobalsProvider>{children}</GlobalsProvider>
      </SWRConfig>
    </ClerkProvider>
  );
}
