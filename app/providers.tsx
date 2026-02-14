"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  simpleStorageHandler,
  useCacheProvider,
} from "@piotr-cz/swr-idb-cache";
import { SWRConfig } from "swr";

import { GlobalsProvider } from "./components/provider/globals-provider";
import { getAllLists, getItems } from "./data";

const storageHandler = {
  ...simpleStorageHandler,
  replace: (key: string, value: any) =>
    key !== "$inf$/api/items?page=1&limit=10" &&
    !key.startsWith("/api/search") &&
    !key.startsWith("/api/items")
      ? simpleStorageHandler.replace(key, value)
      : undefined,
};

export function Providers({ children }: { children: React.ReactNode }) {
  const cacheProvider = useCacheProvider({
    dbName: "coolection_db",
    storeName: "swr-cache",
    storageHandler: storageHandler,
  });

  return (
    <ClerkProvider>
      <SWRConfig
        value={{
          ...(cacheProvider ? { provider: cacheProvider } : {}),
          revalidateOnFocus: false,
          dedupingInterval: 5_000,
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
