"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  simpleStorageHandler,
  useCacheProvider,
} from "@piotr-cz/swr-idb-cache";

import { GlobalsProvider } from "./components/provider/globals-provider";

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

  if (!cacheProvider) {
    return null;
  }

  return (
    <ClerkProvider>
      {/* <SWRConfig
        value={{
          provider: cacheProvider,
          fallback: {
            "/api/lists": getAllLists(),
            "/api/items?page=1&limit=10": getItems(1, 10),
          },
        }}
      > */}

      <GlobalsProvider>{children}</GlobalsProvider>
      {/* </SWRConfig> */}
    </ClerkProvider>
  );
}
