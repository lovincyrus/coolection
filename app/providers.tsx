"use client";

import { ClerkProvider } from "@clerk/nextjs";

import { GlobalsProvider } from "./components/provider/globals-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {/* <SWRConfig
        value={{
          // See: https://github.com/vercel/swr/issues/1906
          // See: https://x.com/shuding_/status/1794462595719848408
          fallback: {
            "/api/lists": [],
            "/api/items?page=1&limit=10": [],
          },
        }}
      > */}
      <GlobalsProvider>{children}</GlobalsProvider>
      {/* </SWRConfig> */}
    </ClerkProvider>
  );
}
