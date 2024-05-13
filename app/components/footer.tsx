import React from "react";

import { cn } from "@/lib/utils";

export function Footer({ type = "root" }: { type?: "home" | "root" }) {
  return (
    <div className="h-[49px] w-full border-t bg-gray-100/60 p-4 text-xs">
      <div
        className={cn(
          "mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-2 text-gray-500 xl:max-w-4xl",
          type === "home" ? "2xl:max-w-6xl" : "",
        )}
      >
        <div>&#169; {new Date().getFullYear()} Coolection</div>
      </div>
    </div>
  );
}
