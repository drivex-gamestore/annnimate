"use client";

import React, { useRef, useState, useEffect } from "react";
import NavLink from "@components/NavLink";
import AnimatedButton from "@components/ui/AnimatedButton";
import { RevealHeadline } from "@/components/ui/RevealHeadline";
import { SHOWREEL_SRC, SHOWREEL_POSTER } from "@/constants/media";

export function relativeShipped(dateStr) {
  if (!dateStr) return null;
  const timestamp = new Date(dateStr).getTime();
  if (Number.isNaN(timestamp)) return null;
  
  const daysDiff = Math.floor((Date.now() - timestamp) / 86400000); 
  
  if (daysDiff <= 0) return "today";
  if (daysDiff === 1) return "1 day ago";
  if (daysDiff < 7) return `${daysDiff} days ago`;
  
  const weeksDiff = Math.floor(daysDiff / 7);
  if (daysDiff < 30) return weeksDiff === 1 ? "1 week ago" : `${weeksDiff} weeks ago`;
  
  const monthsDiff = Math.floor(daysDiff / 30);
  return monthsDiff === 1 ? "1 month ago" : `${monthsDiff} months ago`;
}

const getTimestamp = (item) => new Date(item?.published_at || item?.created_at).getTime() || 0;

export function byShipped(items = []) {
  return items
    .filter((item) => item.preview_image_url)
    .sort((itemA, itemB) => getTimestamp(itemB) - getTimestamp(itemA));
}

export function JustShipped({ items = [], count = 0 }) {
  const recentItems = byShipped(items).slice(0, 4);
  
  if (recentItems.length === 0) return null;

  return (
    <section data-theme="dark" className="bg-background text-foreground">
      <div className="v2-container py-32 lg:py-48">
        <div className="mb-32 flex flex-wrap items-baseline justify-between gap-x-24 gap-y-12 lg:mb-48">
          <RevealHeadline
            as="h2"
            sizeClass="text-h2"
            trigger="scroll"
            className="font-medium"
          >
            Just shipped.
          </RevealHeadline>
          <span className="text-accent-xs text-foreground-muted">
            {count} components
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-x-16 gap-y-24 sm:grid-cols-4 lg:gap-x-24">
          {recentItems.map((item) => (
            <NavLink
              key={item.slug}
              href={`/animations/${item.slug}`}
              className="group flex flex-col"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-surface">
                <img
                  src={item.preview_image_url}
                  alt=""
                  loading="lazy"
                  className="block object-cover transition-transform duration-(--duration-base) ease-(--ease-expo-out) group-hover:scale-[1.03]"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <p className="text-body-sm mt-12 text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) group-hover:text-brand">
                {item.title}
              </p>
              <p className="text-accent-xs mt-2 text-foreground-muted">
                {relativeShipped(item.published_at || item.created_at)}
              </p>
            </NavLink>
          ))}
        </div>
        
        <div className="mt-32 flex justify-center lg:mt-48">
          <AnimatedButton href="/animations" theme="surface" size="sm">
            Explore the full library
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
}

export default function ShowreelVideo({
  className = "",
  label = "Menu Kit showreel"
}) {
  const videoRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mediaQuery) return;
    
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (event) => setReducedMotion(event.matches);
    
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && reducedMotion) {
      videoEl.pause();
    }
  }, [reducedMotion]);

  return (
    <div className={`relative overflow-hidden bg-foreground/[0.06] ${className}`}>
      <video
        ref={videoRef}
        className="block object-cover"
        style={{ width: "100%", height: "100%" }}
        src={SHOWREEL_SRC}
        poster={SHOWREEL_POSTER || undefined}
        autoPlay={!reducedMotion}
        muted={true}
        loop={true}
        playsInline={true}
        preload="metadata"
        aria-label={label}
      />
    </div>
  );
}
