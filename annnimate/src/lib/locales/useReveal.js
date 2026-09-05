import { useRef, useCallback, useEffect } from "react"; // e.i(271645)
import gsap from "gsap"; // e.i(989970)
import { ScrollTrigger } from "gsap/ScrollTrigger"; // e.i(883495)
import { useGSAP } from "@gsap/react"; // e.i(365747)
import { useAnimation } from "../hooks/useAnimation"; // e.i(488463) — SOURCE NOT PRESENT
import { perfMeasure } from "../utils/perfMeasure"; // e.i(991763) — SOURCE NOT PRESENT

gsap.registerPlugin(ScrollTrigger);

// Module-level flag so only one ScrollTrigger.refresh runs per frame
let refreshScheduled = false;

export function useReveal(
  ref,
  {
    mode = "scroll",
    build,
    start = "top 85%",
    inView,
    deps = [],
  } = {}
) {
  const { whenRevealed } = useAnimation();
  const timelineRef = useRef(null);
  const hasPlayedRef = useRef(false);
  const buildRef = useRef(build);
  buildRef.current = build;
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const play = useCallback(() => {
    if (!hasPlayedRef.current && ref.current) {
      hasPlayedRef.current = true;
      if (timelineRef.current) timelineRef.current.restart(true);
    }
  }, [ref]);

  // Build the timeline whenever deps / mode / start change
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !buildRef.current) return;

      const tl = buildRef.current(el);
      timelineRef.current = tl;

      // If we already decided to play (e.g. race with effect), restart now
      if (hasPlayedRef.current) tl.restart(true);

      return () => {
        tl?.kill();
        timelineRef.current = null;
      };
    },
    {
      scope: ref,
      dependencies: [mode, start, ...deps],
    }
  );

  // Schedule play based on mode
  useEffect(() => {
    if (mode === "manual") return;

    let trigger = null;
    let rafId = 0;

    const unsubscribe = whenRevealed(() => {
      // Reduced motion → jump to end
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        hasPlayedRef.current = true;
        if (timelineRef.current) timelineRef.current.progress(1);
        return;
      }

      if (mode === "hero" || isInView()) {
        play();
      } else {
        rafId = requestAnimationFrame(() => {
          if (!ref.current) return;
          if (isInView()) {
            play();
            return;
          }
          trigger = ScrollTrigger.create({
            trigger: ref.current,
            start,
            once: true,
            onEnter: play,
          });
          // Coalesce refresh to one per frame
          if (!refreshScheduled) {
            refreshScheduled = true;
            requestAnimationFrame(() => {
              refreshScheduled = false;
              perfMeasure(
                `ScrollTrigger.refresh (${ScrollTrigger.getAll().length} triggers)`,
                () => ScrollTrigger.refresh()
              );
            });
          }
        });
      }
    });

    return () => {
      unsubscribe();
      if (rafId) cancelAnimationFrame(rafId);
      trigger?.kill();
    };
  }, [whenRevealed, mode, start, isInView, play, ref]);

  return {
    play,
    reveal: play,
  };
}
