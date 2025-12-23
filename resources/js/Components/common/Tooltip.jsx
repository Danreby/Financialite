import React from "react";

export default function Tooltip({ label, position = "top", children }) {
  if (!label) return children;

  let positionClasses = "";

  switch (position) {
    case "bottom":
      positionClasses = "top-full left-1/2 mt-2 -translate-x-1/2";
      break;
    case "left":
      positionClasses = "right-full top-1/2 mr-2 -translate-y-1/2";
      break;
    case "right":
      positionClasses = "left-full top-1/2 ml-2 -translate-y-1/2";
      break;
    case "top":
    default:
      positionClasses = "bottom-full left-1/2 mb-2 -translate-x-1/2";
      break;
  }

  return (
    <div className="relative inline-flex group">
      {children}
      <div
        className={`pointer-events-none absolute z-30 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-gray-100 shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition ${positionClasses}`}
      >
        {label}
      </div>
    </div>
  );
}
