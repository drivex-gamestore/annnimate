"use client";

import React, { useRef, useCallback, useEffect } from "react";
import { gsap, Flip, cn } from "@lib/vendor"; 


export default function SegmentedControl({
  activeId,
  pillClassName,
  containerClassName,
  duration = 0.4,
  ease = "expo.inOut",
  children,
  ...restProps
}) {
  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const isInitialized = useRef(false);

  const updatePillPosition = useCallback((targetEl, opacity = 1) => {
    if (!pillRef.current || !targetEl || !containerRef.current) return;
    
    const targetBounds = targetEl.getBoundingClientRect();
    const containerBounds = containerRef.current.getBoundingClientRect();
    
    gsap.set(pillRef.current, {
      width: targetBounds.width,
      height: targetBounds.height,
      x: targetBounds.left - containerBounds.left,
      y: targetBounds.top - containerBounds.top,
      opacity: opacity
    });
  }, []);

  const animatePill = useCallback((targetEl) => {
    if (!pillRef.current || !targetEl || !containerRef.current) return;
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      updatePillPosition(targetEl, 1);
      return;
    }
    
    const state = Flip.getState(pillRef.current);
    updatePillPosition(targetEl, 1);
    
    Flip.from(state, {
      duration: duration,
      ease: ease,
      absolute: true
    });
  }, [updatePillPosition, duration, ease]);

  
  useEffect(() => {
    let timeoutId;
    
    const initPosition = () => {
      const targetEl = containerRef.current?.querySelector(`[data-flip-id="${activeId}"]`);
      if (targetEl) {
        updatePillPosition(targetEl, 1);
      }
    };
    
    initPosition();
    isInitialized.current = true;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(initPosition, 200);
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeId, updatePillPosition]);

  
  useEffect(() => {
    if (!isInitialized.current) return;
    
    const targetEl = containerRef.current?.querySelector(`[data-flip-id="${activeId}"]`);
    if (targetEl) {
      animatePill(targetEl);
    }
  }, [activeId, animatePill]);

  return (
    <div 
      ref={containerRef} 
      className={cn("relative inline-flex", containerClassName)} 
      {...restProps}
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        className={cn("pointer-events-none absolute left-0 top-0 bg-foreground/10 opacity-0", pillClassName)}
        style={{ zIndex: 1 }}
      />
      {children}
    </div>
  );
}