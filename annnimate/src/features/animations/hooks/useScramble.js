import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

const ASCII_CHARS = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

export function useScramble({
  duration = 0.5,
  speed = 1,
  chars = ASCII_CHARS,
  firstColorClass = "scramble-brand",
  secondColorClass = "scramble-inherit"
} = {}) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const originalText = useRef("");
  const isAnimating = useRef(false);

  useEffect(() => {
    if (containerRef.current) {
      originalText.current = containerRef.current.innerText ?? "";
    }
  }, []);

  const resetStyle = useCallback(() => {
    if (containerRef.current) {
      gsap.set(containerRef.current, { clearProps: "width,height,display,overflow,whiteSpace" });
    }
  }, []);

  const killAnimation = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
    isAnimating.current = false;
    resetStyle();
  }, [resetStyle]);

  const scramble = useCallback((newText) => {
    const el = containerRef.current;
    if (!el || isAnimating.current) return;

    const targetText = typeof newText === "string" ? newText : (originalText.current || el.innerText || "");
    if (targetText.trim().length === 0) return;

    originalText.current = targetText;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.innerText = targetText;
      return;
    }

    killAnimation();
    isAnimating.current = true;

    gsap.set(el, { width: "auto", height: "auto", display: "inline-block", whiteSpace: "nowrap" });
    gsap.set(el, { width: el.offsetWidth, height: el.offsetHeight, display: "inline-block", overflow: "hidden", whiteSpace: "nowrap" });

    const nonSpaceCount = targetText.replace(/\s/g, "").length;
    const secondAnimDelay = nonSpaceCount > 0 ? duration / nonSpaceCount : 0;

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
        timelineRef.current = null;
        resetStyle();
      }
    });

    timelineRef.current.to(el, {
      duration,
      scrambleText: { text: targetText, chars, speed, revealDelay: 0.1, oldClass: firstColorClass, newClass: firstColorClass },
      ease: "none"
    }).to(el, {
      duration,
      scrambleText: { text: targetText, chars, speed, revealDelay: 0.1, oldClass: firstColorClass, newClass: secondColorClass },
      ease: "none"
    }, secondAnimDelay);

  }, [duration, speed, chars, firstColorClass, secondColorClass, killAnimation, resetStyle]);

  useEffect(() => killAnimation, [killAnimation]);

  return { ref: containerRef, scramble, kill: killAnimation };
}