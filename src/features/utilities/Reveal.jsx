"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "@lib/vendor";

import { useReveal } from "@hooks/useReveal";

export default function Reveal({
  as: Tag = "div",
  children,
  className = "",
  y = 16,
  duration = 0.7,
  ease = "power2.out",
  delay = 0,
  stagger = 0,
  trigger = "pageEnter",
  start = "top 85%",
  enabled = true,
  onReady,
  ...restProps
}) {
  const containerRef = useRef(null);

  const { play } = useReveal(containerRef, {
    mode: trigger === "pageEnter" ? "hero" : trigger === "manual" ? "manual" : "scroll",
    build: enabled ? (element) => {
      const targets = stagger > 0 ? Array.from(element.children) : [element];
      
      return gsap.timeline({ paused: true }).fromTo(
        targets,
        { autoAlpha: 0, y: y },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration,
          ease: ease,
          delay: delay,
          stagger: stagger
        }
      );
    } : null,
    start: start,
    deps: [enabled, y, duration, ease, delay, stagger]
  });

  useEffect(() => {
    if (trigger === "manual" && enabled && onReady) {
      onReady(play);
    }
  }, [trigger, enabled, onReady, play]);

  return (
    <Tag ref={containerRef} className={className} {...restProps}>
      {children}
    </Tag>
  );
}