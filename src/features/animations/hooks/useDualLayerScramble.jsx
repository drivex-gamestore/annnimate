"use client";
import { useRef, useEffect, useCallback } from 'react';
import { gsap } from '@lib/vendor'; 
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { defaultChars as ASCII_CHARS } from '@config/defaultChars'; 

gsap.registerPlugin(ScrambleTextPlugin);

export function useDualLayerScramble(options = {}) {
  const elementRef = useRef(null);
  const timelineRef = useRef(null);
  const originalTextRef = useRef("");
  const originalHtmlRef = useRef("");
  const originalSizeRef = useRef(null);
  const linesDataRef = useRef([]);
  const spanNodesRef = useRef([]);
  const isAnimatingRef = useRef(false);
  const isPreparedRef = useRef(false);

  useEffect(() => {
    if (!elementRef.current) return;
    
    const el = elementRef.current;
    const text = el.innerText ?? "";
    
    if (text.trim().length > 0) {
      originalTextRef.current = text;
      originalHtmlRef.current = el.innerHTML;
      originalSizeRef.current = {
        width: el.offsetWidth,
        height: el.offsetHeight
      };
    }
  }, []);

  const killTimeline = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
      isAnimatingRef.current = false;
    }
  }, []);

  const prepare = useCallback(() => {
    if (!elementRef.current || isPreparedRef.current) return;
    
    const el = elementRef.current;
    if ((originalTextRef.current || el.innerText || "").trim().length === 0) return;
    
    if (!originalSizeRef.current) {
      originalSizeRef.current = {
        width: el.offsetWidth,
        height: el.offsetHeight
      };
    }

    const extractLines = function(element) {
      const text = element.innerText || "";
      if (text.trim().length === 0) return [];
      if (text.includes("\n")) return text.split("\n").filter(line => line.length > 0);
      
      const firstChild = element.firstChild;
      if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) return [text];
      
      const range = document.createRange();
      const lines = [];
      let currentLine = "";
      let lastTop = null;
      const length = firstChild.length;
      
      for (let i = 0; i < text.length && i < length; i++) {
        range.setStart(firstChild, i);
        range.setEnd(firstChild, i + 1);
        const rect = range.getBoundingClientRect();
        
        if (lastTop !== null && Math.abs(rect.top - lastTop) > 2) {
          if (currentLine.length > 0) lines.push(currentLine);
          currentLine = "";
        }
        currentLine += text[i];
        lastTop = rect.top;
      }
      
      if (currentLine.length > 0) lines.push(currentLine);
      return lines.length > 0 ? lines : [text];
    };

    const lines = extractLines(el);
    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.cssText = "position: absolute; visibility: hidden; pointer-events: none; white-space: nowrap;";
    
    const computedStyle = window.getComputedStyle(el);
    hiddenDiv.style.font = computedStyle.font;
    hiddenDiv.style.fontSize = computedStyle.fontSize;
    hiddenDiv.style.fontFamily = computedStyle.fontFamily;
    hiddenDiv.style.fontWeight = computedStyle.fontWeight;
    hiddenDiv.style.letterSpacing = computedStyle.letterSpacing;
    hiddenDiv.style.textTransform = computedStyle.textTransform;
    document.body.appendChild(hiddenDiv);
    
    linesDataRef.current = lines.map(lineText => {
      hiddenDiv.textContent = lineText;
      return {
        text: lineText,
        width: hiddenDiv.offsetWidth,
        height: hiddenDiv.offsetHeight
      };
    });
    
    document.body.removeChild(hiddenDiv);

    const maxWidth = Math.max(...linesDataRef.current.map(item => item.width));
    const totalHeight = linesDataRef.current.reduce((acc, item) => acc + item.height, 0);
    const targetWidth = Math.max(originalSizeRef.current?.width ?? 0, maxWidth);
    const targetHeight = Math.max(originalSizeRef.current?.height ?? 0, totalHeight);

    isPreparedRef.current = true;
    
    gsap.set(el, {
      width: targetWidth,
      height: targetHeight,
      display: "inline-block",
      overflow: "hidden"
    });
    
    el.innerHTML = "";
    spanNodesRef.current = [];
    
    linesDataRef.current.forEach(lineData => {
      const span = document.createElement("span");
      span.style.cssText = `display: block; opacity: 0; width: ${lineData.width}px; height: ${lineData.height}px; overflow: hidden; white-space: nowrap;`;
      span.innerText = lineData.text;
      el.appendChild(span);
      spanNodesRef.current.push(span);
    });
    
    gsap.set(el, { opacity: 1 });
  }, []);

  const scramble = useCallback((overrideOptions = {}) => {
    if (!elementRef.current) return null;
    if (isAnimatingRef.current) return timelineRef.current;
    
    prepare();
    
    const mergedOptions = { ...options, ...overrideOptions };
    const duration = mergedOptions.duration ?? 1;
    const speed = mergedOptions.speed ?? 1;
    const chars = mergedOptions.chars ?? ASCII_CHARS;
    const firstColorClass = mergedOptions.firstColorClass ?? "scramble-brand";
    const secondColorClass = mergedOptions.secondColorClass ?? "scramble-foreground";
    const stagger = mergedOptions.stagger ?? 0.08;
    
    const linesData = linesDataRef.current;
    const spanNodes = spanNodesRef.current;
    
    if (linesData.length === 0 || spanNodes.length === 0) return null;
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spanNodes.forEach((span, index) => {
        const lineData = linesData[index];
        if (lineData) {
          span.innerText = lineData.text;
        }
        span.style.opacity = "1";
        span.className = span.className.replace(/\bscramble-\w+\b/g, "");
      });
      mergedOptions.onComplete?.();
      return null;
    }
    
    killTimeline();
    isAnimatingRef.current = true;
    
    timelineRef.current = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        timelineRef.current = null;
        mergedOptions.onComplete?.();
      }
    });
    
    spanNodes.forEach((span, index) => {
      const lineData = linesData[index];
      if (!lineData) return;
      
      const originalText = lineData.text;
      const delay = index * stagger;
      
      const generateScramble = (text, charSet = ASCII_CHARS) => {
        let result = "";
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === " ") {
            result += char;
          } else {
            result += charSet[Math.floor(Math.random() * charSet.length)];
          }
        }
        return result;
      };
      
      const scrambledText = generateScramble(originalText, chars);
      const nonSpaceLength = originalText.replace(/\s/g, "").length;
      const spacePreservedText = originalText.replace(/[^\s]/g, "\xA0"); // Replaces non-spaces with Non-Breaking Spaces

      timelineRef.current?.add(() => {
        gsap.set(span, { opacity: 1 });
        span.innerText = spacePreservedText;
      }, delay);
      
      timelineRef.current?.to(span, {
        duration: duration,
        scrambleText: {
          text: scrambledText,
          chars: chars,
          speed: speed,
          revealDelay: 0.1,
          oldClass: firstColorClass,
          newClass: firstColorClass
        },
        ease: "none"
      }, delay);
      
      timelineRef.current?.to(span, {
        duration: duration,
        scrambleText: {
          text: originalText,
          chars: chars,
          speed: speed,
          revealDelay: 0.1,
          oldClass: firstColorClass,
          newClass: secondColorClass
        },
        ease: "none"
      }, delay + (nonSpaceLength > 0 ? duration / nonSpaceLength : 0));
    });
    
    return timelineRef.current;
  }, [options, killTimeline, prepare]);

  const kill = useCallback(() => {
    killTimeline();
    if (elementRef.current && isPreparedRef.current) {
      elementRef.current.innerHTML = originalHtmlRef.current || originalTextRef.current;
      gsap.set(elementRef.current, {
        opacity: 1,
        width: "auto",
        height: "auto",
        overflow: "visible"
      });
      spanNodesRef.current = [];
      linesDataRef.current = [];
      isPreparedRef.current = false;
    }
  }, [killTimeline]);

  useEffect(() => {
    return () => {
      killTimeline();
      spanNodesRef.current = [];
      linesDataRef.current = [];
      isPreparedRef.current = false;
    };
  }, [killTimeline]);

  return {
    ref: elementRef,
    scramble,
    kill
  };
}

