"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

import NavLink from "@components/NavLink";
import { cn } from "@lib/vendor";

import { bunnyImageUrl } from "@config/bunnyImageUrl";
import ProvenanceChip from "@components/ui/ProvenanceChip";
import { ArrowUpRight } from "@components/assets/icons/ArrowUpRight";
import createClient from "@lib/supabase/supabaseClient";
import { useTransitionRouter } from "@providers/TransitionRouterProvider";
import { toast } from "sonner"; 
import { analytics } from '@lib/analytics/analytics'; 
import { events } from "@lib/auth/events";
import FreeChip from "@/shared/FreeChip";
import { getProvenanceSite } from "@components/ui/ProvenanceChip";


export function useAnimation(animationId, initialIsSaved = false, initialData = null) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [animationData, setAnimationData] = useState(initialData);
  const router = useTransitionRouter();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (animationId && !initialData) {
        const { data: anim } = await supabase
          .from("animations")
          .select("id, title, slug, category")
          .eq("id", animationId)
          .single();
        if (anim) setAnimationData(anim);
      }
    })();
  }, [animationId, initialData]);

  const trackView = useCallback(async () => {
    if (animationId) {
      try {
        const res = await fetch("/api/animations/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ animationId })
        });
        // eslint-disable-next-line no-unused-expressions
        res.ok;
      } catch (e) {}
    }
  }, [animationId]);

  const toggleSave = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!user) {
      toast.error("Please sign in to save animations");
      router.push("/login");
      return;
    }
    
    if (!isLoading) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/animations/save", {
          method: isSaved ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ animationId })
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw Error(errorData.error || "Failed to save animation");
        }
        
        setIsSaved(!isSaved);
        
        if (isSaved) {
          analytics.animation.unsaved(animationId, animationData?.title || "Unknown", animationData?.category || "Unknown");
          toast.success("Animation removed from saved");
        } else {
          analytics.animation.saved(animationId, animationData?.title || "Unknown", animationData?.category || "Unknown");
          events.animationSaved(animationId, animationData?.title || "Unknown", animationData?.category || "Unknown");
          toast.success("Animation saved!");
        }
        
        router.refresh();
      } catch (err) {
        console.error("Error toggling save:", err);
        toast.error(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }
  }, [animationId, isSaved, isLoading, user, router, animationData]);

  return { isSaved, isLoading, user, trackView, toggleSave };
}

function BookmarkIcon({ filled = false, className = "" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="miter"
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 2 H13 V14 L8 10 L3 14 Z" />
    </svg>
  );
}


// ============================================================================
// CHUNK 878512 - AnimationSaveButton
// ============================================================================

const VARIANTS = {
  overlay: {
    bg: "bg-background/85 backdrop-blur-md hover:bg-background",
    transition: "transition-[opacity,translate,background-color] duration-(--duration-quick) ease-(--ease-back-out)"
  },
  inline: {
    bg: "bg-foreground/[0.06] hover:bg-foreground/10",
    transition: "transition-colors duration-(--duration-quick) ease-(--ease-back-out)"
  }
};

/*
 * MANGLED VARIABLE MAPPING:
 * x -> AnimationSaveButton
 * e -> animation
 * a -> initialIsSaved
 * n -> variant
 * i -> isAuthenticated
 * s -> fadeOnHover
 * o -> unauthHint
 * c -> className
 * d -> styles
 */
export function AnimationSaveButton({
  animation,
  initialIsSaved = false,
  variant = "inline",
  isAuthenticated = true,
  fadeOnHover = false,
  unauthHint = "none",
  className = ""
}) {
  const styles = VARIANTS[variant] ?? VARIANTS.inline;
  const { isSaved, isLoading, toggleSave } = useAnimation(
    isAuthenticated ? animation?.id : null,
    initialIsSaved,
    isAuthenticated ? animation : null
  );

  if (isAuthenticated) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSave?.(e);
        }}
        disabled={isLoading}
        aria-label={isSaved ? "Remove from saved" : "Save animation"}
        aria-pressed={isSaved}
        className={cn(
          "flex size-32 items-center justify-center",
          styles.bg,
          styles.transition,
          fadeOnHover && (isSaved ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"),
          className
        )}
      >
        <BookmarkIcon
          filled={isSaved}
          className={cn("size-16", isSaved ? "text-brand" : "text-foreground")}
        />
      </button>
    );
  }

  if (unauthHint === "arrow") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "flex size-32 items-center justify-center",
          styles.bg,
          styles.transition,
          fadeOnHover && "translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
          className
        )}
      >
        <ArrowUpRight className="size-16 text-foreground" />
      </span>
    );
  }

  return null;
}


// ============================================================================
// CHUNK 591611 - AnimationCard
// ============================================================================

function isNew(animation) {
  // 14 days = 1,209,600,000 ms
  return !!animation?.published_at && Date.now() - new Date(animation.published_at).getTime() < 1209600000;
}

const ASPECT_RATIOS = {
  grid: "aspect-[16/10]",
  duo: "aspect-[16/10]",
  condensed: "aspect-[16/10]",
  list: "aspect-[16/10]"
};

/*
 * MANGLED VARIABLE MAPPING:
 * e -> animation
 * l -> viewMode
 * o -> isAuthenticated
 * c -> initialIsSaved
 * d -> priority
 * u -> provenanceSite
 * k -> videoRef
 * N -> isHovered, E -> setIsHovered
 * H -> shouldLoadVideo, S -> setShouldLoadVideo
 * V -> isRecentlyPublished
 * A -> isRecentlyUpdated
 * _ -> handleMouseEnter
 * M -> handleMouseLeave
 * T -> handleLoadedData
 * C -> aspectRatioClass
 */
export default function AnimationCard({
  animation,
  viewMode = "grid",
  isAuthenticated = false,
  initialIsSaved = false,
  priority = false
}) {
  const provenanceSite = getProvenanceSite(animation) || "Studio Original";
  const {
    id,
    title,
    slug,
    category,
    preview_image_url,
    preview_video_url
  } = animation;

  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  const isRecentlyPublished = isNew(animation);
  // 7 days = 604,800,000 ms
  const isRecentlyUpdated = !(!animation?.content_updated_at || isNew(animation)) && 
                            (Date.now() - new Date(animation.content_updated_at).getTime() < 604800000);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (preview_video_url && !shouldLoadVideo) {
      setShouldLoadVideo(true);
      return;
    }
    if (videoRef.current && preview_video_url) {
      const playPromise = videoRef.current.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    }
  }, [preview_video_url, shouldLoadVideo]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (videoRef.current && preview_video_url) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [preview_video_url]);

  const handleLoadedData = useCallback(() => {
    if (isHovered && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    }
  }, [isHovered]);

  const aspectRatioClass = ASPECT_RATIOS[viewMode] ?? ASPECT_RATIOS.grid;

  return (
    <NavLink
      href={`/animations/${slug}`}
      data-theme="dark"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative block bg-surface p-12 text-foreground transition-transform duration-(--duration-quick) ease-(--ease-back-out) hover:scale-[0.98]"
    >
      <div className={cn("relative overflow-hidden bg-foreground/[0.06]", `w-full ${aspectRatioClass}`)}>
        {preview_image_url && (
          <img
            src={bunnyImageUrl(preview_image_url, { width: 720 })}
            alt={title}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            className="absolute inset-0 block object-cover"
            style={{ width: "100%", height: "100%" }}
          />
        )}
        
        {preview_video_url && shouldLoadVideo && (
          <video
            ref={videoRef}
            src={preview_video_url}
            muted={true}
            loop={true}
            playsInline={true}
            preload="metadata"
            onLoadedData={handleLoadedData}
            className={cn(
              "absolute inset-0 block size-full object-cover transition-opacity duration-(--duration-snap)",
              isHovered ? "opacity-100" : "opacity-0"
            )}
            style={{ width: "100%", height: "100%" }}
          />
        )}
        
        <div className="absolute right-8 top-8 z-10">
          <AnimationSaveButton
            animation={animation}
            initialIsSaved={initialIsSaved}
            isAuthenticated={isAuthenticated}
            variant="overlay"
            fadeOnHover={true}
            unauthHint="arrow"
          />
        </div>
      </div>

      <div className="mt-12 flex h-24 items-center justify-between gap-8">
        <ProvenanceChip label={provenanceSite} size="default" className="text-foreground-muted" />
        <div className="flex h-full items-center gap-8">
          {animation.is_free_preview && <FreeChip />}
          {isRecentlyPublished && (
            <span className="text-accent-xs inline-flex h-full items-center bg-brand px-8 font-medium text-[#141314]">
              New
            </span>
          )}
          {isRecentlyUpdated && (
            <span className="text-accent-xs inline-flex h-full items-center bg-foreground px-8 font-medium text-background">
              Updated
            </span>
          )}
        </div>
      </div>

      <div className="mt-36 flex items-baseline justify-between gap-12">
        <p className="text-body-sm truncate font-medium text-foreground">
          {title}
        </p>
        <p className="text-accent-xs shrink-0 text-foreground-muted">
          {category}
        </p>
      </div>
    </NavLink>
  );
}
