import React from 'react';

const SIZES = {
  sm: {
    rect: "size-8 mt-[0.35em]",
    gap: "gap-12",
    text: "text-body leading-snug"
  },
  default: {
    rect: "size-12 mt-[0.4em]",
    gap: "gap-16",
    text: "text-body-lg leading-snug"
  }
};

export default function Checklist({
  items = [],
  size = "sm",
  className = "",
  itemClassName = ""
}) {
  const selectedSize = SIZES[size] ?? SIZES.sm;

  return (
    <ul className={`m-0 list-none space-y-2 p-0 ${className}`}>
      {items.map((item, index) => {
        const normalizedItem = typeof item === "string" ? { label: item } : item;
        const textColor = normalizedItem.muted ? "text-foreground/40" : "text-foreground-muted";
        const rectColor = normalizedItem.muted ? "bg-brand/40" : "bg-brand";

        return (
          <li
            
            key={index}
            className={`flex items-start ${selectedSize.gap} ${selectedSize.text} ${textColor} ${itemClassName} ${normalizedItem.className || ""}`}
          >
            <span
              className={`block shrink-0 ${selectedSize.rect} ${rectColor}`}
              aria-hidden="true"
            />
            <span>{normalizedItem.label}</span>
          </li>
        );
      })}
    </ul>
  );
}