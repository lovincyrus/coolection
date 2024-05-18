import React from "react";

export function HighlightChars({
  text,
  searchTerm,
}: {
  text: string;
  searchTerm: string;
}) {
  if (!searchTerm) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={i} className="rounded-sm bg-slate-200">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}
