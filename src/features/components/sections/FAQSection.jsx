"use client";

import React, { useState, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// IMPORT MAPPING & SOURCE NOT PRESENT STUBS
// ─────────────────────────────────────────────────────────────

// NOTE: original module id: 12895
import { usePppTier, usePppGeo } from "@/hooks/usePppTier";

// NOTE: original module id: 400701
import { useBreakpoint } from "@/hooks/useBreakpoint";

// NOTE: original module id: 963160
import RevealHeadline from "@/components/ui/RevealHeadline";

// NOTE: original module id: 218091
import AnimatedText from "@/components/ui/AnimatedText";

// NOTE: original module id: 687989
import Button from "@/components/ui/Button";

// NOTE: original module id: 327018
import FaqAccordionItem from "@/components/ui/FaqAccordionItem";

// NOTE: original module id: 460391
import Reveal from "@/components/ui/Reveal";

// NOTE: original module id: 30910
import { Info } from "@/components/icons";

// NOTE: original module id: 672706
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/Tooltip";

// NOTE: original module id: 398682
import { t } from "@/lib/i18n";


// ============================================================================
// CHUNK 846057 - MEDIA CONSTANTS
// ============================================================================

export const SHOWREEL_POSTER = "https://annnimate.b-cdn.net/video-thumbnails/kits/menu/menu-showreel_poster.avif";
export const SHOWREEL_SRC = "https://annnimate.b-cdn.net/video-thumbnails/kits/menu/menu-showreel.mp4";



const PPP_PLANS = {
  solo: {
    quarterly: { list: 87, T2: 42, T3: 30 },
    yearly: { list: 249, T2: 139, T3: 99 }
  },
  studio: {
    quarterly: { list: 237, T2: 115, T3: 85 },
    yearly: { list: 699, T2: 385, T3: 275 }
  },
  "studio-plus": {
    quarterly: { list: 507, T2: 249, T3: 179 },
    yearly: { list: 1499, T2: 839, T3: 599 }
  }
};

export function getPppEffectivePrice(plan, cycle, tier) {
  const planData = PPP_PLANS[plan]?.[cycle];
  if (planData && (tier === "T2" || tier === "T3")) {
    return planData[tier] ?? null;
  }
  return null;
}

export const PPP_KIT_PRICING = {
  reveal: { list: 149, T2: 105, T3: 75 },
  menu: { list: 149, T2: 105, T3: 75 }
};

export function getPppKitEffectivePrice(kitSlug, tier) {
  const kitData = PPP_KIT_PRICING[kitSlug];
  if (kitData && (tier === "T2" || tier === "T3")) {
    return kitData[tier] ?? null;
  }
  return null;
}

export function getPppDisplayPrice(plan, cycle, tier) {
  const effectivePrice = getPppEffectivePrice(plan, cycle, tier);
  if (effectivePrice == null) return null;
  
  if (cycle === "quarterly") {
    return { price: Math.ceil(effectivePrice / 3), cycleTotal: effectivePrice };
  }
  return { price: effectivePrice, cycleTotal: null };
}


// ============================================================================
// CHUNK 597274 - KitPrice COMPONENT
// ============================================================================

/*
 * MANGLED VARIABLE MAPPING:
 * e -> kitSlug
 * l -> fallback
 * r -> struckClassName
 * i -> pppTier
 * c -> pppPrice
 * o -> listPrice
 */
export function KitPrice({ kitSlug, fallback = null, struckClassName = "" }) {
  const pppTier = usePppTier();
  const pppPrice = pppTier ? getPppKitEffectivePrice(kitSlug, pppTier) : null;
  
  if (pppPrice == null) return fallback;
  
  const listPrice = PPP_KIT_PRICING[kitSlug]?.list;
  
  return (
    <span aria-label={`€${pppPrice}, regularly €${listPrice}`}>
      €{pppPrice}{" "}
      <s aria-hidden="true" className={struckClassName}>
        €{listPrice}
      </s>
    </span>
  );
}


// ============================================================================
// CHUNK 752362 - FAQSection COMPONENT
// ============================================================================

/*
 * MANGLED VARIABLE MAPPING:
 * e -> faqs
 * d -> eyebrow
 * u -> headline
 * m -> subtext
 * h -> ctaLink
 * p -> sectionId
 * f -> inset
 * g -> openIndex
 * x -> setOpenIndex
 * b -> isDesktop
 * y -> handleToggle
 * v -> schemaData
 */
export function FAQSection({
  faqs = t("common.faq.items"),
  eyebrow,
  headline = t("common.faq.headline"),
  subtext = t("common.faq.subtext"),
  ctaLink = { label: t("common.faq.ctaLabel"), href: "/faq" },
  sectionId,
  inset = false
}) {
  const [openIndex, setOpenIndex] = useState(null);
  const isDesktop = useBreakpoint("lg");
  
  const handleToggle = useCallback((index) => {
    setOpenIndex(prev => (prev === index ? null : index));
  }, []);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a
      }
    }))
  };

  return (
    <section id={sectionId} data-theme="light" className="faq relative bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <div className="v2-container py-96 lg:py-128">
        <div className={inset ? "grid grid-cols-12 gap-x-24" : "contents"}>
          <div className={inset ? "col-span-12 lg:col-span-10 lg:col-start-2" : "contents"}>
            
            <div className="grid grid-cols-12 gap-x-24 gap-y-64">
              <div className="col-span-12 lg:col-span-4 lg:col-start-1 lg:sticky lg:top-96 lg:self-start">
                {eyebrow ? (
                  <AnimatedText
                    tag="p"
                    className="text-mono-sm mb-24 text-foreground-muted"
                    type="lines"
                    mask="lines"
                    duration={0.6}
                    stagger={0.03}
                    ease="power2.out"
                    animationProps={{ yPercent: 100 }}
                    triggerMode="scroll"
                  >
                    {eyebrow}
                  </AnimatedText>
                ) : null}
                <RevealHeadline as="h2" trigger="scroll" className="max-w-[14ch]">
                  {headline}
                </RevealHeadline>
                <div className="mt-24">
                  <AnimatedText
                    tag="p"
                    className="text-body max-w-[34ch] text-foreground-muted"
                    type="lines"
                    mask="lines"
                    duration={0.6}
                    stagger={0.03}
                    ease="power2.out"
                    animationProps={{ yPercent: 100 }}
                    triggerMode="scroll"
                  >
                    {subtext}
                  </AnimatedText>
                </div>
                {ctaLink ? (
                  <div className="mt-32 hidden lg:flex">
                    <Button href={ctaLink.href} theme="brand" size="sm">
                      {ctaLink.label}
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="col-span-12 lg:col-span-7 lg:col-start-7">
                <Reveal trigger="scroll" stagger={0.06} y={20} className="w-full">
                  {faqs.map((faq, index) => (
                    <FaqAccordionItem
                      key={faq.q}
                      q={faq.q}
                      a={faq.a}
                      isOpen={openIndex === index}
                      onToggle={() => handleToggle(index)}
                      isDesktop={isDesktop}
                    />
                  ))}
                </Reveal>
                {ctaLink ? (
                  <div className="mt-32 flex lg:hidden">
                    <Button href={ctaLink.href} theme="brand" size="sm">
                      {ctaLink.label}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


// ============================================================================
// CHUNK 702954 - CheckList COMPONENT
// ============================================================================

/*
 * MANGLED VARIABLE MAPPING:
 * a -> SIZES_CONFIG
 * e -> items
 * l -> size
 * r -> className
 * n -> itemClassName
 */
const SIZES_CONFIG = {
  sm: { rect: "size-8 mt-[0.35em]", gap: "gap-12", text: "text-body leading-snug" },
  default: { rect: "size-12 mt-[0.4em]", gap: "gap-16", text: "text-body-lg leading-snug" }
};

export function CheckList({ items = [], size = "sm", className = "", itemClassName = "" }) {
  const config = SIZES_CONFIG[size] ?? SIZES_CONFIG.sm;

  return (
    <ul className={`m-0 list-none space-y-2 p-0 ${className}`}>
      {items.map((item, index) => {
        const itemObj = typeof item === "string" ? { label: item } : item;
        const textClass = itemObj.muted ? "text-foreground/40" : "text-foreground-muted";
        const bgClass = itemObj.muted ? "bg-brand/40" : "bg-brand";

        return (
          <li
            key={index}
            className={`flex items-start ${config.gap} ${config.text} ${textClass} ${itemClassName} ${itemObj.className || ""}`}
          >
            <span className={`block shrink-0 ${config.rect} ${bgClass}`} aria-hidden="true" />
            <span>{itemObj.label}</span>
          </li>
        );
      })}
    </ul>
  );
}


// ============================================================================
// CHUNK 245647 - PppLabel & PppBanner COMPONENTS
// ============================================================================

/*
 * MANGLED VARIABLE MAPPING:
 * s -> getPppMessage
 */
function getPppMessage() {
  const geo = usePppGeo();
  if (!geo?.tier) return null;

  const countryName = (function (countryCode) {
    if (!countryCode) return null;
    try {
      return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) || null;
    } catch {
      return null;
    }
  })(geo.country);

  return countryName
    ? t("pricing.tiers.pppNotice", { country: countryName })
    : t("pricing.tiers.pppNoticeGeneric");
}

export function PppLabel({ className = "" }) {
  const message = getPppMessage();
  if (!message) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild={true}>
          <button type="button" className={`text-mono-sm inline-flex items-center gap-6 text-brand ${className}`}>
            {t("pricing.tiers.pppName")}
            <Info size={13} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8} className="max-w-[36ch]">
          <p className="text-body-sm font-sans normal-case leading-relaxed text-foreground">
            {message}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function PppBanner({ className = "", align = "center" }) {
  const message = getPppMessage();
  if (!message) return null;

  return (
    <aside className={`flex ${align === "start" ? "justify-start" : "justify-center"} ${className}`}>
      <div className="flex max-w-[560px] flex-col gap-8 border border-foreground/10 bg-surface px-20 py-16">
        <p className="text-mono-sm flex items-center gap-8 text-brand">
          <span aria-hidden="true" className="inline-block size-8 bg-brand" />
          {t("pricing.tiers.pppName")}
        </p>
        <p className="text-body-sm text-foreground-muted">
          {message}
        </p>
      </div>
    </aside>
  );
}