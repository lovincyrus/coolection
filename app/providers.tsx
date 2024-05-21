"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  timestampStorageHandler,
  useCacheProvider,
} from "@piotr-cz/swr-idb-cache";
import { SWRConfig } from "swr";

import { GlobalsProvider } from "./components/provider/globals-provider";

// Max age of 7 days
const maxAge = 7 * 24 * 60 * 60 * 1e3;

const storageHandler = {
  ...timestampStorageHandler,
  // https://github.com/piotr-cz/swr-idb-cache?tab=readme-ov-file#implement-garbage-collector
  revive: (key: string, storeObject: any) =>
    storeObject.ts > Date.now() - maxAge
      ? timestampStorageHandler.revive(key, storeObject)
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
