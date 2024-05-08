import React from "react";

export function Footer() {
  return (
    <div className="w-full border-t bg-gray-100/60 p-4 text-xs">
      <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-2 text-gray-500">
        <div>&#169; {new Date().getFullYear()} Coolection</div>
      </div>
    </div>
  );
}
