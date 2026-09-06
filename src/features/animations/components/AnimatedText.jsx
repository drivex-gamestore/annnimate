"use client";

import React, { useRef, useState, useEffect } from 'react';
import { gsap, useGSAP, ScrollTrigger, SplitText } from '@lib/vendor';
import { usePageEnterAnimation } from '@hooks/usePageEnterAnimation'; 
import { useAnimation } from '@providers/AnimationProvider';

export default function AnimatedText({
  children,
  type,
  duration = 0.8,
  delay = 0,
  ease = "power4.out",
  mask,
  stagger = 0.05,
  from,
  animationProps,
  triggerMode = "scroll",
  start,
  toggleActions,
  scrollTrigger,
  autoSplit = true,
  deepSlice = true,
  linesClass,
  wordsClass,
  charsClass,
  aria = "none",
  propIndex = false,
  onComplete,
  onSplitCallback,
  onReady,
  className = "",
  tag: Tag = "div",
  revertOnComplete = false,
  ...restProps
}) {
  const containerRef = useRef(null);
  const splitTextInstance = useRef(null);
  const tweenInstance = useRef(null);
  const isPageEnterTriggered = useRef(false);
  
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  let typeVal = type;
  let maskVal = mask;

  if (typeVal === undefined && maskVal === undefined) {
    typeVal = "lines";
    maskVal = "lines";
  }

  const finalSplitType = typeVal || (maskVal ? `${maskVal},words` : "lines,words,chars");
  const initialAnimProps = animationProps || from || { opacity: 0, y: 30 };

  const { getHasTriggered } = useAnimation();

  const markAnimationStarted = () => {
    if (containerRef.current) {
      containerRef.current.setAttribute("data-animation-started", "true");
    }
  };

  usePageEnterAnimation(() => {
    isPageEnterTriggered.current = true;
    markAnimationStarted();
    if (tweenInstance.current) {
      tweenInstance.current.restart(true);
    }
  }, [], "AnimatedText", triggerMode === "pageEnter");

  useEffect(() => {
    if (triggerMode === "pageEnter" && fontsReady && tweenInstance.current && getHasTriggered() && isPageEnterTriggered.current) {
      const timeoutId = setTimeout(() => {
        if (tweenInstance.current) {
          markAnimationStarted();
          tweenInstance.current.restart(true);
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [triggerMode, fontsReady, getHasTriggered]);

  useGSAP(() => {
    if (!containerRef.current || !fontsReady) return;

    const splitConfig = {
      type: finalSplitType,
      aria: aria,
      deepSlice: deepSlice,
      propIndex: propIndex,
      autoSplit: autoSplit,
      ...(maskVal && { mask: maskVal }),
      ...(linesClass && { linesClass: linesClass }),
      ...(wordsClass && { wordsClass: wordsClass }),
      ...(charsClass && { charsClass: charsClass }),
      onSplit(splitResult) {
        splitTextInstance.current = splitResult;
        
        if (onSplitCallback) {
          onSplitCallback(splitResult);
        }

        const splitLevels = finalSplitType.split(",").map(s => s.trim());
        
        const targetElements = splitLevels.includes("chars") && splitResult.chars?.length > 0 
          ? splitResult.chars 
          : splitLevels.includes("words") && splitResult.words?.length > 0 
            ? splitResult.words 
            : splitLevels.includes("lines") && splitResult.lines?.length > 0 
              ? splitResult.lines 
              : [];

        if (targetElements.length === 0) return;

        const tweenConfig = {
          ...initialAnimProps,
          duration: duration,
          delay: delay,
          ease: ease,
          stagger: stagger,
          ...(onComplete && {
            onComplete: () => {
              onComplete();
              if (revertOnComplete && splitResult) {
                splitResult.revert();
              }
            }
          })
        };

        if (triggerMode === "scroll") {
          const scrollTriggerConfig = {
            trigger: containerRef.current,
            start: start || "top 80%",
            ...(typeof scrollTrigger === "object" && scrollTrigger)
          };
          
          if (toggleActions) {
            scrollTriggerConfig.toggleActions = toggleActions;
          }
          
          tweenConfig.scrollTrigger = scrollTriggerConfig;
          tweenInstance.current = gsap.from(targetElements, tweenConfig);
        } else if (triggerMode === "immediate") {
          tweenInstance.current = gsap.from(targetElements, tweenConfig);
        } else {
          tweenInstance.current = gsap.from(targetElements, { ...tweenConfig, paused: true });
          
          if (triggerMode === "pageEnter" && isPageEnterTriggered.current) {
            markAnimationStarted();
            tweenInstance.current.restart(true);
          }
          
          if (triggerMode === "manual" && onReady) {
            onReady(() => {
              if (tweenInstance.current) {
                tweenInstance.current.restart(true);
              }
            });
          }
        }

        return tweenInstance.current;
      }
    };

    splitTextInstance.current = SplitText.create(containerRef.current, splitConfig);

    return () => {
      if (tweenInstance.current) {
        tweenInstance.current.kill();
        tweenInstance.current = null;
      }
      if (splitTextInstance.current) {
        splitTextInstance.current.revert();
        splitTextInstance.current = null;
      }
    };
  }, { scope: containerRef, dependencies: [triggerMode, fontsReady] });

  return (
    <Tag
      ref={containerRef}
      className={className}
      {...(triggerMode === "pageEnter" ? { "data-page-enter-animation": "true" } : {})}
      {...restProps}
    >
      {children}
    </Tag>
  );
}