"use client";

import { GlobalsProvider } from "./components/globals-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <GlobalsProvider>{children}</GlobalsProvider>;
}
