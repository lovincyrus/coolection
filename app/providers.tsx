"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  simpleStorageHandler,
  useCacheProvider,
} from "@piotr-cz/swr-idb-cache";
import { SWRConfig } from "swr";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

import { GlobalsProvider } from "./components/provider/globals-provider";
import { getAllLists, getItems } from "./data";

const storageHandler = {
  ...simpleStorageHandler,
  replace: (key: string, value: any) =>
    key !== `$inf$/api/items?page=1&limit=${DEFAULT_PAGE_SIZE}` &&
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
            [`/api/items?page=1&limit=${DEFAULT_PAGE_SIZE}`]: getItems(
              1,
              DEFAULT_PAGE_SIZE,
            ),
          },
        }}
      >
        <GlobalsProvider>{children}</GlobalsProvider>
      </SWRConfig>
    </ClerkProvider>
  );
}
