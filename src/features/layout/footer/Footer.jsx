'use client';

import React, { forwardRef, useRef, useState, useEffect, useImperativeHandle, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import Link from 'next/link';
import { XLogo, LinkedinLogo, InstagramLogo, GithubLogo } from '@components/shared'
import LogoIcon from '@components/ui/LogoIcon'
import LogoText from '@features/utilities/LogoText'
import HomeLink from '@features/utilities/HimeLink'
import NewsletterForm, { NewsletterEyebrow } from '@components/NewsletterEyebrow'
import { useReveal } from '@hooks/useReveal';
import { useCategories } from '@providers/CategoryProvider'
import { t } from '@components/helpers/translate';
import analytics from '@lib/analytics/analytics';
import { isRouteActive } from '@config/isRouteActive';

export const Divider = forwardRef(function Divider({
  orientation = "horizontal",
  thickness = 1,
  length = "full",
  color,
  duration = 0.8,
  delay = 0,
  ease = "power3.out",
  start = "top 85%",
  triggerMode = "scroll",
  skip = false,
  className = ""
}, forwardedRef) {
  const ref = useRef(null);
  const isHorizontal = orientation === "horizontal";
  const scaleProp = isHorizontal ? "scaleX" : "scaleY";
  const transformOrigin = isHorizontal ? "left center" : "top center";

  const { reveal } = useReveal(ref, {
    mode: triggerMode === "scroll" ? "scroll" : "manual",
    build: skip ? null : (el) => gsap.timeline({ paused: true }).fromTo(el, {
      [scaleProp]: 0,
      transformOrigin: transformOrigin
    }, {
      [scaleProp]: 1,
      duration: duration,
      delay: delay,
      ease: ease
    }),
    start: start,
    deps: [isHorizontal, duration, delay, ease, skip]
  });

  useImperativeHandle(forwardedRef, () => ({ reveal: reveal }), [reveal]);

  useEffect(() => {
    if (triggerMode !== "immediate" || skip) return;
    reveal();
  }, [triggerMode, skip, reveal]);

  const dimensionsStyle = isHorizontal 
    ? { height: `${thickness}px`, width: length === "full" ? "100%" : length } 
    : { width: `${thickness}px`, height: length === "full" ? "100%" : length };

  const style = color ? { ...dimensionsStyle, backgroundColor: color } : dimensionsStyle;

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={`landing-divider ${className}`.trim()}
      style={style}
    />
  );
});

const AI_QUERY = encodeURIComponent("What does Annnimate (https://annnimate.com), the production-ready GSAP component library for React, Vue and HTML, offer - and how do I add a component to my project?");

const AI_LINKS = [
  {
    name: "Claude",
    href: `https://claude.ai/new?q=${AI_QUERY}`,
    Icon: function ClaudeIcon(props) {
      return (
        <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <path d="m2.35 7.98 2.36-1.33.04-.11-.04-.06H4.6l-.4-.03-1.34-.04-1.17-.04L.55 6.3l-.28-.07L0 5.9l.03-.17.24-.16.34.03.76.05 1.14.08.83.04 1.22.13h.2l.02-.08-.07-.05-.05-.04-1.18-.8-1.27-.85-.67-.48-.36-.25L1 3.11l-.08-.5.33-.36.44.03.1.03.46.34.95.74 1.24.91.19.16.07-.06v-.03l-.07-.14-.68-1.22-.72-1.25-.33-.51-.08-.31a2 2 0 0 1-.05-.37l.37-.5.2-.07.5.07.22.18.3.7.5 1.12.78 1.52.23.44.12.42.05.13h.08V4.5l.06-.85.12-1.05.12-1.34.04-.38.18-.46.38-.24.29.14.24.34-.03.22-.15.93-.28 1.45-.18.97h.1l.13-.12.5-.66.82-1.03.36-.4.43-.46.27-.22h.52l.38.57-.17.58-.53.68-.45.57-.63.85-.4.68.04.05h.1L9.8 5l.77-.14.92-.16.41.2.05.2-.16.4-.99.24-1.15.23-1.72.4-.02.02.02.03.78.08.33.01h.8l1.52.12.4.26.23.32-.04.24-.6.3-.83-.19-1.91-.45-.66-.17h-.09v.06l.55.53 1 .9 1.26 1.17.06.3-.16.22-.17-.02-1.1-.83-.43-.38-.96-.8h-.07v.08l.22.32 1.18 1.76.06.54-.09.18-.3.1-.33-.05-.7-.97-.7-1.08L6.62 8l-.07.04-.34 3.63-.16.18-.36.14-.3-.23-.16-.37.16-.74.2-.96.15-.77.14-.95.09-.31v-.03l-.08.01-.72.99-1.09 1.47-.86.92-.2.08-.36-.18.03-.33.2-.3 1.2-1.51.71-.95.47-.54v-.08h-.03L2.07 9.28l-.57.07-.24-.22.03-.38.11-.12z" fill="currentColor" />
        </svg>
      );
    }
  },
  {
    name: "ChatGPT",
    href: `https://chatgpt.com/?q=${AI_QUERY}`,
    Icon: function ChatGPTIcon(props) {
      return (
        <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <path d="M4.6 4.37V3.23q0-.15.12-.22L7 1.7q.48-.27 1.06-.26a2.3 2.3 0 0 1 2.33 2.3v.28L8.01 2.6a.4.4 0 0 0-.43 0zM9.9 8.8V6.08a.4.4 0 0 0-.2-.37l-3-1.75.98-.56a.2.2 0 0 1 .24 0l2.27 1.32c.66.38 1.1 1.2 1.1 1.99 0 .91-.54 1.75-1.38 2.1m-6-2.4-.97-.58q-.13-.08-.12-.21V2.98c0-1.29.97-2.26 2.3-2.26q.76.01 1.35.47L4.12 2.56a.4.4 0 0 0-.22.37zM6 7.63l-1.4-.79V5.16l1.4-.8 1.4.8v1.68zm.9 3.65q-.76-.01-1.36-.47l2.34-1.37a.4.4 0 0 0 .22-.37V5.6l.99.58q.12.08.12.21v2.64c0 1.29-1 2.26-2.31 2.26M4.08 8.6 1.8 7.28A2.4 2.4 0 0 1 .7 5.3c0-.92.55-1.75 1.4-2.1v2.74q0 .25.2.37L5.3 8.04l-.97.56a.2.2 0 0 1-.24 0m-.13 1.97A2.27 2.27 0 0 1 1.62 8.3q0-.14.02-.29l2.34 1.37a.4.4 0 0 0 .43 0L7.4 7.63v1.14q0 .15-.12.22L5 10.3q-.48.26-1.06.26M6.9 12A3 3 0 0 0 9.8 9.6a3 3 0 0 0 1.2-5.14q.08-.37.09-.75A2.98 2.98 0 0 0 7.18.86a2.97 2.97 0 0 0-5 1.54A3 3 0 0 0 1 7.54q-.1.37-.1.75a2.98 2.98 0 0 0 3.92 2.85c.53.52 1.27.86 2.08.86" fill="currentColor" />
        </svg>
      );
    }
  },
  {
    name: "Perplexity",
    href: `https://www.perplexity.ai/search?q=${AI_QUERY}`,
    Icon: function PerplexityIcon(props) {
      return (
        <svg width="16" height="16" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <path fillRule="evenodd" clipRule="evenodd" d="m1.5 0 3.27 2.95V.08h.6v2.87L8.65 0v3.36H10V8.4H8.65V12L5.37 8.82v3.07h-.6V8.84L1.55 12 1.5 8.35H0v-5h1.5zm.59 3.36h2.24L2.1 1.34zm2.25.59H.6v3.8h.9v-1zm.43.41L2.09 7l.04 3.6 2.64-2.58zm.6 0V8l2.69 2.6V7zm.42-.41 2.86 2.8V7.8h.75V3.95zm.01-.6h2.26V1.38h-.04z" fill="currentColor" />
        </svg>
      );
    }
  },
  {
    name: "Grok",
    href: `https://grok.com/?q=${AI_QUERY}`,
    Icon: function GrokIcon(props) {
      return (
        <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
          <path d="m4.62 7.62 4.04-3.08c.2-.15.49-.1.58.14a3.5 3.5 0 0 1-.71 3.74 3.2 3.2 0 0 1-3.63.74l-1.37.66a4.45 4.45 0 0 0 5.86-.5 4.8 4.8 0 0 0 1.21-4.4c-.5-2.2.13-3.1 1.4-4.9Q12 0 11.98 0L10.4 1.62z" fill="currentColor" />
          <path d="M3.82 3.57c-1.2 1.24-1.45 3.4-.03 4.8L.01 11.83q-.02.02-.02-.02.36-.45.76-.87l.02-.02c.85-.93 1.7-1.85 1.18-3.14a4.8 4.8 0 0 1 1-5.1 4.45 4.45 0 0 1 5.87-.51l-1.37.65a3.3 3.3 0 0 0-3.64.75" fill="currentColor" />
        </svg>
      );
    }
  }
];

function AskAi() {
  return (
    <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
      <span className="text-mono-sm text-foreground-muted">{t("common.footer.askAi")}</span>
      <div className="flex items-center gap-6">
        {AI_LINKS.map(({ name, href, Icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ask about Annnimate on ${name}`}
            onClick={() => analytics.askAi.clicked(name.toLowerCase())}
            className="inline-flex size-28 items-center justify-center border border-foreground/10 text-foreground-muted transition-colors duration-300 ease-out hover:border-foreground/30 hover:text-foreground"
          >
            <Icon />
          </a>
        ))}
      </div>
    </div>
  );
}

const PLATFORM_LINKS = {
  label: t("common.footer.columns.platform"),
  links: [
    { label: t("common.footer.platformLinks.howItWorks"), href: "/platform" },
    { label: t("common.footer.platformLinks.documentation"), href: "/docs" },
    { label: t("common.footer.platformLinks.mcpServer"), href: "/docs/guides/mcp" },
    { label: t("common.footer.platformLinks.learnGsap"), href: "/learn" },
    { label: t("common.footer.platformLinks.freeTools"), href: "/tools" },
    { label: t("common.footer.platformLinks.compare"), href: "/compare" },
    { label: t("common.footer.platformLinks.stateOfWebAnimation"), href: "/state-of-web-animation" },
    { label: t("common.footer.platformLinks.changelog"), href: "/changelog" },
    { label: t("common.footer.platformLinks.roadmap"), href: "/roadmap" },
    { label: t("common.footer.platformLinks.pricing"), href: "/pricing" },
    { label: t("common.footer.platformLinks.faqs"), href: "/faq" },
    { label: t("common.footer.platformLinks.affiliates"), href: "/affiliate" }
  ]
};

const KITS_LINKS = {
  label: t("common.footer.columns.kits"),
  links: [
    { label: t("common.footer.kitsLinks.seeTheKits"), href: "/kits" },
    { label: t("common.footer.kitsLinks.whatAKitIs"), href: "/kits" },
    { label: t("common.footer.kitsLinks.kitVsLibrary"), href: "/kits" },
    { label: t("common.footer.kitsLinks.foundingOffer"), href: "/whats-new" }
  ]
};

const SOCIAL_LINKS = [
  { label: "X", href: "https://x.com/juli_fella", Icon: XLogo },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/julianfella/", Icon: LinkedinLogo },
  { label: "Instagram", href: "https://www.instagram.com/goodfelladesign/", Icon: InstagramLogo },
  { label: "GitHub", href: "https://github.com/GoodFellaStudio", Icon: GithubLogo }
];

const LEGAL_LINKS = [
  { label: t("common.footer.legalLinks.privacy"), href: "/privacy" },
  { label: t("common.footer.legalLinks.terms"), href: "/terms" },
  { label: t("common.footer.legalLinks.cookies"), href: "/cookies" },
  { label: t("common.footer.legalLinks.refund"), href: "/refund" }
];

function FooterAccordion({ label, links }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const iconRef = useRef(null);
  const verticalLineRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    gsap.set(el, { height: 0, overflow: "hidden", force3D: true });
    
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.5, ease: "expo.inOut" } });
    tl.to(el, { height: "auto" }, 0);
    
    if (iconRef.current) {
      tl.to(iconRef.current, { rotation: -180 }, 0);
    }
    if (verticalLineRef.current) {
      tl.to(verticalLineRef.current, { opacity: 0, duration: 0.25, ease: "power2.inOut" }, 0.1);
    }
    
    timelineRef.current = tl;
    return () => tl.kill();
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      isOpen ? timelineRef.current.play() : timelineRef.current.reverse();
    }
  }, [isOpen]);

  return (
    <div className="border-b border-foreground/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-16 py-20 text-left text-foreground transition-colors duration-300"
      >
        <span className="text-mono-sm">{label}</span>
        <svg ref={iconRef} className="h-12 w-12 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path ref={verticalLineRef} d="M8 1V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M1 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </button>
      <div ref={contentRef}>
        <ul className="flex flex-col gap-4 pb-20">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                active={!link.external && isRouteActive(pathname, link.href) ? "true" : undefined}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="text-body-sm text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FooterClock() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Vienna"
    });
    
    const updateTime = () => setTime(formatter.format(new Date()));
    updateTime();
    
    const intervalId = setInterval(updateTime, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <span className="text-mono-sm text-foreground-muted">
      {time ? t("common.footer.studioClock", { time }) : ""}
    </span>
  );
}

function LatestAnimation({ latest }) {
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return null;
    const timeMs = new Date(dateStr).getTime();
    if (Number.isNaN(timeMs)) return null;
    
    const diffDays = Math.floor((Date.now() - timeMs) / 86400000);
    if (diffDays <= 0) return t("common.footer.relativeTime.today");
    if (diffDays === 1) return t("common.footer.relativeTime.yesterday");
    if (diffDays < 7) return t("common.footer.relativeTime.daysAgo", { n: diffDays });
    if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return diffWeeks === 1 ? t("common.footer.relativeTime.weekAgo") : t("common.footer.relativeTime.weeksAgo", { n: diffWeeks });
    }
    
    const diffMonths = Math.floor(diffDays / 30);
    return diffMonths === 1 ? t("common.footer.relativeTime.monthAgo") : t("common.footer.relativeTime.monthsAgo", { n: diffMonths });
  };

  const relativeTimeStr = getRelativeTime(latest?.published_at);
  const title = latest?.title;
  const slug = latest?.slug;

  return (
    <div className="text-mono-sm flex flex-wrap items-center gap-x-12 gap-y-4 text-foreground-muted">
      <span className="relative inline-flex h-12 w-12" aria-hidden="true">
        <span className="absolute inset-0 animate-ping bg-brand opacity-60" />
        <span className="relative inline-block h-12 w-12 bg-brand" />
      </span>
      {title && slug ? (
        <React.Fragment>
          <span>{t("common.footer.status.justShipped")}</span>
          <Link href={`/animations/${slug}`} className="text-mono-sm text-foreground">
            {title}
          </Link>
          {relativeTimeStr ? (
            <React.Fragment>
              <span className="opacity-40">·</span>
              <span>{relativeTimeStr}</span>
            </React.Fragment>
          ) : null}
        </React.Fragment>
      ) : (
        <span>{t("common.footer.status.default")}</span>
      )}
    </div>
  );
}

function FooterWordmark() {
  const wordmarkRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (!wordmarkRef.current) return;
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsRevealed(true);
      return;
    }
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsRevealed(entry.isIntersecting);
    }, { rootMargin: "0px 0px -5% 0px" });
    
    observer.observe(wordmarkRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wordmarkRef} className="footer-wordmark w-full max-w-[1920px] mx-auto py-48 lg:py-80" data-revealed={isRevealed ? "true" : "false"}>
      <div className="overflow-hidden">
        <LogoText width="100%" style={{ height: "auto" }} className="footer-wordmark-svg block text-foreground/10" />
      </div>
    </div>
  );
}

export default function Footer({ latestAnimation }) {
  const pathname = usePathname();
  const categories = useCategories();
  
  const navColumns = useMemo(() => [
    PLATFORM_LINKS,
    {
      label: t("common.footer.columns.library"),
      links: [
        { label: t("common.footer.libraryLinks.allComponents"), href: "/animations" },
        ...categories.map((cat) => ({ label: cat.name, href: `/animations?category=${cat.slug}` })),
        { label: t("common.footer.libraryLinks.showcase"), href: "/built-with" }
      ]
    },
    KITS_LINKS
  ], [categories]);

  return (
    <footer data-theme="dark" className="annnimate-footer relative bg-background px-24 pb-24 lg:px-32 lg:pb-32">
      <div data-theme="light" className="relative z-[20] p-24 lg:p-48 overflow-hidden bg-background text-foreground">
        <div className="w-full max-w-[1920px] mx-auto py-24">
          <div className="grid grid-cols-12 items-center gap-16">
            <div className="col-span-12 md:col-span-7">
              <LatestAnimation latest={latestAnimation} />
            </div>
            <div className="col-span-12 md:col-span-5 md:justify-self-end">
              <div className="flex flex-wrap items-center gap-x-24 gap-y-12">
                <AskAi />
                <FooterClock />
              </div>
            </div>
          </div>
        </div>
        
        <Divider />
        
        <div className="w-full max-w-[1920px] mx-auto py-32 lg:py-64">
          <div className="grid grid-cols-12 gap-16 gap-y-64">
            <div className="col-span-12 flex flex-col gap-32 lg:col-span-5">
              <HomeLink href="/" aria-label="Annnimate home" className="inline-block w-fit">
                <LogoIcon height={20} className="text-foreground" />
              </HomeLink>
              
              <NewsletterForm source="footer" idPrefix="footer" eyebrow={<NewsletterEyebrow />} inputSize="lg" />
              
              <div className="flex flex-wrap items-center gap-x-12 gap-y-16">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-32 items-center justify-center text-foreground transition-colors duration-(--duration-fast) ease-(--ease-expo-out) hover:text-foreground-muted"
                  >
                    <Icon className="size-20" aria-hidden="true" />
                  </a>
                ))}
                <Link
                  href="/contact"
                  active={isRouteActive(pathname, "/contact") ? "true" : undefined}
                  className="text-mono-sm text-foreground"
                >
                  {t("common.footer.contact")}
                </Link>
              </div>
            </div>
            
            <div className="col-span-12 flex flex-col lg:hidden">
              {navColumns.map((col) => (
                <FooterAccordion key={col.label} label={col.label} links={col.links} />
              ))}
            </div>
            
            {navColumns.map((col, index) => (
              <nav key={col.label} aria-label={col.label} className={`hidden lg:col-span-2 lg:block ${index === 0 ? "lg:col-start-7" : ""}`}>
                <p className="text-mono-sm mb-24 text-foreground-muted">{col.label}</p>
                <ul className="flex flex-col gap-4">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        active={!link.external && isRouteActive(pathname, link.href) ? "true" : undefined}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="text-body-sm text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        
        <Divider />
        <FooterWordmark />
        
        <div className="w-full max-w-[1920px] mx-auto pb-24">
          <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-center">
            <div className="text-mono-sm flex flex-wrap items-center gap-x-8 gap-y-4 text-foreground-muted">
              <span>{t("common.footer.copyright", { year: new Date().getFullYear() })}</span>
              <span className="opacity-40">·</span>
              <span>{t("common.footer.builtBy")}</span>
              <Link href="https://good-fella.com" target="_blank" rel="noopener noreferrer" className="text-mono-sm text-foreground">
                {t("common.footer.builtByName")}
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-32 gap-y-12">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  active={isRouteActive(pathname, link.href) ? "true" : undefined}
                  className="text-mono-sm text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("annnimate:open-cookie-preferences"))}
                className="text-mono-sm inline-flex items-center text-foreground-muted transition-colors duration-300 ease-out hover:text-foreground"
              >
                {t("common.footer.cookiePreferences")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
