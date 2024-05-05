"use client";

import { GlobalsProvider } from "./components/globals-provider";

export function Providers({ children }) {
  return <GlobalsProvider>{children}</GlobalsProvider>;
}
