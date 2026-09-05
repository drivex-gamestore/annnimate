import { useCallback, useRef } from "react";
import { cn } from '@lib/vendor';
import FlipIndicator from "@animations/components/FlipIndicator"; 

function Tabs({
  tabs,
  activeId,
  onChange,
  ariaLabel = "Tabs",
  className = "",
  fill = false,
  iconSize = "size-12",
}) {
  const containerRef = useRef(null);

  const handleKeyDown = useCallback(
    (event, index) => {
      const tabButtons = containerRef.current?.querySelectorAll("[data-flip-id]");
      if (!tabButtons?.length) return;

      let nextIndex = null;

      switch (event.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % tabButtons.length;
          break;
        case "ArrowLeft":
          nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = tabButtons.length - 1;
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          onChange(tabs[index].id);
          return;
        default:
          return;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        tabButtons[nextIndex]?.focus();
      }
    },
    [onChange, tabs]
  );

  return (
    <div ref={containerRef} className={cn(fill && "w-full")}>
      <FlipIndicator
        activeId={activeId}
        containerClassName={cn(
          "items-stretch overflow-x-auto bg-foreground/[0.04]",
          fill && "w-full",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          className
        )}
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map((tab, index) => {
          const isActive = activeId === tab.id;
          const Icon = tab.Icon;

          return (
            <button
              key={tab.id}
              type="button"
              data-flip-id={tab.id}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              aria-selected={isActive}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "relative z-10 inline-flex items-center gap-8 whitespace-nowrap px-16 py-12 text-mono-sm",
                fill ? "flex-1 justify-center" : "shrink-0",
                "transition-colors duration-(--duration-fast) ease-(--ease-expo-out)",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-foreground/30",
                isActive ? "text-foreground" : "text-foreground/55 hover:text-foreground"
              )}
              style={isActive && tab.color ? { color: tab.color } : undefined}
            >
              {Icon ? (
                <span
                  className={cn("flex shrink-0 items-center justify-center", iconSize)}
                  style={tab.color ? { color: tab.color } : undefined}
                >
                  <Icon className={iconSize} />
                </span>
              ) : null}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </FlipIndicator>
    </div>
  );
}

export default Tabs;