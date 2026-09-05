import { useRef, useCallback, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useAnimation } from '@providers/AnimationProvider';
import { perfMeasure } from '@shared/performance';

gsap.registerPlugin(ScrollTrigger);
let isRefreshing = false;

export function useReveal(ref, { 
  mode = "scroll", 
  build, 
  start = "top 85%", 
  inView, 
  deps = [] 
} = {}) {
  const { whenRevealed } = useAnimation();
  const animRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  
  const buildRef = useRef(build);
  buildRef.current = build;
  
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const checkInView = useCallback(() => {
    if (inViewRef.current) return inViewRef.current();
    
    const el = ref.current;
    if (!el) return false;
    
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    
    return rect.top < 0.9 * vh && rect.bottom > 0;
  }, [ref]);

  const play = useCallback(() => {
    if (!hasTriggeredRef.current && ref.current) {
      hasTriggeredRef.current = true;
      if (animRef.current) {
        animRef.current.restart(true);
      }
    }
  }, [ref]);

  useGSAP(() => {
    const el = ref.current;
    if (!el || !buildRef.current) return;
    
    const anim = buildRef.current(el);
    animRef.current = anim;
    
    if (hasTriggeredRef.current && anim) {
      anim.restart(true);
    }
    
    return () => {
      anim?.kill();
      animRef.current = null;
    };
  }, { scope: ref, dependencies: [mode, start, ...deps] });

  useEffect(() => {
    if (mode === "manual") return;
    
    let st = null;
    let rafId = 0;
    
    const unsubscribe = whenRevealed(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        hasTriggeredRef.current = true;
        if (animRef.current) {
          animRef.current.progress(1);
        }
        return;
      }
      
      if (mode === "hero" || checkInView()) {
        play();
      } else {
        rafId = requestAnimationFrame(() => {
          if (ref.current) {
            if (checkInView()) {
              play();
              return;
            }
            
            st = ScrollTrigger.create({
              trigger: ref.current,
              start: start,
              once: true,
              onEnter: play
            });
            
            if (!isRefreshing) {
              isRefreshing = true;
              requestAnimationFrame(() => {
                isRefreshing = false;
                perfMeasure(`ScrollTrigger.refresh (${ScrollTrigger.getAll().length} triggers)`, () => {
                  ScrollTrigger.refresh();
                });
              });
            }
          }
        });
      }
    });
    
    return () => {
      unsubscribe();
      if (rafId) cancelAnimationFrame(rafId);
      st?.kill();
    };
  }, [whenRevealed, mode, start, checkInView, play, ref]);

  return { play, reveal: play };
}