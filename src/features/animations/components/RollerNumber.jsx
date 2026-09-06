"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@lib/vendor";
import { usePageEnterAnimation } from '@hooks/usePageEnterAnimation'; 

const debugLog = (...args) => {};
export default function RollerNumber({
  value,
  className = "",
  suffix = "",
  minDigits = 2,
  triggerMode = "immediate",
  delay = 0,
  duration = 2,
  valueChangeDuration = 1.5,
  ease = "expo.inOut",
  onReady
}) {
  const containerRef = useRef(null);
  const previousValueRef = useRef(0);
  const prevDigitsLengthRef = useRef(0);
  const hasInitialAnimatedRef = useRef(false);
  
  const [shouldAnimate, setShouldAnimate] = useState(triggerMode === "immediate");
  
  const pageEnterTriggeredRef = useRef(false);
  const currentValueRef = useRef(value);
  const timelineRef = useRef(null);

  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  const targetDigits = useMemo(() => {
    const digits = Math.round(value).toString().split("").map(Number);
    while (digits.length < minDigits) {
      digits.unshift(0);
    }
    return digits;
  }, [value, minDigits]);

  useMemo(() => {
    const prevDigits = Math.round(previousValueRef.current).toString().split("").map(Number);
    while (prevDigits.length < targetDigits.length) {
      prevDigits.unshift(0);
    }
    return prevDigits;
  }, [targetDigits.length]);

  debugLog(`mount/update: value=${value}, triggerMode=${triggerMode}, shouldAnimate=${shouldAnimate}, enabled=${triggerMode === "pageEnter"}`);

  usePageEnterAnimation(
    () => {
      const currentVal = currentValueRef.current;
      debugLog(`pageEnter callback fired! currentValue=${currentVal}, setting pageEnterTriggered=true`);
      pageEnterTriggeredRef.current = true;
      
      if (currentVal > 0) {
        debugLog("  -> value > 0, setting shouldAnimate=true after RAF");
        requestAnimationFrame(() => {
          debugLog("  -> RAF fired, now setting shouldAnimate=true");
          setShouldAnimate(true);
        });
      } else {
        debugLog("  -> value is 0, NOT setting shouldAnimate yet");
      }
    },
    [],
    "RollerNumber",
    triggerMode === "pageEnter"
  );

  useEffect(() => {
    debugLog(`value effect: value=${value}, pageEnterTriggered=${pageEnterTriggeredRef.current}, shouldAnimate=${shouldAnimate}`);
    if (triggerMode === "pageEnter" && pageEnterTriggeredRef.current && value > 0 && !shouldAnimate) {
      debugLog("  -> conditions met, setting shouldAnimate=true");
      setShouldAnimate(true);
    }
  }, [value, triggerMode, shouldAnimate]);

  useGSAP(() => {
    if (triggerMode === "scroll" && containerRef.current) {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        once: true,
        onEnter: () => {
          debugLog("ScrollTrigger fired! Setting shouldAnimate=true");
          setShouldAnimate(true);
        }
      });
    }
  }, { scope: containerRef, dependencies: [triggerMode] });

  useEffect(() => {
    if (triggerMode === "manual" && onReady) {
      onReady(() => setShouldAnimate(true));
    }
  }, [triggerMode, onReady]);

  useGSAP(() => {
    debugLog(`useGSAP: shouldAnimate=${shouldAnimate}, value=${value}`);
    if (!shouldAnimate) {
      debugLog("  -> shouldAnimate is false, skipping animation");
      return;
    }

    const rollers = containerRef.current?.querySelectorAll("[data-roller]");
    if (!rollers || rollers.length === 0) {
      debugLog("  -> no rollers found, skipping");
      return;
    }

    debugLog(`  -> found ${rollers.length} rollers, animating!`);

    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }

    const isInitialAnimation = previousValueRef.current === 0 && value > 0;

    if (!hasInitialAnimatedRef.current && isInitialAnimation) {
      hasInitialAnimatedRef.current = true;
      prevDigitsLengthRef.current = targetDigits.length;
      
      const tl = gsap.timeline({
        onComplete: () => {
          prevDigitsLengthRef.current = targetDigits.length;
          previousValueRef.current = value;
          timelineRef.current = null;
        }
      });
      timelineRef.current = tl;

      rollers.forEach((rollerNode, index) => {
        const digit = targetDigits[index];
        const innerNode = rollerNode.querySelector(".roller-inner");
        if (innerNode) {
          gsap.set(innerNode, { y: "-10em" });
          tl.to(
            innerNode,
            { y: `${-20 - digit}em`, duration: duration, delay: delay, ease: ease },
            (targetDigits.length - 1 - index) * 0.08
          );
        }
      });
    } else if (hasInitialAnimatedRef.current && previousValueRef.current !== value) {
      previousValueRef.current = value;
      prevDigitsLengthRef.current = targetDigits.length;
      
      rollers.forEach((rollerNode, index) => {
        const digit = targetDigits[index];
        const innerNode = rollerNode.querySelector(".roller-inner");
        if (innerNode) {
          gsap.to(
            innerNode,
            {
              y: `${-20 - digit}em`,
              duration: valueChangeDuration,
              ease: ease,
              overwrite: "auto",
              delay: (targetDigits.length - 1 - index) * 0.05
            }
          );
        }
      });
    }
  }, { scope: containerRef, dependencies: [value, targetDigits.length, shouldAnimate] });

  const digitList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <div
      ref={containerRef}
      className={`flex justify-start items-start overflow-hidden leading-none ${className}`}
      style={{ height: "0.9em" }}
    >
      {targetDigits.map((digit, index) => (
        <div
          key={`${index}-${targetDigits.length}`}
          data-roller={true}
          className="flex flex-col justify-start items-center overflow-hidden relative"
          style={{ width: "1ch" }}
        >
          <div className="roller-inner flex flex-col will-change-transform">
            {digitList.map((num) => (
              <div key={`a-${num}`} className="flex justify-center items-center leading-none" style={{ height: "1em", fontVariantNumeric: "tabular-nums" }}>
                {num}
              </div>
            ))}
            {digitList.map((num) => (
              <div key={`b-${num}`} className="flex justify-center items-center leading-none" style={{ height: "1em", fontVariantNumeric: "tabular-nums" }}>
                {num}
              </div>
            ))}
            {digitList.map((num) => (
              <div key={`c-${num}`} className="flex justify-center items-center leading-none" style={{ height: "1em", fontVariantNumeric: "tabular-nums" }}>
                {num}
              </div>
            ))}
          </div>
        </div>
      ))}
      {suffix && (
        <div className="flex items-center ml-[0.1em]">
          <div className="flex justify-center items-center leading-none" style={{ height: "1em", fontVariantNumeric: "tabular-nums" }}>
            {suffix}
          </div>
        </div>
      )}
    </div>
  );
}