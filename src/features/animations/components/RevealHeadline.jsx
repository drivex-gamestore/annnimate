"use client";

import React, {
  forwardRef,
  useRef,
  useState,
  useLayoutEffect,
  useImperativeHandle,
  useMemo,
  Fragment
} from "react";
import { gsap, useGSAP } from "@lib/vendor";
import { useReveal } from '@hooks/useReveal';

export const RevealHeadline = forwardRef(function RevealHeadline(
  {
    children,
    as: Tag = "h2",
    sizeClass = "text-h2",
    className = "",
    trigger = "scroll",
    start = "top 80%",
    skip = false,
  },
  ref
) {
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
    const words = containerRef.current.querySelectorAll("[data-rh-word]");
    if (words.length === 0) return;

    const newLines = [];
    let currentLine = [];
    let lastTop = -Infinity;
    let lastExplicitIndex = -1;

    for (const wordNode of words) {
      const rectTop = wordNode.getBoundingClientRect().top;
      const explicitIndex = Number(wordNode.dataset.rhExplicit ?? -1);
      const isNewExplicit = explicitIndex !== lastExplicitIndex && lastExplicitIndex !== -1;

      
      if ((lastTop > -Infinity && rectTop - lastTop > 2) || isNewExplicit) {
        newLines.push(currentLine.join(" "));
        currentLine = [];
      }

      currentLine.push(wordNode.textContent || "");
      lastTop = rectTop;
      lastExplicitIndex = explicitIndex;
    }

    if (currentLine.length > 0) {
      newLines.push(currentLine.join(" "));
    }

    setLines(newLines);
  }, [textContent]);

  const { reveal } = useReveal(containerRef, {
    mode: trigger === "pageEnter" ? "hero" : trigger === "manual" ? "manual" : "scroll",
    build: skip || !lines ? null : (element) => {
      const tl = gsap.timeline({ paused: true });
      const lineElements = element.querySelectorAll("[data-rh-line]");

      for (let i = 0; i < lineElements.length; i++) {
        const brandSpan = lineElements[i].querySelector("[data-rh-brand]");
        const fgSpan = lineElements[i].querySelector("[data-rh-fg]");

        if (!brandSpan || !fgSpan) continue;

        gsap.set([brandSpan, fgSpan], { scaleX: 1, transformOrigin: "right" });
        
        const delay = 0.12 * i;
        tl.to(fgSpan, { scaleX: 0, duration: 0.5, ease: "power3.inOut" }, delay);
        tl.to(brandSpan, { scaleX: 0, duration: 0.5, ease: "power3.inOut" }, delay + 0.1);
      }
      
      return tl;
    },
    start: start,
    deps: [lines, skip],
  });

  useImperativeHandle(ref, () => ({ reveal }), [reveal]);

  const computedClassName = `${sizeClass} ${className}`.trim();

  
  if (!lines) {
    const splitText = textContent.split("\n");
    return (
      <Tag ref={containerRef} className={computedClassName} style={{ visibility: "hidden" }}>
        {splitText.map((lineText, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {lineText
              .split(/\s+/)
              .filter(Boolean)
              .map((word, wordIndex) => (
                <Fragment key={wordIndex}>
                  {wordIndex > 0 && " "}
                  <span data-rh-word={true} data-rh-explicit={lineIndex}>
                    {word}
                  </span>
                </Fragment>
              ))}
          </Fragment>
        ))}
      </Tag>
    );
  }

  
  return (
    <Tag ref={containerRef} className={computedClassName}>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          <span data-rh-line={true} className="relative inline-block">
            <span className="block whitespace-nowrap">{line}</span>
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
        </Fragment>
      ))}
    </Tag>
  );
});





export const RING_SECTION_MIN_VH = 66;

const MOBILE_RING_SIZE = "calc(min(95vw, 480px) + 64px)";
const COL_WIDTH = "calc(max(32px, (100vw - 1920px) / 2) + 3 * (min(1920px, 100vw - 64px) - 264px) / 12 + 48px - 32px)";
const SCALED_COL = `calc(${COL_WIDTH} * 1.5 / 1.09)`;
const DESKTOP_RING_SIZE = `calc(${SCALED_COL} * 2)`;
const OFFSET_X = `calc(${COL_WIDTH} * 0.5)`;
const ITEM_W = `calc(${SCALED_COL} * 0.32)`;
const ITEM_H = `calc(${ITEM_W} * 9 / 16)`;

export default function RingGallery({ side, images = [] }) {
  const itemRefs = useRef([]);
  const isCenter = side === "center";
  
  const itemCount = isCenter ? 12 : 24;
  const ringSize = isCenter ? MOBILE_RING_SIZE : DESKTOP_RING_SIZE;
  const itemWidth = isCenter ? `calc(${ringSize} / 2 * 0.26)` : ITEM_W;
  const itemHeight = isCenter ? `calc(${itemWidth} * 9 / 16)` : ITEM_H;

  const initialAngles = useMemo(() => {
    const angles = [];
    for (let t = 0; t < itemCount; t++) {
      angles.push((t / itemCount) * 360);
    }
    return angles;
  }, [itemCount]);

  useGSAP(() => {
    const validRefs = itemRefs.current.filter(Boolean);
    if (validRefs.length === 0) return;

    const counterRotOffset = side === "left" ? 90 : 270;
    const translateY = `translateY(calc(${ringSize} / -2))`;

    const updateTransforms = (orbitOffset) => {
      for (let n = 0; n < validRefs.length; n++) {
        const currentAngle = initialAngles[n] + orbitOffset;
        const counterAngle = isCenter ? -currentAngle : -counterRotOffset;
        validRefs[n].style.transform = `rotate(${currentAngle}deg) ${translateY} rotate(${counterAngle}deg)`;
      }
    };

    updateTransforms(0);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const orbitProxy = { orbit: 0 };
      gsap.to(orbitProxy, {
        orbit: 360,
        duration: 90,
        ease: "none",
        repeat: -1,
        onUpdate: () => updateTransforms(orbitProxy.orbit),
      });
    });

    return () => mm.revert();
  }, { dependencies: [side, initialAngles, isCenter, ringSize] });

  const containerStyle = isCenter
    ? {
        width: ringSize,
        height: ringSize,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }
    : {
        width: ringSize,
        height: ringSize,
        left: side === "left" ? 0 : "auto",
        right: side === "right" ? 0 : "auto",
        top: "50%",
        transform: side === "left"
          ? `translate(calc(-50% - ${OFFSET_X}), -50%)`
          : `translate(calc(50% + ${OFFSET_X}), -50%)`,
      };

  const displayClass = isCenter ? "block sm:hidden" : "hidden sm:block";
  const opacityClass = isCenter ? "opacity-40" : "";

  return (
    <div
      className={`pointer-events-none absolute ${displayClass} ${opacityClass}`}
      style={containerStyle}
      aria-hidden="true"
    >
      <div className="relative h-full w-full">
        {initialAngles.map((angle, index) => {
          const src = images[index % Math.max(images.length, 1)];
          const counterAngle = isCenter ? -angle : side === "left" ? -90 : -270;

          return (
            <div
              key={index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="absolute left-1/2 top-1/2"
              style={{
                width: itemWidth,
                height: itemHeight,
                marginLeft: `calc(${itemWidth} / -2)`,
                marginTop: `calc(${itemHeight} / -2)`,
                transform: `rotate(${angle}deg) translateY(calc(${ringSize} / -2)) rotate(${counterAngle}deg)`,
              }}
            >
              {src ? (
                <img
                  src={src}
                  alt=""
                  decoding="async"
                  className="block object-cover"
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <div className="block h-full w-full bg-foreground/[0.06]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

