import { useCallback, useEffect, useRef } from "react";
import { gsap, Flip, cn } from '@lib/vendor';

function FlipIndicator({
  activeId,
  pillClassName,
  containerClassName,
  duration = 0.4,
  ease = "expo.inOut",
  children,
  ...rest
}) {
  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const hasMountedRef = useRef(false);
  const positionPill = useCallback((target, opacity = 1) => {
    if (!pillRef.current || !target || !containerRef.current) return;

    const targetRect = target.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    gsap.set(pillRef.current, {
      width: targetRect.width,
      height: targetRect.height,
      x: targetRect.left - containerRect.left,
      y: targetRect.top - containerRect.top,
      opacity,
    });
  }, []);

  
  const animatePillTo = useCallback(
    (target) => {
      if (!pillRef.current || !target || !containerRef.current) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        positionPill(target, 1);
        return;
      }

      const flipState = Flip.getState(pillRef.current);
      positionPill(target, 1);
      Flip.from(flipState, { duration, ease, absolute: true });
    },
    [positionPill, duration, ease]
  );

  useEffect(() => {
    let resizeTimeout;

    const positionToActiveTab = () => {
      const target = containerRef.current?.querySelector(
        `[data-flip-id="${activeId}"]`
      );
      if (target) positionPill(target, 1);
    };

    positionToActiveTab();
    hasMountedRef.current = true;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(positionToActiveTab, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) return;

    const target = containerRef.current?.querySelector(
      `[data-flip-id="${activeId}"]`
    );
    if (target) animatePillTo(target);
  }, [activeId, animatePillTo]);

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex", containerClassName)}
      {...rest}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 top-0 bg-foreground/10 opacity-0",
          pillClassName
        )}
        style={{ zIndex: 1 }}
      />
      {children}
    </div>
  );
}

export default FlipIndicator;