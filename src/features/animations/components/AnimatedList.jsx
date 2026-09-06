"use client";

import React, { useRef, Children } from "react";
import { gsap } from "@lib/vendor";
import { useReveal } from "@hooks/useReveal"; 

export default function AnimatedList({
  children,
  className = "",
  tag: Tag = "ul",
  itemClassName = "",
  duration = 0.6,
  stagger = 0.08,
  delay = 0,
  ease = "power2.out",
  start = "top 80%",
  trigger = "scroll"
}) {
  const containerRef = useRef(null);

  useReveal(containerRef, {
    mode: trigger === "pageEnter" ? "hero" : "scroll",
    build: (element) => {
      const sliderItems = element.querySelectorAll("[data-anm-list-slider]");
      const tl = gsap.timeline({ paused: true });
      
      if (sliderItems.length) {
        tl.from(sliderItems, {
          yPercent: 100,
          duration: duration,
          stagger: stagger,
          delay: delay,
          ease: ease
        });
      }
      
      return tl;
    },
    start: start,
    deps: [duration, stagger, delay, ease, trigger]
  });

  const validChildren = Children.toArray(children).filter(Boolean);

  return (
    <Tag ref={containerRef} className={className}>
      {validChildren.map((child, index) => (
        
        <li key={index} className={`overflow-hidden ${itemClassName}`.trim()}>
          <span data-anm-list-slider={true} className="block">
            {child}
          </span>
        </li>
      ))}
    </Tag>
  );
}

