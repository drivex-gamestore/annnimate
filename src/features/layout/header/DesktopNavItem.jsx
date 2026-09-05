import { cn } from '@lib/vendor';
import { useScramble } from '@animations/hooks/useScramble'; 
import { useTransitionClick } from '@hooks/useTransitionClick';
import NavLink from '@components/NavLink'; 

export function DesktopNavItem({
  item,
  href,
  badge,
  active,
  expanded,
  setRef,
  onMouseEnter,
  onClick
}) {
  const { ref: scrambleRef, scramble } = useScramble({
    duration: 0.5,
    firstColorClass: "scramble-brand",
    secondColorClass: "scramble-inherit"
  });
  
  const transitionClick = useTransitionClick(href || "", { onClick });

  return (
    <NavLink
      href={href || "#"}
      ref={setRef}
      aria-expanded={expanded || false}
      aria-haspopup="true"
      onMouseEnter={() => {
        scramble();
        onMouseEnter?.();
      }}
      onClick={transitionClick}
      className={cn(
        "text-mono relative flex h-full cursor-pointer items-center justify-center text-center transition-colors duration-200",
        active ? "text-foreground" : "text-foreground-muted hover:text-foreground"
      )}
    >
      <span className="relative inline-flex items-center">
        <span ref={scrambleRef}>{item.label}</span>
        {badge ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-full -translate-y-full text-accent-2xs text-brand whitespace-nowrap"
          >
            {badge}
          </span>
        ) : null}
      </span>
    </NavLink>
  );
}
