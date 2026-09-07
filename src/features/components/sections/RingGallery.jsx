"use client";

import React, { useRef, useMemo } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";


const BASE_SIZE_MOBILE = "calc(min(95vw, 480px) + 64px)";
const BASE_SIZE_DESKTOP = "calc(max(32px, (100vw - 1920px) / 2) + 3 * (min(1920px, 100vw - 64px) - 264px) / 12 + 48px - 32px)";
const DESKTOP_RING_INNER = `calc(${BASE_SIZE_DESKTOP} * 1.5 / 1.09)`;
const DESKTOP_RING_OUTER = `calc(${DESKTOP_RING_INNER} * 2)`;
const DESKTOP_OFFSET = `calc(${BASE_SIZE_DESKTOP} * 0.5)`;
const ITEM_WIDTH_DESKTOP = `calc(${DESKTOP_RING_INNER} * 0.32)`;
const ITEM_HEIGHT_DESKTOP = `calc(${ITEM_WIDTH_DESKTOP} * 9 / 16)`;

export const RING_SECTION_MIN_VH = 66;


export default function RingGallery({ side, images = [] }) {
  const itemsRef = useRef([]);
  
  const isCenter = side === "center";
  const itemCount = isCenter ? 12 : 24;
  const ringSize = isCenter ? BASE_SIZE_MOBILE : DESKTOP_RING_OUTER;
  const itemWidth = isCenter ? `calc(${ringSize} / 2 * 0.26)` : ITEM_WIDTH_DESKTOP;
  const itemHeight = isCenter ? `calc(${itemWidth} * 9 / 16)` : ITEM_HEIGHT_DESKTOP;

  const angles = useMemo(() => {
    const arr = [];
    for (let t = 0; t < itemCount; t++) {
      arr.push((t / itemCount) * 360);
    }
    return arr;
  }, [itemCount]);

  useGSAP(() => {
    const elements = itemsRef.current.filter(Boolean);
    if (elements.length === 0) return;

    const baseRotation = side === "left" ? 90 : 270;
    const translateStr = `translateY(calc(${ringSize} / -2))`;

    const updatePositions = (orbitAngle) => {
      for (let n = 0; n < elements.length; n++) {
        const itemAngle = angles[n] + orbitAngle;
        const counterRotation = isCenter ? -itemAngle : -baseRotation;
        elements[n].style.transform = `rotate(${itemAngle}deg) ${translateStr} rotate(${counterRotation}deg)`;
      }
    };

    // Initialize positions
    updatePositions(0);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const proxy = { orbit: 0 };
      gsap.to(proxy, {
        orbit: 360,
        duration: 90,
        ease: "none",
        repeat: -1,
        onUpdate: () => updatePositions(proxy.orbit)
      });
    });

    return () => mm.revert();
  }, { dependencies: [side, angles, isCenter, ringSize] });

  const containerStyle = isCenter
    ? {
        width: ringSize,
        height: ringSize,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)"
      }
    : {
        width: ringSize,
        height: ringSize,
        left: side === "left" ? 0 : "auto",
        right: side === "right" ? 0 : "auto",
        top: "50%",
        transform: side === "left"
          ? `translate(calc(-50% - ${DESKTOP_OFFSET}), -50%)`
          : `translate(calc(50% + ${DESKTOP_OFFSET}), -50%)`
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
        {angles.map((angle, index) => {
          const imageSrc = images[index % Math.max(images.length, 1)];
          const counterRotation = isCenter ? -angle : side === "left" ? -90 : -270;
          
          return (
            <div
              key={index}
              ref={(el) => {
                itemsRef.current[index] = el;
              }}
              className="absolute left-1/2 top-1/2"
              style={{
                width: itemWidth,
                height: itemHeight,
                marginLeft: `calc(${itemWidth} / -2)`,
                marginTop: `calc(${itemHeight} / -2)`,
                transform: `rotate(${angle}deg) translateY(calc(${ringSize} / -2)) rotate(${counterRotation}deg)`
              }}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
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
