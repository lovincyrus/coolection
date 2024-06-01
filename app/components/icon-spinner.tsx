import React from "react";

const bars = Array(12).fill(0);

export function Spinner({
  color,
  size = 20,
}: {
  color: string;
  size?: number;
}) {
  return (
    <div
      className="h-[16px] w-[16px]"
      style={
        {
          "--spinner-size": `${size}px`,
          "--spinner-color": color,
        } as React.CSSProperties
      }
    >
      <div className="relative left-2/4 top-2/4 h-[16px] w-[16px]">
        {bars.map((_, i) => (
          <div className="bar" key={`spinner-bar-${i}`} />
        ))}
      </div>
    </div>
  );
}
