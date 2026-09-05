import React, { forwardRef, useRef, useState, useLayoutEffect, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { useReveal } from '@hooks/useReveal';

const AnimatedHeading = forwardRef(function({
  children,
  as: Tag = "h2",
  sizeClass = "text-h2",
  className = "",
  trigger = "scroll",
  start = "top 80%",
  skip = false
}, ref) {
  const containerRef = useRef(null);
  const [lines, setLines] = useState(null);

  const extractText = (node) => {
    if (node == null || node === false) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    return "";
  };

  const textContent = extractText(children);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const wordEls = containerRef.current.querySelectorAll("[data-rh-word]");
    if (wordEls.length === 0) return;
    
    const linesArray = [];
    let currentLine = [];
    let prevTop = -Infinity;
    let prevExplicitLine = -1;
    
    for (const el of wordEls) {
      const top = el.getBoundingClientRect().top;
      const explicitLine = Number(el.dataset.rhExplicit ?? -1);
      const isNewExplicitLine = explicitLine !== prevExplicitLine && prevExplicitLine !== -1;
      
      if ((prevTop > -Infinity && top - prevTop > 2) || isNewExplicitLine) {
        linesArray.push(currentLine.join(" "));
        currentLine = [];
      }
      currentLine.push(el.textContent || "");
      prevTop = top;
      prevExplicitLine = explicitLine;
    }
    
    if (currentLine.length > 0) {
      linesArray.push(currentLine.join(" "));
    }
    
    setLines(linesArray);
  }, [textContent]);

  const { reveal } = useReveal(containerRef, {
    mode: trigger === "pageEnter" ? "hero" : trigger === "manual" ? "manual" : "scroll",
    build: skip || !lines ? null : (el) => {
      const tl = gsap.timeline({ paused: true });
      const lineEls = el.querySelectorAll("[data-rh-line]");
      
      for (let i = 0; i < lineEls.length; i++) {
        const brandEl = lineEls[i].querySelector("[data-rh-brand]");
        const fgEl = lineEls[i].querySelector("[data-rh-fg]");
        
        if (!brandEl || !fgEl) continue;
        
        gsap.set([brandEl, fgEl], { scaleX: 1, transformOrigin: "right" });
        const delay = 0.12 * i;
        
        tl.to(fgEl, { scaleX: 0, duration: 0.5, ease: "power3.inOut" }, delay);
        tl.to(brandEl, { scaleX: 0, duration: 0.5, ease: "power3.inOut" }, delay + 0.1);
      }
      return tl;
    },
    start,
    deps: [lines, skip]
  });

  useImperativeHandle(ref, () => ({ reveal }), [reveal]);

  const combinedClassName = `${sizeClass} ${className}`.trim();

  if (!lines) {
    const rawLines = textContent.split("\n");
    return (
      <Tag ref={containerRef} className={combinedClassName} style={{ visibility: "hidden" }}>
        {rawLines.map((lineText, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {lineText.split(/\s+/).filter(Boolean).map((word, wordIndex) => (
              <React.Fragment key={wordIndex}>
                {wordIndex > 0 && " "}
                <span data-rh-word={true} data-rh-explicit={lineIndex}>
                  {word}
                </span>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={containerRef} className={combinedClassName}>
      {lines.map((lineText, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          <span data-rh-line={true} className="relative inline-block">
            <span className="block whitespace-nowrap">{lineText}</span>
            {!skip && (
              <>
                <span
                  data-rh-brand={true}
                  aria-hidden="true"
                  className="absolute -inset-x-[0.1em] -inset-y-[0.1em] block bg-brand"
                />
                <span
                  data-rh-fg={true}
                  aria-hidden="true"
                  className="absolute -inset-x-[0.1em] -inset-y-[0.1em] block bg-foreground"
                />
              </>
            )}
          </span>
        </React.Fragment>
      ))}
    </Tag>
  );
});

export default AnimatedHeading;