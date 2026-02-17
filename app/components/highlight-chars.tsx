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

  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <span>
      {parts.map((part, idx) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span
            key={idx}
            className="rounded-sm bg-highlight box-decoration-clone"
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
