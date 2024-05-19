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
      {parts.map((part, idx) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span
            key={idx}
            className="rounded-sm bg-slate-200 box-decoration-clone"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}
