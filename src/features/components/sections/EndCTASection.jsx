"use client";

import React, { useRef } from "react";
import { gsap } from "@lib/vendor";



import { RevealHeadline } from "@animations/components/RevealHeadline";


import AnimatedText from "@animations/components/AnimatedText";


import Button from "@/components/ui/Button";


import RingGallery, { RING_SECTION_MIN_VH } from "@/components/sections/RingGallery";
import { useReveal } from "@/hooks/useReveal";
import { t } from '@components/helpers/translate';

const DEFAULT_HEADLINE = t("common.endCta.headline");
const DEFAULT_SUBTEXT = t("common.endCta.subtext");
const DEFAULT_PRIMARY_CTA = {
  label: t("common.endCta.primaryLabel"),
  href: "/pricing"
};
const DEFAULT_SECONDARY_CTA = {
  label: t("common.endCta.secondaryLabel"),
  href: "/animations"
};




export default function EndCTA({
  headline = DEFAULT_HEADLINE,
  subtext = DEFAULT_SUBTEXT,
  primaryCta = DEFAULT_PRIMARY_CTA,
  secondaryCta = DEFAULT_SECONDARY_CTA,
  images = [],
  bleed = false,
  eyebrow,
  minimal = false
}) {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const textReadyFnRef = useRef(null);

  useReveal(sectionRef, {
    mode: "scroll",
    build: () => {
      const tl = gsap.timeline({ paused: true });
      tl.call(() => headlineRef.current?.reveal?.(), [], 0);
      tl.call(() => textReadyFnRef.current?.(), [], 0.2);
      return tl;
    }
  });

  const halfLength = Math.ceil(images.length / 2);
  const leftImages = images.slice(0, halfLength);
  const rightImages = images.slice(halfLength);
  
  const applyBleed = bleed && !minimal;
  const minHeightVh = minimal ? 50 : RING_SECTION_MIN_VH;
  const buttonSize = minimal ? "sm" : "default";

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className={`end-cta relative flex items-center bg-background text-foreground ${applyBleed ? "" : "overflow-hidden"}`}
      style={{
        minHeight: `${minHeightVh}vh`,
        ...(applyBleed ? { clipPath: "inset(0 0 -100vh 0)" } : null)
      }}
    >
      <RingGallery side="left" images={leftImages.length ? leftImages : images} />
      <RingGallery side="right" images={rightImages.length ? rightImages : images} />
      <RingGallery side="center" images={images} />
      
      <div className={`v2-container relative ${minimal ? "py-96 lg:py-128" : "py-128 lg:py-200"}`}>
        <div className="grid grid-cols-12 gap-x-24">
          <div className="col-span-12 flex flex-col items-center gap-32 text-center lg:col-span-6 lg:col-start-4">
            
            {eyebrow && (
              <p className="text-mono-sm text-foreground-muted">
                {eyebrow}
              </p>
            )}
            
            <RevealHeadline
              ref={headlineRef}
              as="h2"
              trigger="manual"
              className="max-w-[18ch]"
            >
              {headline}
            </RevealHeadline>
            
            <AnimatedText
              tag="p"
              className="text-body max-w-[44ch] text-foreground-muted"
              type="lines"
              mask="lines"
              duration={0.6}
              stagger={0.03}
              ease="power2.out"
              animationProps={{ yPercent: 100 }}
              triggerMode="manual"
              onReady={(fn) => { textReadyFnRef.current = fn; }}
            >
              {subtext}
            </AnimatedText>
            
            <div className="mt-8 flex flex-col items-center gap-16 sm:flex-row sm:gap-12">
              {primaryCta && (
                <Button href={primaryCta.href} theme="brand" size={buttonSize}>
                  {primaryCta.label}
                </Button>
              )}
              {secondaryCta && (
                <Button href={secondaryCta.href} theme="surface" size={buttonSize}>
                  {secondaryCta.label}
                </Button>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
