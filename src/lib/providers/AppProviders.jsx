"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { IconContext } from "@phosphor-icons/react";
import { Tooltip } from "react-tooltip";
import { useUser } from "@providers/UserProvider";
import { captureFirstTouch, collectAttribution } from '@lib/auth/attribution'; 
import { usePageEnterAnimation } from '@hooks/usePageEnterAnimation'; 
import { cn } from '@lib/vendor'; 

const AppToaster = ({ ...props }) => (
  <div data-theme="dark">
    <Toaster
      theme="dark"
      position="bottom-center"
      gap={8}
      toastOptions={{
        duration: 3000,
        unstyled: true,
        classNames: {
          toast: cn(
            "flex w-fit min-h-48 max-w-[90vw] items-center gap-12",
            "border border-foreground/10 bg-surface px-16 py-12",
            "text-foreground shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
          ),
          title: "text-body-sm font-medium text-foreground",
          description: "text-body-sm mt-4 text-foreground-muted",
          actionButton: cn(
            "text-body-sm font-medium shrink-0 bg-foreground px-10 py-6 text-background",
            "transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) hover:opacity-90"
          ),
          cancelButton: cn(
            "text-body-sm font-medium shrink-0 border border-foreground/15 px-10 py-6 text-foreground-muted",
            "transition-colors duration-(--duration-quick) ease-(--ease-expo-out) hover:bg-foreground/5 hover:text-foreground"
          ),
          closeButton: cn(
            "!border-0 !bg-transparent !shadow-none text-foreground-muted",
            "transition-colors duration-(--duration-quick) ease-(--ease-expo-out)",
            "hover:!bg-transparent hover:text-foreground"
          ),
          icon: "mr-2 shrink-0",
          success: "[&_[data-icon]]:text-brand",
          error: "[&_[data-icon]]:text-red-400",
          warning: "[&_[data-icon]]:text-amber-400",
          info: "[&_[data-icon]]:text-foreground",
          loading: "[&_[data-icon]]:text-foreground-muted"
        }
      }}
      expand={false}
      closeButton={true}
      {...props}
    />
  </div>
);

function GridGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [animState, setAnimState] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "g") {
        e.preventDefault();
        setIsVisible((prev) => {
          setAnimState(prev ? "out" : "in");
          return !prev;
        });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (animState !== "out") return;
    const timer = setTimeout(() => setAnimState(null), 1830);
    return () => clearTimeout(timer);
  }, [animState]);

  const isHidden = !isVisible && animState !== "out";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ visibility: isHidden ? "hidden" : "visible" }}
      aria-hidden="true"
    >
      <div className="v2-container h-full">
        <div className="grid grid-cols-12 gap-16 h-full">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="h-full origin-top"
              style={{
                background: "color-mix(in srgb, var(--brand) 10%, transparent)",
                transform: isVisible ? "scaleY(1)" : "scaleY(0)",
                transitionProperty: "transform",
                transitionDuration: "1500ms",
                transitionTimingFunction: "var(--ease-power3-in-out)",
                transitionDelay: `${30 * index}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AttributionTracker() {
  const { user, profile } = useUser();
  const hasBackfilled = useRef(false);

  useEffect(() => {
    captureFirstTouch();
  }, []);

  useEffect(() => {
    if (!user || !profile || hasBackfilled.current || profile.ft_at || profile.ft_channel) return;

    const createdAtTime = profile.created_at ? new Date(profile.created_at).getTime() : 0;
    
    if (!createdAtTime || Date.now() - createdAtTime > 604800000) return;

    hasBackfilled.current = true;
    
    fetch("/api/attribution/backfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectAttribution())
    }).catch(() => {});
  }, [user, profile]);

  return null;
}

const SUBSCRIPTION_MESSAGES = {
  newsletter: {
    title: "You're in. Welcome to the Annnimate newsletter.",
    description: "Expect one short email when there's something worth saying."
  },
  kits: {
    title: "You're on the list.",
    description: "We'll let you know the moment the first Kit ships."
  }
};

function SubscriptionToastInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const subscribed = searchParams?.get("subscribed") || null;
  const hasToasted = useRef(false);

  usePageEnterAnimation(() => {
    if (!subscribed || hasToasted.current) return;
    
    const message = SUBSCRIPTION_MESSAGES[subscribed];
    if (!message) return;

    hasToasted.current = true;
    
    toast.success(message.title, {
      description: message.description,
      duration: 8000
    });

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("subscribed");
    const newQueryString = newParams.toString();
    
    router.replace(`${pathname}${newQueryString ? `?${newQueryString}` : ""}`, { scroll: false });
  }, [subscribed, pathname], "subscription-confirmed-toast", !!subscribed);

  return null;
}

function SubscriptionToast() {
  return (
    <Suspense fallback={null}>
      <SubscriptionToastInner />
    </Suspense>
  );
}

const ICON_CONTEXT_VALUE = { weight: "fill" };

export default function AppProviders({ children }) {
  return (
    <IconContext.Provider value={ICON_CONTEXT_VALUE}>
      {children}
      <AttributionTracker />
      <GridGuide />
      <AppToaster />
      <Suspense fallback={null}>
        <SubscriptionToast />
      </Suspense>
      <Tooltip id="tooltip" className="z-[60] !opacity-100 max-w-sm shadow-lg" />
    </IconContext.Provider>
  );
}

