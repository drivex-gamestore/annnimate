import React, { useRef, useState, useEffect } from 'react';
import { gsap, useGSAP, ScrollTrigger, SplitText } from '@lib/vendor';
import { usePageEnterAnimation } from '@hooks/useAnimation'; 
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
  ...rest
}) {
  const containerRef = useRef(null);
  const splitInstanceRef = useRef(null);
  const animRef = useRef(null);
  const isPageEnterTriggeredRef = useRef(false);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  let resolvedType = type;
  let resolvedMask = mask;
  
  if (resolvedType === undefined && resolvedMask === undefined) {
    resolvedType = "lines";
    resolvedMask = "lines";
  }
  
  const splitType = resolvedType || (resolvedMask ? `${resolvedMask},words` : "lines,words,chars");
  const animConfig = animationProps || from || { opacity: 0, y: 30 };
  
  const { getHasTriggered } = useAnimation();
  
  const markAnimationStarted = () => {
    if (containerRef.current) {
      containerRef.current.setAttribute("data-animation-started", "true");
    }
  };

  usePageEnterAnimation(() => {
    isPageEnterTriggeredRef.current = true;
    markAnimationStarted();
    if (animRef.current) animRef.current.restart(true);
  }, [], "AnimatedText", triggerMode === "pageEnter");

  useEffect(() => {
    if (triggerMode === "pageEnter" && fontsReady && animRef.current && getHasTriggered() && isPageEnterTriggeredRef.current) {
      const timeoutId = setTimeout(() => {
        if (animRef.current) {
          markAnimationStarted();
          animRef.current.restart(true);
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [triggerMode, fontsReady, getHasTriggered]);

  useGSAP(() => {
    if (!containerRef.current || !fontsReady) return;
    
    const splitOptions = {
      type: splitType,
      aria,
      deepSlice,
      propIndex,
      autoSplit,
      ...(resolvedMask && { mask: resolvedMask }),
      ...(linesClass && { linesClass }),
      ...(wordsClass && { wordsClass }),
      ...(charsClass && { charsClass }),
      onSplit(splitInstance) {
        splitInstanceRef.current = splitInstance;
        if (onSplitCallback) onSplitCallback(splitInstance);
        
        const splitTypesArray = splitType.split(",").map(t => t.trim());
        let targets;
        
        if (splitTypesArray.includes("chars") && splitInstance.chars?.length > 0) {
          targets = splitInstance.chars;
        } else if (splitTypesArray.includes("words") && splitInstance.words?.length > 0) {
          targets = splitInstance.words;
        } else if (splitTypesArray.includes("lines") && splitInstance.lines?.length > 0) {
          targets = splitInstance.lines;
        } else {
          targets = [];
        }
        
        if (targets.length === 0) return;
        
        const fromConfig = {
          ...animConfig,
          duration,
          delay,
          ease,
          stagger,
          ...(onComplete && {
            onComplete: () => {
              onComplete();
              if (revertOnComplete && splitInstance) {
                splitInstance.revert();
              }
            }
          })
        };

        if (triggerMode === "scroll") {
          const stConfig = {
            trigger: containerRef.current,
            start: start || "top 80%",
            ...(typeof scrollTrigger === "object" && scrollTrigger)
          };
          
          if (toggleActions) {
            stConfig.toggleActions = toggleActions;
          }
          
          fromConfig.scrollTrigger = stConfig;
          animRef.current = gsap.from(targets, fromConfig);
          
        } else if (triggerMode === "immediate") {
          animRef.current = gsap.from(targets, fromConfig);
        } else {
          animRef.current = gsap.from(targets, { ...fromConfig, paused: true });
          
          if (triggerMode === "pageEnter" && isPageEnterTriggeredRef.current) {
            markAnimationStarted();
            animRef.current.restart(true);
          }
          
          if (triggerMode === "manual" && onReady) {
            onReady(() => {
              if (animRef.current) {
                animRef.current.restart(true);
              }
            });
          }
        }
        
        return animRef.current;
      }
    };
    
    splitInstanceRef.current = SplitText.create(containerRef.current, splitOptions);
    
    return () => {
      if (animRef.current) {
        animRef.current.kill();
        animRef.current = null;
      }
      if (splitInstanceRef.current) {
        splitInstanceRef.current.revert();
        splitInstanceRef.current = null;
      }
    };
  }, { scope: containerRef, dependencies: [triggerMode, fontsReady] });

  return (
    <Tag
      ref={containerRef}
      className={className}
      data-page-enter-animation={triggerMode === "pageEnter" ? "true" : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}