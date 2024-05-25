"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  simpleStorageHandler,
  useCacheProvider,
} from "@piotr-cz/swr-idb-cache";
import { SWRConfig } from "swr";

import { GlobalsProvider } from "./components/provider/globals-provider";

// TODO: only cache the first page of "$inf$/api/items?page=1&limit=10" so users can continue to load more
// See: https://github.com/piotr-cz/swr-idb-cache
const storageHandler = {
  ...simpleStorageHandler,
  replace: (key: string, value: any) =>
    key !== "$inf$/api/items?page=1&limit=10" &&
    !key.startsWith("/api/search") &&
    !key.startsWith("/api/items") &&
    !key.startsWith("/api/lists/")
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
