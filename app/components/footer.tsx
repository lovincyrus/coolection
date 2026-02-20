import { Link } from "next-view-transitions";
import React from "react";

import { cn } from "@/lib/utils";

export function Footer({ type = "root" }: { type?: "home" | "root" }) {
  return (
    <div className="h-[49px] w-full border-t bg-surface p-4 text-xs">
      <div
        className={cn(
          "mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-2 text-text-tertiary",
          type === "home" ? "xl:max-w-4xl 2xl:max-w-6xl" : "",
        )}
      >
        <div>&#169; {new Date().getFullYear()} Coolection</div>
        <div className="flex items-center gap-3">
          <Link
            href="/privacy"
            className="font-medium no-underline hover:underline"
          >
            Privacy
          </Link>
          <span aria-hidden="true">&middot;</span>
          <a
            href="https://github.com/lovincyrus/coolection"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium no-underline hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
