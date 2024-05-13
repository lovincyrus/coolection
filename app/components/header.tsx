"use client";

import { useClerk } from "@clerk/clerk-react";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { NewItemDialog } from "./new-item-dialog";
import { Button } from "./ui/button";

export function Header() {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-2xl xl:max-w-4xl 2xl:max-w-6xl">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row items-center space-x-0">
          <div className="flex h-8 w-8 items-center justify-center text-2xl">
            🍵
          </div>
          {/* <div className="text-gray-500 text-sm">Coolection</div> */}
        </div>

        <div className="flex flex-row gap-1">
          <NewItemDialog />
          <Button
            className="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground ml-auto h-[30px] items-center justify-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
            onClick={() => {
              signOut(() => {
                router.push("/");
                router.refresh();
              });
            }}
          >
            <LogOutIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
