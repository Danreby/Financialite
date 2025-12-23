import React from "react";

export default function ScrollArea({
  maxHeightClassName = "max-h-[500px]",
  className = "",
  children,
  ...props
}) {
  return (
    <div
      className={`${maxHeightClassName} overflow-y-auto overflow-x-hidden scrollbar-custom ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
