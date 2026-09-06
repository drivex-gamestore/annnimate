"use client";

import React, { useRef, useState, useEffect, Fragment } from "react";
import { gsap, useGSAP } from "@lib/vendor";

// NOTE: original module id: 499141
import { Lock } from "@/components/icons";

import { useBreakpoint } from "@hooks/useBreakpoint";

import { analytics } from "@lib/analytics/analytics";

// NOTE: original module id: 42242
import PaywallBlock from "@/components/paywall/PaywallBlock";

// NOTE: original module id: 928862
import PaywallContainer from "@/components/paywall/PaywallContainer";

// NOTE: original module id: 660219
import { KIT_TOUCH_COOKIE, parseFirstTouch } from "@/utils/cookieUtils";

// NOTE: original module id: 687989
import Button from "@/components/ui/Button";

// NOTE: original module id: 520237
import Link from "@/components/ui/Link";

// NOTE: original module id: 967791
import { TESTIMONIALS } from "@/constants/testimonials";

import SiteConfig, { effectiveCyclePrice } from "@config/siteConfig";


const testimonial = TESTIMONIALS[2] || null;

const STARTER_PACK_ITEMS = [
  {
    title: "Text Reveal",
    img: "https://annnimate.b-cdn.net/video-thumbnails/scroll/text-reveal/text-reveal_cover.avif"
  },
  {
    title: "Dual Scramble",
    img: "https://annnimate.b-cdn.net/video-thumbnails/ui-component/dual-scramble/dual_scramble_cover.avif"
  },
  {
    title: "Accordion",
    img: "https://annnimate.b-cdn.net/video-thumbnails/ui-component/accordion/accordion_cover.avif"
  },
  {
    title: "Drawer Menu",
    img: "https://annnimate.b-cdn.net/video-thumbnails/menu/multi-level-drawer-menu/multi-level-drawer-menu_cover.avif"
  }
];


export function StarterPackThumbs({ className = "", items = null }) {
  const displayItems = items && items.length ? items : STARTER_PACK_ITEMS;
  const containerRef = useRef(null);
  const marqueeRef = useRef(null);

  useGSAP(() => {
    const marqueeEl = marqueeRef.current;
    const containerEl = containerRef.current;
    
    if (marqueeEl && containerEl) {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.to(marqueeEl, {
          xPercent: -50,
          duration: 7 * displayItems.length,
          ease: "none",
          repeat: -1,
          force3D: true
        });

        const handleMouseEnter = () => gsap.to(tween, { timeScale: 0, duration: 0.4, overwrite: true });
        const handleMouseLeave = () => gsap.to(tween, { timeScale: 1, duration: 0.4, overwrite: true });

        containerEl.addEventListener("mouseenter", handleMouseEnter);
        containerEl.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          containerEl.removeEventListener("mouseenter", handleMouseEnter);
          containerEl.removeEventListener("mouseleave", handleMouseLeave);
        };
      });
    }
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_28%,black_72%,transparent)] ${className}`}
    >
      <div ref={marqueeRef} className="flex w-max">
        {[...displayItems, ...displayItems].map((item, index) => (
          <figure
            key={`${item.title}-${index}`}
            aria-hidden={index >= displayItems.length ? "true" : undefined}
            className="flex w-140 shrink-0 flex-col gap-6 pr-12"
          >
            <div className="aspect-[16/10] w-full overflow-hidden border border-foreground/10 bg-foreground/[0.04]">
              <img
                src={item.img}
                alt={index >= displayItems.length ? "" : item.title}
                className="block object-cover"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <figcaption className="text-accent-2xs truncate text-center text-foreground-muted">
              {item.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}


export function FreeChip() {
  return (
    <span className="text-accent-xs inline-flex h-24 items-center bg-brand px-8 font-medium text-[#141314]">
      Free
    </span>
  );
}

function LockIconWrap() {
  return (
    <span className="flex size-32 items-center justify-center border border-foreground/15 bg-background">
      <Lock size={14} className="text-foreground-muted" />
    </span>
  );
}


export default function Paywall({
  animation = null,
  isAuthenticated = false,
  starterPack = null,
  trackShown = true,
  showCheckout = true
}) {
  const isDesktop = useBreakpoint("lg");
  const animationName = animation?.title || animation?.name || "this component";
  const animationSlug = animation?.slug;
  const isInStarterPack = !!animation?.is_free_preview;
  
  const libraryCount = SiteConfig.animationStats?.displayCount || "50+";
  const soloPlan = SiteConfig.stripe?.landingPlans?.find(plan => "solo" === plan.key);
  const monthlyPrice = effectiveCyclePrice(soloPlan?.quarterly);
  
  const checkoutUrl = `/checkout?plan=solo&cycle=quarterly${animationSlug ? `&component=${animationSlug}` : ""}`;
  const unlockLabel = monthlyPrice ? `Unlock everything - €${monthlyPrice}/mo` : "Unlock everything";
  
  const isDesktopUnauth = isDesktop && !isAuthenticated;
  
  const [isSubscriber, setIsSubscriber] = useState(false);
  
  useEffect(() => {
    setIsSubscriber(!!(function() {
      if (typeof document === "undefined") return null;
      const cookieMatch = document.cookie.split("; ").find(c => c.startsWith(`${KIT_TOUCH_COOKIE}=`))?.slice(KIT_TOUCH_COOKIE.length + 1);
      return parseFirstTouch(cookieMatch)?.id || null;
    })());
  }, []);
  
  const trackRef = useRef(false);
  
  useEffect(() => {
    if (trackShown && isDesktopUnauth && !trackRef.current) {
      trackRef.current = true;
      analytics.track("paywall_capture_shown", {
        animation_slug: animationSlug,
        animation_name: animationName,
        in_starter_pack: isInStarterPack,
        subscriber: isSubscriber
      });
    }
  }, [trackShown, isDesktopUnauth, animationSlug, animationName, isInStarterPack, isSubscriber]);
  
  const handleCheckoutClick = () => {
    analytics.track("paywall_checkout_clicked", {
      animation_slug: animationSlug,
      animation_name: animationName
    });
  };
  
  const checkoutBlock = (
    <div className="flex flex-col items-center gap-12">
      <Button href={checkoutUrl} onClick={handleCheckoutClick} theme="brand" size="sm">
        {unlockLabel}
      </Button>
      <p className="text-accent-xs text-foreground-muted">
        Cancel anytime · 14-day money-back guarantee
      </p>
      <Link href="/pricing" className="text-accent-xs text-foreground-muted hover:text-foreground">
        See all plans
      </Link>
    </div>
  );
  
  if (isDesktopUnauth) {
    if (isSubscriber) {
      return (
        <PaywallContainer
          title={animationName}
          isInStarterPack={isInStarterPack}
          checkoutBlock={showCheckout ? checkoutBlock : null}
        />
      );
    }
    
    return (
      <div className="flex w-full max-w-[26rem] flex-col gap-20">
        <div className="flex flex-col items-center gap-10 text-center">
          {isInStarterPack ? (
            <Fragment>
              <FreeChip />
              <p className="text-body font-medium text-foreground">
                {animationName} is in the free Starter Pack.
              </p>
              <p className="text-body-sm text-foreground-muted">
                Drop your email and this exact component lands in your inbox, in React, Vue and HTML. No card, no trial.
              </p>
            </Fragment>
          ) : (
            <Fragment>
              <LockIconWrap />
              <p className="text-body font-medium text-foreground">
                The full code for {animationName} is locked.
              </p>
              <p className="text-body-sm text-foreground-muted">
                Start with the free pack, in React, Vue and HTML. A new free component every week. The whole {libraryCount} library unlocks anytime.
              </p>
            </Fragment>
          )}
        </div>
        
        {!isInStarterPack && <StarterPackThumbs items={starterPack} />}
        
        <div className="flex flex-col gap-8">
          <PaywallBlock
            source="paywall-block"
            idPrefix="paywall"
            buttonLabel={isInStarterPack ? "Send me this component" : "Send me the free pack"}
            buttonSize="sm"
            className="w-full"
            compact={true}
            wantedComponent={animationSlug}
          />
        </div>
        
        {showCheckout && (
          <div className="mt-16 flex flex-col items-center gap-10 border-t border-foreground/10 pt-32">
            <Button href={checkoutUrl} onClick={handleCheckoutClick} theme="surface" size="xs">
              {monthlyPrice ? `Unlock everything - €${monthlyPrice}/mo` : "Unlock everything"}
            </Button>
            <p className="text-accent-xs text-foreground-muted">
              Cancel anytime · 14-day money-back
            </p>
            {testimonial ? (
              <blockquote className="mt-8 flex max-w-[34ch] flex-col gap-6 text-center">
                <p className="text-body-sm text-foreground-muted">
                  “Similar services are 2-3 times the cost and don't offer the level of polish that Annnimate does.”
                </p>
                <footer className="text-accent-xs text-foreground-muted">
                  {testimonial.name} · {testimonial.role}
                </footer>
              </blockquote>
            ) : null}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center gap-24">
      <div className="flex flex-col items-center gap-16 text-center">
        <LockIconWrap />
        <span className="text-accent-xs text-foreground-muted">Locked</span>
        <p className="text-body max-w-[26ch] font-medium text-foreground">
          Get the full code for {animationName}.
        </p>
        <p className="text-body-sm max-w-[30ch] text-foreground-muted">
          Plus {libraryCount} production components in React, Vue and HTML, each built to the standard we ship for real brands.
        </p>
      </div>
      {checkoutBlock}
    </div>
  );
}