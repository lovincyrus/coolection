"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  timestampStorageHandler,
  useCacheProvider,
} from "@piotr-cz/swr-idb-cache";
import { SWRConfig } from "swr";

import { GlobalsProvider } from "./components/provider/globals-provider";

// See: https://github.com/piotr-cz/swr-idb-cache
const storageHandler = {
  ...timestampStorageHandler,
  replace: (key: string, value: any) =>
    key === "/api/items?page=1&limit=10"
      ? timestampStorageHandler.replace(key, value)
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
