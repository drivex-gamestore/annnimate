"use client";
import React, { useRef, useEffect } from 'react';
import { gsap, SplitText } from '@lib/vendor';
import { useDualLayerScramble } from '@animations/hooks/useDualLayerScramble';

gsap.registerPlugin(SplitText);

export default function FaqAccordionItem({
  q: question,
  a: answer,
  isOpen,
  onToggle,
  isDesktop,
  duration = 0.8,
  ease = "expo.inOut"
}) {
  const answerRef = useRef(null);
  const iconRef = useRef(null);
  const verticalLineRef = useRef(null);
  const timelineRef = useRef(null);
  const splitTextRef = useRef(null);
  const splitTweenRef = useRef(null);
  const wasOpenRef = useRef(false);

  const { ref: scrambleRef, scramble } = useDualLayerScramble({
    duration: 0.5,
    speed: 1,
    firstColorClass: "scramble-brand",
    secondColorClass: "scramble-inherit"
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const answerEl = answerRef.current;
    if (!answerEl) return;

    gsap.set(answerEl, {
      height: 0,
      overflow: "hidden",
      force3D: true
    });

    const timeline = gsap.timeline({
      paused: true,
      defaults: {
        duration,
        ease
      }
    });

    timeline.to(answerEl, {
      height: "auto",
      duration,
      ease
    }, 0);

    if (iconRef.current) {
      timeline.to(iconRef.current, {
        rotation: -180,
        duration,
        ease
      }, 0);
    }

    if (verticalLineRef.current) {
      timeline.to(verticalLineRef.current, {
        opacity: 0,
        duration: 0.5 * duration,
        ease: "power2.inOut"
      }, 0.25 * duration);
    }

    timelineRef.current = timeline;

    return () => {
      timeline.kill();
      splitTweenRef.current?.kill();
      splitTextRef.current?.revert();
    };
  }, [duration, ease]);

  useEffect(() => {
    if (timelineRef.current && isOpen !== wasOpenRef.current) {
      wasOpenRef.current = isOpen;

      if (isOpen) {
        timelineRef.current.play();
        if (isDesktop) scramble();
        
        if (isDesktop && answerRef.current) {
          const timeoutId = window.setTimeout(() => {
            document.fonts?.ready.then(() => {
              const answerEl = answerRef.current;
              if (answerEl) {
                answerEl.querySelectorAll("p").forEach((pNode) => {
                  if (pNode.querySelector(".faq-split-line")) return;
                  
                  splitTextRef.current = SplitText.create(pNode, {
                    type: "lines",
                    mask: "lines",
                    linesClass: "faq-split-line"
                  });
                  
                  const lines = splitTextRef.current.lines;
                  gsap.set(lines, {
                    yPercent: 110,
                    force3D: true
                  });
                  
                  splitTweenRef.current = gsap.to(lines, {
                    yPercent: 0,
                    duration: 0.6,
                    stagger: 0.06,
                    ease: "expo.out",
                    force3D: true
                  });
                });
              }
            });
          }, 180);
          
          return () => window.clearTimeout(timeoutId);
        }
      } else {
        timelineRef.current.reverse();
        splitTweenRef.current?.kill();
        splitTweenRef.current = null;
        splitTextRef.current?.revert();
        splitTextRef.current = null;
      }
    }
  }, [isOpen, isDesktop]);

  return (
    <div className="faq-item border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`group flex w-full cursor-pointer items-start justify-between gap-16 border-0 bg-transparent py-24 text-left transition-colors duration-300 lg:items-center ${isOpen ? "text-foreground" : "text-foreground-muted hover:text-foreground"}`}
      >
        <span ref={scrambleRef} className="text-body-lg">
          {question}
        </span>
        <svg
          ref={iconRef}
          className="h-12 w-12 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            ref={verticalLineRef}
            d="M8 1V15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
          <path
            d="M1 8H15"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        </svg>
      </button>
      <div ref={answerRef}>
        <div className="text-body max-w-[96ch] pb-24 text-foreground-muted">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

// ── SELF-AUDIT ──────────────────────────────────────────────
// source_present:        [FaqAccordionItem]
// source_not_present:    [useDualLayerScramble]
// third_party_deps:      [react, gsap, SplitText]
// plugins_registered:    [SplitText]
// inlined_libraries_detected: []
// derived_import_paths:  [../hooks/useDualLayerScramble: confidence low]
// renamed_identifiers:   [q -> question, a -> answer, i -> isOpen, c -> onToggle, o -> isDesktop, d -> duration, u -> ease, m -> answerRef, h -> iconRef, p -> verticalLineRef, f -> timelineRef, g -> splitTextRef, x -> splitTweenRef, b -> wasOpenRef, y -> scrambleRef, v -> scramble]
// unresolved_keys:       [none]
// fabricated_files_refused: [useDualLayerScramble]
// framework_apis_preserved: [useRef, useEffect]
// ─────────────────────────────────────────────────────────────
