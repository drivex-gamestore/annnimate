import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { useBreakpoint } from '@hooks/useBreakpoint';
import { t } from '@components/helpers/translate';
import AnimatedText from '@animations/components/AnimatedText';

const Globe = dynamic(() => import('@components/Globe'), { ssr: false });

gsap.registerPlugin(useGSAP, ScrollTrigger);


const AVATARS = [
  "/imgs/lukas_avatar.avif",
  "/imgs/edoardo_avatar.avif",
  "/imgs/matthew_avatar.avif"
];

export const TESTIMONIALS = t("common.testimonials.items").map((item, index) => ({
  ...item,
  avatarSrc: AVATARS[index]
}));

const Y_OFFSETS = [80, 56, 120];

export function TestimonialCard({
  body,
  name,
  role,
  avatarSrc,
  avatarBg = "#3a3a3a",
  wantsPlay = false,
  className = "",
  revealTrigger = "manual"
}) {
  const initial = name?.trim()?.[0]?.toUpperCase() || "?";
  const textRef = useRef(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (wantsPlay && !hasPlayedRef.current && textRef.current) {
      hasPlayedRef.current = true;
      textRef.current();
    }
  }, [wantsPlay]);

  return (
    <article
      className={`testimonial-card bg-foreground text-background p-24 lg:p-32 flex flex-col gap-24 ${className}`}
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >
      <AnimatedText
        tag="p"
        className="text-body leading-relaxed"
        type="lines"
        mask="lines"
        duration={0.6}
        stagger={0.04}
        ease="power2.out"
        animationProps={{ yPercent: 100 }}
        triggerMode={revealTrigger === "scroll" ? "scroll" : "manual"}
        onReady={revealTrigger === "scroll" ? undefined : (readyFn) => {
          textRef.current = readyFn;
          if (wantsPlay && !hasPlayedRef.current) {
            hasPlayedRef.current = true;
            readyFn();
          }
        }}
      >
        {body}
      </AnimatedText>

      <div className="flex items-center gap-16">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt=""
            className="block rounded-full object-cover shrink-0"
            style={{ width: 44, height: 44 }}
          />
        ) : (
          <span
            className="flex items-center justify-center rounded-full shrink-0 text-background/80 text-mono-sm"
            style={{ width: 44, height: 44, background: avatarBg }}
            aria-hidden="true"
          >
            {initial}
          </span>
        )}
        <div className="flex flex-col gap-2">
          <span className="text-body">{name}</span>
          <span className="text-body text-background/55">{role}</span>
        </div>
      </div>
    </article>
  );
}


export default function TestimonialsSection({ images = [], globe = true }) {
  const sectionRef = useRef(null);
  const globeWrapperRef = useRef(null);
  const cardsRef = useRef([]);
  const isLg = useBreakpoint("lg");

  useGSAP(() => {
    if (!isLg) return;

    const globeEl = globeWrapperRef.current;
    const cards = cardsRef.current.filter(Boolean);

    if (!globeEl && cards.length === 0) return;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    if (globeEl) {
      tl.fromTo(globeEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, 0);
      tl.to(globeEl, { autoAlpha: 0, duration: 0.25 }, 0.65);
    }

    cards.forEach((card, index) => {
      const yOffset = Y_OFFSETS[index] ?? 24;
      tl.fromTo(card, { y: yOffset }, { y: -yOffset, duration: 1, force3D: true }, 0);
    });
  }, { scope: sectionRef, dependencies: [isLg] });

  const [wantsPlay, setWantsPlay] = useState(false);
  const [globeActive, setGlobeActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const playObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setWantsPlay(true);
        playObserver.disconnect();
      }
    }, { rootMargin: "0px 0px -40% 0px" });

    const activeObserver = new IntersectionObserver(([entry]) => {
      setGlobeActive(entry?.isIntersecting ?? false);
    }, { rootMargin: "300px 0px 300px 0px" });

    playObserver.observe(el);
    activeObserver.observe(el);

    return () => {
      playObserver.disconnect();
      activeObserver.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} data-theme="light" className="testimonials relative bg-background text-foreground overflow-hidden">
      {isLg && globe ? (
        <div ref={globeWrapperRef} className="testimonials-globe absolute inset-0 opacity-0" aria-hidden="true">
          <Globe images={images} wantsPlay={wantsPlay} active={globeActive} />
        </div>
      ) : null}

      <div className="v2-container relative py-128 lg:py-192 pointer-events-none">
        <div className="pointer-events-auto mb-48 max-w-[34ch] lg:mb-80 lg:px-64">
          <h2 className="text-h2 font-medium">
            {t("common.testimonials.heading")}
          </h2>
          <p className="mt-12 text-body-lg text-foreground-muted">
            {t("common.testimonials.sub")}
          </p>
        </div>

        <div className="relative grid grid-cols-12 grid-rows-[repeat(3,min-content)] gap-x-24 gap-y-16 lg:gap-y-24 lg:px-64">
          <div ref={el => (cardsRef.current[0] = el)} className="col-span-12 lg:col-span-4 lg:col-start-2 lg:row-start-1 pointer-events-auto">
            <TestimonialCard {...TESTIMONIALS[0]} wantsPlay={wantsPlay} />
          </div>

          <div ref={el => (cardsRef.current[1] = el)} className="col-span-12 lg:col-span-4 lg:col-start-8 lg:row-start-2 pointer-events-auto">
            <TestimonialCard {...TESTIMONIALS[1]} wantsPlay={wantsPlay} />
          </div>

          <div ref={el => (cardsRef.current[2] = el)} className="col-span-12 lg:col-span-4 lg:col-start-3 lg:row-start-3 pointer-events-auto">
            <TestimonialCard {...TESTIMONIALS[2]} wantsPlay={wantsPlay} />
          </div>
        </div>
      </div>
    </section>
  );
}
