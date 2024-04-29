import React from "react";

export function Footer() {
  return (
    <div className="p-4 text-xs bg-gray-100 border-t w-full">
      <div className="max-w-xl mx-auto w-full text-gray-500 justify-between flex items-center gap-2 flex-wrap">
        <div>&#169; {new Date().getFullYear()} Coolection</div>
      </div>
    </div>
  );
}
