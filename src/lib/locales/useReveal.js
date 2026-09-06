import { useRef, useCallback, useEffect } from "react"; 
import gsap from "gsap"; 
import { ScrollTrigger } from "gsap/ScrollTrigger"; 
import { useGSAP } from "@gsap/react"; 
import { useAnimation } from "../hooks/useAnimation"; 
import { perfMeasure } from "../utils/perfMeasure"; 

gsap.registerPlugin(ScrollTrigger);


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

  
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !buildRef.current) return;

      const tl = buildRef.current(el);
      timelineRef.current = tl;

      
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

  
  useEffect(() => {
    if (mode === "manual") return;

    let trigger = null;
    let rafId = 0;

    const unsubscribe = whenRevealed(() => {
      
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
