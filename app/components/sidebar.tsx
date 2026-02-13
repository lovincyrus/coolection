"use client";

import { HomeIcon, ListPlusIcon, StarIcon, Twitter, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";

import { preloadListItems } from "../hooks/use-items-from-list";
import { useLists } from "../hooks/use-lists";
import { useGlobals } from "./provider/globals-provider";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

export function Sidebar() {
  const pathname = usePathname();
  const { data: lists } = useLists(undefined);
  const { sidebarOpen, setSidebarOpen, setOpenNewListDialog } = useGlobals();

  const showSidebar =
    pathname.startsWith("/home") ||
    pathname.startsWith("/lists") ||
    pathname.startsWith("/settings");

  if (!showSidebar) return null;

  const isHome = pathname === "/home";

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col border-r border-dashed bg-white transition-transform duration-200 ease-out md:sticky md:z-0 md:transition-[width,min-width] md:duration-200 ${sidebarOpen ? "translate-x-0 md:min-w-[256px]" : "-translate-x-full md:min-w-0 md:w-0 md:translate-x-0 md:overflow-hidden md:border-0"}`}
      >
        <div className="flex items-center justify-between border-b border-dashed px-3 py-3">
          <span className="text-xs font-medium text-gray-500">Lists</span>
          <Button
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-0.5 p-2">
            <Link
              href="/home"
              onClick={() => {
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isHome
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <HomeIcon className="h-3.5 w-3.5" />
              All Bookmarks
            </Link>

            {lists.map((list) => {
              const isActive = pathname === `/lists/${list.id}`;
              return (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  onMouseEnter={() => preloadListItems(list.id)}
                  onFocus={() => preloadListItems(list.id)}
                  onClick={() => {
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  title={list.name}
                  className={`flex items-center gap-2 truncate rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {list.source === "gh" ? (
                    <StarIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  ) : list.source === "x" ? (
                    <Twitter className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                  ) : null}
                  <span className="truncate">{list.name}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="border-t border-dashed p-2 h-[49px] flex items-center">
          <Button
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={() => setOpenNewListDialog(true)}
          >
            <ListPlusIcon className="h-3.5 w-3.5" />
            New List
          </Button>
        </div>
      </aside>
    </>
  );
}
