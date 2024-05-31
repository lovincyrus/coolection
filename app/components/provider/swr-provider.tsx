"use client";

import { SWRConfig } from "swr";

import { getLists } from "@/app/data";

export const SWRProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          // Note that there is no `await` here,
          // so it only blocks rendering of components that
          // actually rely on this data.
          // https://github.com/shuding/swr-rsc-example/blob/main/app/page.tsx
          lists: getLists(),
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};
