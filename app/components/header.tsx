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
    <div className="max-w-2xl mx-auto w-full">
      <div className="flex flex-row justify-between items-center gap-2">
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5">🍵</div>
          <div className="text-gray-500 text-sm">Coolection</div>
        </div>

        <div className="flex flex-row gap-1">
          {/* <Button
            className="items-center bg-white justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-lg px-3 text-xs ml-auto h-[30px]"
            onClick={() => setToggleSearch(!toggleSearch)}
          >
            <SearchIcon className="h-4 w-4" />
          </Button> */}
          <NewItemDialog />
          <Button
            className="items-center bg-white justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-lg px-3 text-xs ml-auto h-[30px]"
            onClick={() => {
              signOut(() => {
                router.push("/");
                window.location.reload();
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
