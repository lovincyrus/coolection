"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import {
  simpleStorageHandler,
  useCacheProvider,
} from "@piotr-cz/swr-idb-cache";
import { ThemeProvider, useTheme } from "next-themes";
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

function ClerkWithTheme({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || resolvedTheme === "teal";

  return (
    <ClerkProvider appearance={isDark ? { baseTheme: dark } : undefined}>
      {children}
    </ClerkProvider>
  );
}

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
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      disableTransitionOnChange
    >
      <ClerkWithTheme>
        <SWRConfig
          value={{
            provider: cacheProvider,
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
      </ClerkWithTheme>
    </ThemeProvider>
  );
}
