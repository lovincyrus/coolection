"use client";

import { HomeIcon, ListPlusIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import React, { Suspense } from "react";

import { useLists } from "../hooks/use-lists";
import { useGlobals } from "./provider/globals-provider";
import { ScrollArea } from "./ui/scroll-area";

const SIDEBAR_ROUTES = ["/home", "/lists", "/settings"];

export function Sidebar() {
  const pathname = usePathname();
  const showSidebar = SIDEBAR_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!showSidebar) return null;

  return (
    <Suspense fallback={null}>
      <SidebarContent />
    </Suspense>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const { data: lists } = useLists({});
  const { sidebarOpen, setSidebarOpen, setOpenNewListDialog } = useGlobals();

  const isHome = pathname === "/home";
  const closeMobile = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col border-r border-dashed bg-white transition-transform duration-200 ease-out md:relative md:z-0 md:transition-[width,min-width] md:duration-200 ${sidebarOpen ? "translate-x-0 md:min-w-[256px]" : "-translate-x-full md:min-w-0 md:w-0 md:translate-x-0 md:overflow-hidden md:border-0"}`}
      >
        <div className="flex items-center justify-between border-b border-dashed px-3 py-3">
          <span className="text-xs font-medium text-gray-500">Lists</span>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-0.5 p-2">
            <Link
              href="/home"
              onClick={closeMobile}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isHome
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <HomeIcon className="h-3.5 w-3.5" />
              All Bookmarks
            </Link>

            {Array.isArray(lists) &&
              lists.map((list) => {
                const isActive = pathname === `/lists/${list.id}`;
                return (
                  <Link
                    key={list.id}
                    href={`/lists/${list.id}`}
                    onClick={closeMobile}
                    title={list.name}
                    className={`truncate rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {list.name}
                  </Link>
                );
              })}
          </nav>
        </ScrollArea>

        <div className="border-t border-dashed p-2">
          <button
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={() => setOpenNewListDialog(true)}
          >
            <ListPlusIcon className="h-3.5 w-3.5" />
            New List
          </button>
        </div>
      </aside>
    </>
  );
}
