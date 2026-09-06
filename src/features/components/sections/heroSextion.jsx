"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  Fragment
} from "react";
import { createPortal } from "react-dom";

import {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  MotionPathPlugin,
  Draggable,
  InertiaPlugin
} from "@lib/vendor";

import { t } from "@components/helpers/translate"; 
import { useAnimation, usePageEnterAnimation } from "@providers/AnimationProvider"; 
import { useReveal } from "@hooks/useReveal"; 
import { useBreakpoint } from "@hooks/useBreakpoint"; 
import { useTransitionRouter } from "@providers/TransitionRouterProvider"; 
import { preloadSharedImages } from "@/shared/loadSharedImage"; 
import { perfLog } from "@providers/AnimationProvider";
import SiteConfig from "@config/siteConfig"; 
import Reveal from "@features/utilities/Reveal";
import PlatformMockup from "@features/utilities/PlatformMockup"; 
import KitSpotlight from "@components/KitSpotlight"; 
import Footer from "@features/layout/footer/Footer";

import AnimatedButton from "@animations/components/AnimatedButton";
import AnimatedText from "@animations/components/AnimatedText"; 
import AnimatedList from "@animations/components/AnimatedList"; 
import PricingCycleToggle from "@animations/components/PricingCycleToggle"; 
import PricingCard from "@components/pricing/PricingCard";
import ImageLayout from "@components/ImageLayout";
import RevealHeadline from "@animations/components/RevealHeadline"; 
import TestimonialsSection from "@components/sections/TestimonialsSection"; 
import StarterPackSection from "@components/sections/StarterPackSection"; 
import ShowreelVideo, { JustShipped } from "@components/sections/JustShipped";
import EndCTA from "@components/sections/EndCTASection";
import ValueMath from "@components/sections/ValueMath"; 
import LogoCocaCola from "@components/assets/logos/CocaCola";
import LogoBodyArmor from "@components/assets/logos/BodyArmor"; 
import LogoWKNDHRS from "@components/assets/logos/WKNDHRS"; 
import LogoPowerade from "@components/assets/logos/Powerade"; 
import { 
  MagnifyingGlass, 
  Funnel, 
  Columns, 
  List, 
  Copy, 
  Check 
} from "@phosphor-icons/react";

const GOOD_FELLA_LOGO = function ({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1616.59 1500"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M976.42,762.91h-76.36c-55.23,0-80.53,24.42-80.53,77.15v304.09c0,8.45,4.51,12.95,12.95,12.95h143.94c8.45,0,12.95-4.51,12.95-12.95v-368.29c0-8.45-4.51-12.95-12.95-12.95Z" />
      <path d="M1170.15,762.91h-144.09c-8.45,0-12.95,4.51-12.95,12.95v368.29c0,8.45,4.51,12.95,12.95,12.95h76.52c55.23,0,80.53-24.42,80.53-77.15v-304.09c0-8.45-4.51-12.95-12.95-12.95Z" />
      <path d="M1491.91,762.91h-271.43c-9.01,0-13.52,4.51-13.52,13.52v171.15h173.6v-98.05c0-15.24,23.65-15.22,23.65,0v109.2c0,6.41-5.43,13.18-11.83,13.18h-185.43v107.49c0,46.74,30.97,77.71,77.71,77.71h106.99c15.77,0,25.46-13.52,27.15-29.28v-71.66c.56-6.19,6.22-10.14,12.42-10.14,5.07,0,11.86,4.66,11.29,9.72l-.06,88.41c0,9,2.82,12.95,11.26,12.95h102.94c8.45,0,13.76-4.51,13.76-12.95v-303.53c0-46.74-31.78-77.71-78.52-77.71Z" />
      <path d="M1183.34,288.02c0-46.93-30.97-78.02-77.71-78.02h-207.79c-46.74,0-77.71,31.1-77.71,78.02v373.14c0,46.93,30.97,78.02,77.71,78.02h275.57c7.58,0,9.94-4.53,9.94-10.74v-440.42ZM1012.47,635.67c0,15.24-23.65,15.22-23.65,0v-320.33c0-15.24,23.65-15.22,23.65,0v320.33Z" />
      <path d="M613.38,972.15v63.14c0,15.24-23.65,15.22-23.65,0v-74.96c0-6.41,5.43-12.43,11.83-12.43h194.3v-107.26c0-46.74-30.97-77.71-77.71-77.71h-207.23c-46.74,0-77.71,30.97-77.71,77.71v238.77c0,46.74,30.97,77.71,77.71,77.71h207.23c46.74,0,77.71-30.97,77.71-77.71v-107.24h-182.48ZM589.73,850.01c0-15.24,23.65-15.22,23.65,0v50.27c0,15.24-23.65,15.22-23.65,0v-50.27Z" />
      <path d="M1217.67,739.18h274.81c46.74,0,77.71-31.1,77.71-78.02v-373.14c0-46.93-30.97-78.02-77.71-78.02h-274.81c-6.19,0-10.7,4.52-10.7,10.74v507.7c0,6.22,4.51,10.74,10.7,10.74ZM1368.17,315.34c0-15.24,23.65-15.22,23.65,0v320.1c0,15.24-23.65,15.22-23.65,0v-320.1Z" />
      <path d="M718.71,210h-207.79c-46.74,0-77.71,31.1-77.71,78.02v373.14c0,46.93,30.97,78.02,77.71,78.02h207.79c46.74,0,77.71-31.1,77.71-78.02v-373.14c0-46.93-30.97-78.02-77.71-78.02ZM619.12,634.77c0,15.24-23.65,15.22-23.65,0v-318.07c0-15.24,23.65-15.22,23.65,0v318.07Z" />
      <path d="M212.88,458.5c-1.92-1.89-3.17-4.57-3.17-8.06v-149.57c0-15.24,23.65-15.22,23.65,0v137.74h176.04v-215.61c0-9.05-4.51-13-12.95-13H123.9c-46.74,0-77.68,31.1-77.68,78.02l-.03,373.14c0,46.93,30.97,78.02,77.71,78.02h274.81c6.19,0,10.7-4.52,10.7-10.74v-266.17h-187.9c-3.85,0-6.72-1.51-8.63-3.77ZM233.34,521.59v113.56c0,15.24-23.65,15.22-23.65,0v-113.56c0-15.24,23.65-15.22,23.65,0Z" />
      <path d="M232.92,972.01c-15.24,0-15.22-24.24,0-24.24h176.47l-.02-171.91c0-8.45-4.51-12.95-12.95-12.95H121.13c-42.8,0-74.97,34.91-74.97,77.71v438.68c0,6.19,5.25,10.7,12.92,10.7,86.01,0,155.36-56.99,164.69-132.81h173.34c8.96,0,12.31-6.8,12.31-14.39l-.02-170.79h-176.47Z" />
    </svg>
  );
};

const LOGOS_LIST = [ 
  { name: "Coca-Cola", Logo: LogoCocaCola, className: "h-24" },
  { name: "BodyArmor", Logo: LogoBodyArmor, className: "h-14" },
  { name: "WKNDHRS", Logo: LogoWKNDHRS, className: "h-12" },
  { name: "Powerade", Logo: LogoPowerade, className: "h-28" },
  { name: "Good Fella", Logo: GOOD_FELLA_LOGO, className: "h-40" }
];

const ANIMATION_LINES_PROPS = { 
  type: "lines",
  mask: "lines",
  duration: 0.6,
  stagger: 0.03,
  ease: "power2.out",
  animationProps: { yPercent: 100 },
  triggerMode: "pageEnter"
};

const HOW_IT_WORKS_STEPS = t("landing.howItWorks.steps"); 
const COPY_TABS = t("landing.howItWorks.scenes.copyTabs"); 
const HOW_IT_WORKS_ANIM_PROPS = { 
  type: "lines",
  mask: "lines",
  duration: 0.5,
  stagger: 0.03,
  ease: "power2.out",
  animationProps: { yPercent: 100 },
  triggerMode: "manual"
};

const CODE_SAMPLES = { 
  React: `import { useGSAP } from "@gsap/react"
import gsap from "gsap"

function Box() {
  const box = useRef(null)
  useGSAP(() => {
    gsap.to(box.current, {
      x: 200,
      duration: 1,
      ease: "expo.out",
    })
  })
  return <div ref={box} className="box" />
}`,
  Vue: `<script setup>
import { ref, onMounted } from "vue"
import gsap from "gsap"

const box = ref(null)
onMounted(() => {
  gsap.to(box.value, {
    x: 200,
    duration: 1,
    ease: "expo.out",
  })
})
</script>`,
  HTML: `<div class="box"></div>

<script>
  gsap.to(".box", {
    x: 200,
    duration: 1,
    ease: "expo.out",
  })
</script>`
};

const SYNTAX_HIGHLIGHT_REGEX = /("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)/g; // U

const TWO_WAYS_ANIM_PROPS = { // es
  type: "lines",
  mask: "lines",
  duration: 0.6,
  stagger: 0.03,
  ease: "power2.out",
  animationProps: { yPercent: 100 },
  triggerMode: "scroll"
};

const ONE_COMP_TABS = t("landing.oneComponent.tabs"); // eu
const ONE_COMP_PRESETS = t("landing.oneComponent.presetLabels"); // eg
const ONE_COMP_PRESET_CONFIGS = [ // em
  { label: ONE_COMP_PRESETS[0], duration: 0.7, ease: "power3.out" },
  { label: ONE_COMP_PRESETS[1], duration: 0.9, ease: "back.out(1.4)" },
  { label: ONE_COMP_PRESETS[2], duration: 1.1, ease: "elastic.out(1, 0.6)" }
];

const POSTER_BASE_URL = "https://annnimate.b-cdn.net/preview-assets/images/posters"; 
const POSTERS_RAW = [ 
  { src: `${POSTER_BASE_URL}/running-poster-neutral-3x4-1.avif`, alt: "Running" },
  { src: `${POSTER_BASE_URL}/tennis-poster-orange-3x4.avif`, alt: "Tennis" },
  { src: `${POSTER_BASE_URL}/cycling-poster-blue-3x4.avif`, alt: "Cycling" },
  { src: `${POSTER_BASE_URL}/football-poster-orange-3x4.avif`, alt: "Football" },
  { src: `${POSTER_BASE_URL}/snowboarding-poster-neutral-3x4-1.avif`, alt: "Snowboarding" },
  { src: `${POSTER_BASE_URL}/skateboarding-poster-neutral-3x4.avif`, alt: "Skateboarding" },
  { src: `${POSTER_BASE_URL}/running-poster-green-3x4.avif`, alt: "Running" },
  { src: `${POSTER_BASE_URL}/universal-poster-green-3x4.avif`, alt: "Universal" },
  { src: `${POSTER_BASE_URL}/running-poster-orange-3x4-1.avif`, alt: "Running" },
  { src: `${POSTER_BASE_URL}/cycling-poster-blue-3x4.avif`, alt: "Cycling" },
  { src: `${POSTER_BASE_URL}/running-poster-neutral-3x4-2.avif`, alt: "Running" },
  { src: `${POSTER_BASE_URL}/tennis-poster-orange-3x4.avif`, alt: "Tennis" },
  { src: `${POSTER_BASE_URL}/football-poster-orange-3x4.avif`, alt: "Football" },
  { src: `${POSTER_BASE_URL}/snowboarding-poster-neutral-3x4-1.avif`, alt: "Snowboarding" },
  { src: `${POSTER_BASE_URL}/skateboarding-poster-neutral-3x4.avif`, alt: "Skateboarding" },
  { src: `${POSTER_BASE_URL}/running-poster-green-3x4.avif`, alt: "Running" }
];
const POSTERS_FORMATTED = [...POSTERS_RAW, ...POSTERS_RAW.slice(0, 8)].map((item) => ({ 
  ...item,
  src: `${item.src}?width=600&format=auto`
}));

const FALLBACK_ANIMATIONS = [ 
  "circular-slider",
  "image-fly-in",
  "card-fan",
  "step-wipe",
  "wipe-slider",
  "multi-flip",
  "mega-menu",
  "dual-scramble",
  "radial-gallery"
];





function LogoStrip({ className = "", trigger = "scroll", delay = 0 }) { 
  return (
    <AnimatedList
      tag="ul"
      className={`flex flex-wrap items-center gap-x-24 gap-y-24 ${className}`}
      itemClassName="text-foreground-muted opacity-60 transition-opacity duration-300 hover:opacity-100"
      trigger={trigger}
      delay={delay}
    >
      {LOGOS_LIST.map(({ name, Logo, className: itemClassName }) => (
        <span className="block" key={name}>
          <Logo className={`${itemClassName} w-auto`} />
          <span className="sr-only">{name}</span>
        </span>
      ))}
    </AnimatedList>
  );
}

function HeroSection({ animations = [], count = 0, pool = [] }) { 
  return (
    <section data-theme="dark" className="relative overflow-hidden bg-background pt-96 pb-0 text-foreground lg:pt-160">
      <div className="v2-container">
        <div className="grid grid-cols-12 items-end gap-x-24 gap-y-40 lg:gap-x-32">
          <div className="col-span-12 lg:col-span-7">
            <h1 className="text-h1 hero-headline font-medium">
              {t("landing.hero.headlineLine1")}
              <br />
              {t("landing.hero.headlineLine2")}
            </h1>
            <AnimatedText tag="p" className="text-body-lg mt-24 max-w-[42rem] text-foreground-muted" {...ANIMATION_LINES_PROPS} delay={0.15}>
              {t("landing.hero.sub", { count })}
            </AnimatedText>
            <Reveal className="mt-32" delay={0.3}>
              <div className="flex flex-wrap items-center gap-24">
                <AnimatedButton href="/animations" theme="brand" size="sm">
                  {t("landing.hero.ctaPrimary", { count })}
                </AnimatedButton>
                <AnimatedButton href="/starter-pack" theme="surface" size="sm">
                  {t("landing.hero.ctaSecondary")}
                </AnimatedButton>
              </div>
              <p className="text-body-sm mt-16 text-foreground-muted">
                {t("landing.hero.ctaNote")}
              </p>
            </Reveal>
          </div>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <AnimatedText tag="p" className="text-body-lg max-w-[26ch] font-medium text-foreground" type="lines" mask="lines" duration={0.6} stagger={0.04} ease="power2.out" animationProps={{ yPercent: 100 }} triggerMode="pageEnter" delay={0.35}>
              {t("landing.provenance.line")}
            </AnimatedText>
            <LogoStrip className="mt-24 lg:mt-32" trigger="pageEnter" delay={0.4} />
          </div>
        </div>
      </div>
      <div className="relative mt-40 mb-[-80px] lg:mt-80 lg:mb-[-120px]">
        <div className="v2-container">
          {animations.length > 0 && (
            <PlatformMockup
              animations={animations}
              totalCount={count}
              revealOnPageEnter={true}
              filterBarDemo={true}
              filterPool={pool}
            />
          )}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[560px] lg:h-[820px]"
          style={{ background: "linear-gradient(to bottom, transparent 0%, var(--background) 90%)" }}
        />
      </div>
    </section>
  );
}

const AnimatedHeadline = forwardRef(function ( 
  {
    children,
    className = "",
    tag: Tag = "h2", 
    size = "h2", 
    delay = 0, 
    rectangleDuration = 0.8, 
    textDuration = 0.8, 
    rectangleColor = "var(--secondary)", 
    start = "top 95%", 
    stagger = 0.05, 
    triggerMode = "scroll", 
    onReady, 
    ...rest 
  },
  ref 
) {
  const containerRef = useRef(null); 
  const splitTextInstance = useRef(null); 
  const timelineRef = useRef(null); 
  const isPageEnterTriggered = useRef(false); 
  const [fontsReady, setFontsReady] = useState(false); 

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  const { getHasTriggered } = useAnimation(); 
  
  usePageEnterAnimation(() => {
    if (timelineRef.current) {
      timelineRef.current.restart();
    } else {
      isPageEnterTriggered.current = true;
    }
  }, [], "AnimatedHeadline", triggerMode === "pageEnter");

  useEffect(() => {
    if (triggerMode === "pageEnter" && fontsReady && timelineRef.current && getHasTriggered() && isPageEnterTriggered.current) {
      const timeoutId = setTimeout(() => {
        if (timelineRef.current) {
          timelineRef.current.restart();
          isPageEnterTriggered.current = false;
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [triggerMode, fontsReady, getHasTriggered]);

  useGSAP(() => {
    if (!containerRef.current || !fontsReady) return;
    
    const mm = gsap.matchMedia(); 
    let lineWrappers = []; 
    let lineRectangles = []; 

    return mm.add("(max-width: 767px)", () => {
      const split = SplitText.create(containerRef.current, {
        type: "lines",
        linesClass: "split-line",
        mask: "lines",
        aria: "none"
      });
      splitTextInstance.current = split;
      
      if (!split.lines || split.lines.length === 0) return;
      
      gsap.set(split.lines, { yPercent: 100, force3D: true });
      
      let config = {};
      if (triggerMode === "scroll") {
        config.scrollTrigger = {
          trigger: containerRef.current,
          start: start,
          toggleActions: "play none none none",
          invalidateOnRefresh: true
        };
      } else if (triggerMode === "immediate") {
        config.paused = false;
      } else {
        config.paused = true;
      }
      
      const tl = gsap.timeline(config);
      timelineRef.current = tl;
      
      tl.to(split.lines, {
        yPercent: 0,
        duration: textDuration,
        delay: delay,
        ease: "expo.out",
        stagger: stagger,
        force3D: true
      });
      
      if ((triggerMode === "manual" || triggerMode === "pageEnter") && onReady) {
        onReady(() => timelineRef.current?.restart());
      }
      
      if (isPageEnterTriggered.current && triggerMode === "pageEnter") {
        isPageEnterTriggered.current = false;
        tl.restart();
      }
      
      return () => {
        tl.kill();
        split.revert();
      };
    }), mm.add("(min-width: 768px)", () => {
      const split = SplitText.create(containerRef.current, {
        type: "lines",
        linesClass: "split-line",
        aria: "none"
      });
      splitTextInstance.current = split;
      
      if (!split.lines || split.lines.length === 0) return;
      
      lineWrappers = [];
      lineRectangles = [];
      
      split.lines.forEach(() => {
        const wrapper = document.createElement("div");
        wrapper.className = "line-wrapper";
        Object.assign(wrapper.style, {
          position: "relative",
          overflow: "visible",
          display: "inline-block",
          width: "fit-content",
          lineHeight: "0.9"
        });
        
        const rect = document.createElement("div");
        rect.className = "line-rectangle";
        Object.assign(rect.style, {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          background: rectangleColor,
          transformOrigin: "left center",
          zIndex: "2",
          pointerEvents: "none"
        });
        
        lineWrappers.push(wrapper);
        lineRectangles.push(rect);
      });
      
      split.lines.forEach((line, index) => {
        line.style.lineHeight = "0.9";
        line.parentNode.insertBefore(lineWrappers[index], line);
        lineWrappers[index].appendChild(line);
        lineWrappers[index].appendChild(lineRectangles[index]);
      });
      
      gsap.set(split.lines, { opacity: 0, x: "5rem", force3D: true });
      gsap.set(lineRectangles, { scaleX: 1, force3D: true, willChange: "transform" });
      
      let config = {};
      if (triggerMode === "scroll") {
        config.scrollTrigger = {
          trigger: containerRef.current,
          start: start,
          toggleActions: "play none none none",
          invalidateOnRefresh: true
        };
      } else if (triggerMode === "immediate") {
        config.paused = false;
      } else {
        config.paused = true;
      }
      
      const tl = gsap.timeline(config);
      timelineRef.current = tl;
      
      tl.to(lineRectangles, {
        scaleX: 0,
        duration: rectangleDuration,
        delay: delay,
        ease: "expo.inOut",
        stagger: stagger,
        force3D: true
      });
      
      tl.to(split.lines, {
        opacity: 1,
        x: 0,
        duration: textDuration,
        ease: "expo.out",
        stagger: stagger,
        force3D: true,
        onComplete: () => {
          gsap.set(lineRectangles, { clearProps: "willChange" });
        }
      }, "<+60%");
      
      if ((triggerMode === "manual" || triggerMode === "pageEnter") && onReady) {
        onReady(() => timelineRef.current?.restart());
      }
      
      if (isPageEnterTriggered.current && triggerMode === "pageEnter") {
        isPageEnterTriggered.current = false;
        tl.restart();
      }
      
      return () => {
        tl.kill();
        split.revert();
        lineWrappers.forEach((wrapper) => {
          if (wrapper?.parentNode) {
            while (wrapper.firstChild) {
              wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
            }
            wrapper.remove();
          }
        });
      };
    }), () => {
      mm.revert();
      timelineRef.current = null;
      isPageEnterTriggered.current = false;
      splitTextInstance.current = null;
    };
  }, { scope: containerRef, dependencies: [triggerMode, fontsReady] });

  useImperativeHandle(ref, () => ({
    play: () => {
      if (timelineRef.current) timelineRef.current.restart();
    },
    reset: () => {
      if (timelineRef.current) timelineRef.current.progress(0).pause();
    }
  }));

  return (
    <Tag
      ref={containerRef}
      className={`${size} ${className} tracking-tight`}
      {...(triggerMode === "pageEnter" && { "data-page-enter-animation": "true" })}
      {...rest}
    >
      {children}
    </Tag>
  );
});

function ProblemSection() { 
  const sectionRef = useRef(null); 
  const headlineRef = useRef(null); 
  const textRef = useRef(null); 
  const ctaRef = useRef(null); 

  useReveal(sectionRef, {
    mode: "scroll",
    build: () => {
      const tl = gsap.timeline({ paused: true });
      tl.call(() => headlineRef.current?.play?.(), [], 0);
      tl.fromTo(textRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.4);
      tl.fromTo(ctaRef.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.6);
      return tl;
    }
  });

  return (
    <section ref={sectionRef} data-theme="dark" className="relative overflow-hidden bg-background py-96 text-foreground lg:py-160">
      <ParticleGrid />
      <div className="v2-container relative z-10">
        <div className="grid grid-cols-12">
          <div className="col-span-12 flex flex-col items-center text-center lg:col-span-10 lg:col-start-2">
            <AnimatedHeadline
              ref={headlineRef}
              tag="h2"
              size="text-h1"
              className="max-w-[22ch] font-medium"
              triggerMode="manual"
              rectangleColor="var(--brand)"
            >
              {t("landing.problem.headlineLine1")}
              <br />
              {t("landing.problem.headlineLine2")}
            </AnimatedHeadline>
            <p ref={textRef} className="mt-40 max-w-[46ch] text-body-lg text-foreground-muted">
              {t("landing.problem.resolve")}
            </p>
            <div ref={ctaRef} className="mt-48">
              <AnimatedButton href="/animations" theme="brand" size="sm">
                {t("landing.problem.cta")}
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const ELLIPSE_TL = { cx: 0, cy: 0.36, rx: 0.17, ry: 0.44 }; 
const ELLIPSE_TR = { cx: 1, cy: 0.22, rx: 0.29, ry: 0.28 }; 
const ELLIPSE_BL = { cx: 0.14, cy: 0.9, rx: 0.2, ry: 0.3 }; 
const ELLIPSE_BR = { cx: 0.82, cy: 0.82, rx: 0.3, ry: 0.24 }; 
const REGIONS = ["tl", "tr", "bl", "br"]; 

function round6(val) { 
  return Math.round(1e6 * val) / 1e6;
}

function getEllipseDist(x, y, ellipse) { 
  let dx = (x - ellipse.cx) / ellipse.rx;
  let dy = (y - ellipse.cy) / ellipse.ry;
  return Math.max(0, round6(1 - Math.sqrt(dx * dx + dy * dy)));
}

function ParticleGrid() { 
  const containerRef = useRef(null); 
  
  const regionsData = useMemo(() => { 
    const generatePoints = function () {
      let seed = 91237; 
      const random = () => (seed = Math.imul(1664525, seed) + 0x3c6ef35f >>> 0) / 0x100000000; 
      let points = []; 
      
      for (let row = 0; row < 34; row++) {
        for (let col = 0; col < 68; col++) {
          let nx = col / 67; 
          let ny = row / 33; 
          if (ny < 0.04 || ny > 0.95) continue;
          
          let distances = { 
            tl: getEllipseDist(nx, ny, ELLIPSE_TL),
            tr: getEllipseDist(nx, ny, ELLIPSE_TR),
            bl: getEllipseDist(nx, ny, ELLIPSE_BL),
            br: getEllipseDist(nx, ny, ELLIPSE_BR)
          };
          
          let maxRegion = "tl"; 
          let maxDist = 0; 
          for (let region of REGIONS) {
            if (distances[region] > maxDist) {
              maxRegion = region;
              maxDist = distances[region];
            }
          }
          
          if (maxDist <= 0.02) continue;
          
          let baseOp = round6(Math.pow(maxDist, 1.1)); 
          let adjustedOp = baseOp; 
          
          if (maxRegion === "bl" || maxRegion === "br") {
            adjustedOp *= Math.min(1, Math.max(0, (0.95 - ny) / 0.22));
          } else {
            adjustedOp *= Math.min(1, Math.max(0, (ny - 0.04) / 0.26));
          }
          
          if (random() > round6(adjustedOp)) continue;
          
          let finalMaxOp = round6(0.65 * baseOp * (0.5 + 0.5 * random())); 
          points.push({ x: nx, y: ny, maxOp: finalMaxOp, region: maxRegion });
        }
      }
      return points;
    }();
    
    return REGIONS.map((region) => ({
      region,
      cells: generatePoints.filter((point) => point.region === region)
    }));
  }, []);

  useEffect(() => {
    let observer; 
    const element = containerRef.current; 
    if (!element) return;
    
    const ctx = gsap.context(() => { 
      const rects = gsap.utils.toArray("[data-kf-rect]", element); 
      const groups = gsap.utils.toArray("[data-kf-group]", element); 
      
      if (rects.length) {
        gsap.matchMedia().add({
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)"
        }, (context) => { 
          if (context.conditions.reduce) {
            gsap.set(groups, { opacity: 1 });
            rects.forEach((rect) => gsap.set(rect, { opacity: Number(rect.dataset.max) }));
            return;
          }
          
          let tweens = []; 
          tweens.push(
            gsap.to(rects, {
              opacity: (index, target) => gsap.utils.random(0.3, 1) * Number(target.dataset.max),
              duration: () => gsap.utils.random(0.6, 2),
              ease: "power1.inOut",
              repeat: -1,
              yoyo: true,
              repeatRefresh: true,
              stagger: { each: 0.01, from: "random" }
            })
          );
          
          observer = new IntersectionObserver(([entry]) => {
            tweens.forEach((tween) => (entry.isIntersecting ? tween.resume() : tween.pause()));
          }, { rootMargin: "150px" });
          
          observer.observe(element);
          
          return () => tweens.forEach((tween) => tween.kill());
        });
      }
    }, element);
    
    return () => {
      if (observer) observer.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {regionsData.map(({ region, cells }) => (
        <div data-kf-group="" className="absolute inset-0" key={region}>
          {cells.map((cell, index) => (
            <span
              key={index}
              data-kf-rect=""
              data-max={cell.maxOp}
              className="absolute block size-10 bg-brand"
              style={{
                left: `calc(${cell.x.toFixed(4)} * (100% - 10px))`,
                top: `calc(${cell.y.toFixed(4)} * (100% - 10px))`,
                opacity: 0
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function HowItWorksSection({ animations = [] }) { 
  const sectionRef = useRef(null); 
  const headlineRef = useRef(null); 
  const stepResolvers = useRef([]); 
  
  const imagesWithPreviews = useMemo(() => animations.filter((anim) => anim.preview_image_url), [animations]); 
  const searchThumbs = imagesWithPreviews.length >= 8 ? imagesWithPreviews.slice(4, 8) : imagesWithPreviews.slice(0, 4); 
  const previewItem = animations.find((anim) => anim.preview_video_url) || imagesWithPreviews[6] || imagesWithPreviews[0]; 
  
  const assignResolver = (index) => (resolver) => { stepResolvers.current[index] = resolver; }; 

  useReveal(sectionRef, {
    mode: "scroll",
    build: () => {
      const tl = gsap.timeline({ paused: true });
      tl.call(() => headlineRef.current?.reveal?.(), [], 0);
      for (let i = 0; i < 7; i++) {
        tl.call(() => stepResolvers.current[i]?.(), [], 0.12 + 0.02 * i);
      }
      return tl;
    }
  });

  const visuals = [ 
    <SearchVisual key="find" thumbs={searchThumbs} count={imagesWithPreviews.length} />,
    <CodeTabsVisual key="copy" tabs={COPY_TABS} />,
    <PreviewVisual key="ship" item={previewItem} />
  ];

  return (
    <section ref={sectionRef} data-theme="light" className="bg-background py-64 text-foreground lg:py-96">
      <div className="v2-container">
        <header className="mb-24 max-w-[42rem] lg:mb-32">
          <RevealHeadline
            ref={headlineRef}
            as="h2"
            sizeClass="text-h2"
            className="max-w-[28ch]"
            trigger="manual"
          >
            {t("landing.howItWorks.headline")}
          </RevealHeadline>
          <AnimatedText
            tag="p"
            className="text-body-lg mt-16 max-w-[40ch] text-foreground-muted"
            {...HOW_IT_WORKS_ANIM_PROPS}
            onReady={assignResolver(0)}
          >
            {t("landing.howItWorks.answer")}
          </AnimatedText>
        </header>
        <div className="grid grid-cols-1 gap-24 md:grid-cols-3 lg:gap-32">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <StepArticle
              key={index}
              num={index + 1}
              label={step.label}
              body={step.body}
              visual={visuals[index]}
              labelOnReady={assignResolver(1 + 2 * index)}
              bodyOnReady={assignResolver(2 + 2 * index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepArticle({ num, label, body, visual, labelOnReady, bodyOnReady }) { 
  return (
    <article className="flex flex-col">
      <div data-theme="dark" className="aspect-[16/10] w-full overflow-hidden border border-foreground/12 bg-background">
        {visual}
      </div>
      <div className="mt-20 flex flex-col gap-8">
        <span className="text-mono text-brand">
          {t("landing.howItWorks.stepWord")} {num}
        </span>
        <AnimatedText tag="h3" className="text-h4 text-foreground" {...HOW_IT_WORKS_ANIM_PROPS} onReady={labelOnReady}>
          {label}
        </AnimatedText>
        <AnimatedText tag="p" className="text-body-sm text-foreground-muted" {...HOW_IT_WORKS_ANIM_PROPS} onReady={bodyOnReady}>
          {body}
        </AnimatedText>
      </div>
    </article>
  );
}

function SearchVisual({ thumbs, count }) { 
  const LayoutIcons = [Columns, GridFour, List]; 
  return (
    <div className="relative h-full">
      <div className="grid h-full grid-cols-2 grid-rows-2 gap-4 p-4">
        {thumbs.map((thumb, index) => (
          <div key={thumb.slug || index} className="relative overflow-hidden border border-foreground/10 bg-surface">
            <img
              src={thumb.preview_image_url}
              alt=""
              loading="lazy"
              className="block object-cover"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center px-8">
        <div className="flex items-stretch border border-foreground/12 bg-surface text-foreground">
          <span className="text-accent-2xs flex items-center gap-4 px-10 text-foreground-muted">
            <span className="text-foreground">{count}</span> matching
          </span>
          <span aria-hidden="true" className="w-px self-stretch bg-foreground/10" />
          <span className="text-accent-2xs flex items-center gap-4 px-10 py-8 text-foreground">
            <Funnel className="size-11 text-foreground-muted" aria-hidden="true" />
            All
          </span>
          <span aria-hidden="true" className="w-px self-stretch bg-foreground/10" />
          <span className="text-accent-2xs flex items-center gap-4 px-10 text-foreground-muted">
            <MagnifyingGlass className="size-11" aria-hidden="true" />
            Search
            <kbd className="text-accent-2xs ml-2 flex h-14 min-w-14 items-center justify-center bg-foreground/10 px-2 text-foreground-muted">
              K
            </kbd>
          </span>
          <span aria-hidden="true" className="w-px self-stretch bg-foreground/10" />
          <span className="flex items-center gap-8 px-10">
            {LayoutIcons.map((IconComponent, index) => (
              <IconComponent
                key={index}
                className={`size-11 ${1 === index ? "text-foreground" : "text-foreground-muted"}`}
                aria-hidden="true"
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

function highlightSyntax(codeString) { 
  let match; 
  let tokens = []; 
  let lastIndex = 0; 
  
  SYNTAX_HIGHLIGHT_REGEX.lastIndex = 0;
  while ((match = SYNTAX_HIGHLIGHT_REGEX.exec(codeString))) {
    if (match.index > lastIndex) {
      tokens.push({ t: codeString.slice(lastIndex, match.index), c: "text-foreground/65" });
    }
    tokens.push({ t: match[0], c: match[1] ? "text-brand/80" : "text-brand" });
    lastIndex = SYNTAX_HIGHLIGHT_REGEX.lastIndex;
  }
  if (lastIndex < codeString.length) {
    tokens.push({ t: codeString.slice(lastIndex), c: "text-foreground/65" });
  }
  return tokens;
}

function CodeTabsVisual({ tabs }) { 
  const [activeTab, setActiveTab] = useState(tabs[0]); 
  const [copied, setCopied] = useState(false); 
  const codeContainerRef = useRef(null); 
  
  const currentCode = CODE_SAMPLES[activeTab] || ""; 

  useEffect(() => {
    const container = codeContainerRef.current; 
    if (!container) return;
    
    const ctx = gsap.context(() => { 
      const lines = gsap.utils.toArray("[data-code-line]", container); 
      if (lines.length) {
        gsap.matchMedia().add({
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)"
        }, (context) => { 
          if (context.conditions.reduce) {
            gsap.set(lines, { opacity: 1, x: 0 });
            return;
          }
          const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.3 }); 
          tl.set(lines, { opacity: 0, x: -6 })
            .to(lines, { opacity: 1, x: 0, duration: 0.2, stagger: 0.06, ease: "power1.out" })
            .to(lines, { opacity: 0, duration: 0.2, stagger: 0.02, ease: "power1.in" }, "+=1.8");
          return () => tl.kill();
        });
      }
    }, codeContainerRef);
    
    return () => ctx.revert();
  }, [currentCode]);

  const handleCopy = async () => { 
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-8 border-b border-foreground/12 px-8 py-6">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-accent-2xs px-8 py-4 transition-colors duration-(--duration-fast) ease-(--ease-expo-out) ${tab === activeTab ? "bg-foreground/10 text-foreground" : "text-foreground-muted hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy to clipboard"
          className={`text-accent-2xs flex items-center gap-4 px-8 py-4 transition-opacity duration-(--duration-quick) ease-(--ease-expo-out) ${copied ? "bg-brand text-[#141314]" : "bg-foreground text-background hover:opacity-90"}`}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          <span>
            {copied ? t("landing.howItWorks.scenes.copiedLabel") : t("landing.howItWorks.scenes.copyLabel")}
          </span>
        </button>
      </div>
      <div ref={codeContainerRef} className="flex-1 overflow-hidden px-12 py-10 font-mono text-[10px] leading-[15px]">
        {currentCode.split("\n").map((line, index) => (
          <div key={index} data-code-line="" className="whitespace-pre">
            {line === "" ? " " : highlightSyntax(line).map((token, tIndex) => (
              <span key={tIndex} className={token.c}>
                {token.t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewVisual({ item }) { 
  const containerRef = useRef(null); 
  const [isVisible, setIsVisible] = useState(false); 

  useEffect(() => {
    const container = containerRef.current; 
    if (!container || isVisible) return;
    
    const observer = new IntersectionObserver(([entry]) => { 
      if (entry?.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px 0px" });
    
    observer.observe(container);
    return () => observer.disconnect();
  }, [isVisible]);

  const hasVideo = !!item?.preview_video_url; 
  const posterImg = item?.preview_image_url; 

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-8 border-b border-foreground/12 px-10 py-8">
        <span className="flex gap-4" aria-hidden="true">
          <span className="size-6 rounded-full bg-foreground/20" />
          <span className="size-6 rounded-full bg-foreground/20" />
          <span className="size-6 rounded-full bg-foreground/20" />
        </span>
        <span className="text-accent-2xs ml-2 flex-1 truncate border border-foreground/12 bg-surface px-8 py-2 lowercase tracking-wider text-foreground-muted">
          yoursite.com
        </span>
      </div>
      <div ref={containerRef} className="relative flex-1 overflow-hidden bg-background">
        {hasVideo && isVisible ? (
          <video
            src={item.preview_video_url}
            poster={posterImg}
            autoPlay={true}
            muted={true}
            loop={true}
            playsInline={true}
            preload="none"
            className="block object-cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : posterImg ? (
          <img
            src={posterImg}
            alt=""
            loading="lazy"
            className="block object-cover"
            style={{ width: "100%", height: "100%" }}
          />
        ) : null}
      </div>
    </div>
  );
}

const FALLBACK_TOTAL_COUNT = SiteConfig?.animationStats?.totalCount ?? 50; 
const LAYOUT_DESKTOP = { cardW: 320, cardH: 180, gap: 48, offsetX: 184 }; 
const LAYOUT_MOBILE = { cardW: 200, cardH: 112, gap: 24, offsetX: 112 }; 

function TwoWaysSection({ images = [], animations = [], cursorRef = null }) { 
  const animationCount = animations.length || FALLBACK_TOTAL_COUNT; 
  const isDesktop = useBreakpoint("lg"); 
  
  const shuffledImages = useMemo(() => { 
    if (images.length === 0) return [];
    let result = [...images]; 
    for (let i = result.length - 1; i > 0; i--) {
      let randIndex = (9301 * i + 49297) % (i + 1); 
      [result[i], result[randIndex]] = [result[randIndex], result[i]];
    }
    return result;
  }, [images]);

  return (
    <section data-theme="light" className="two-ways relative bg-background py-96 text-foreground lg:py-128">
      <div className="v2-container">
        <header className="mb-64 max-w-[60ch] lg:mb-96">
          <RevealHeadline as="h2" className="max-w-[18ch]" trigger="scroll">
            {t("landing.twoWays.headline")}
          </RevealHeadline>
          <AnimatedText
            tag="p"
            className="text-body-lg mt-24 max-w-[52ch] text-foreground-muted"
            {...TWO_WAYS_ANIM_PROPS}
          >
            {t("landing.twoWays.body")}
          </AnimatedText>
        </header>
        <div className="grid grid-cols-12 gap-24 lg:gap-32">
          <article className="col-span-12 flex flex-col overflow-hidden bg-surface text-foreground lg:col-span-7">
            <div className="relative h-[280px] w-full overflow-hidden bg-surface lg:h-[480px]">
              {shuffledImages.length > 0 ? (
                <ImageLayout images={shuffledImages} cursorRef={cursorRef} layout={isDesktop ? LAYOUT_DESKTOP : LAYOUT_MOBILE} />
              ) : (
                <div className="absolute inset-0 bg-background-muted" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-20 p-24 lg:p-32">
              <div className="flex flex-wrap items-baseline justify-between gap-16">
                <h3 className="text-h4 m-0">{t("landing.twoWays.libraryTitle")}</h3>
                <span className="text-mono-sm text-foreground-muted">
                  {t("landing.twoWays.libraryMeta", { count: animationCount })}
                </span>
              </div>
              <p className="text-body m-0 max-w-[52ch] text-foreground-muted">
                {t("landing.twoWays.libraryBody")}
              </p>
              <div className="mt-auto inline-flex pt-12">
                <AnimatedButton href="/animations" theme="light" size="sm">
                  {t("landing.twoWays.libraryCta")}
                </AnimatedButton>
              </div>
            </div>
          </article>
          <article className="col-span-12 flex flex-col overflow-hidden bg-surface text-foreground lg:col-span-5">
            <div className="relative h-[280px] w-full overflow-hidden lg:h-[480px]">
              <ShowreelVideo className="h-full w-full" label="The Menu Kit showreel" />
            </div>
            <div className="flex flex-1 flex-col gap-20 p-24 lg:p-32">
              <div className="flex flex-wrap items-baseline justify-between gap-16">
                <h3 className="text-h4 m-0">{t("landing.twoWays.kitTitle")}</h3>
                <span className="text-mono-sm text-foreground-muted">
                  {t("landing.twoWays.kitMeta")}
                </span>
              </div>
              <p className="text-body m-0 max-w-[52ch] text-foreground-muted">
                {t("landing.twoWays.kitBody")}
              </p>
              <div className="mt-auto inline-flex pt-12">
                <AnimatedButton href="/kits/menu" theme="brand" size="sm">
                  {t("landing.twoWays.kitCta")}
                </AnimatedButton>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function CircularSlider({ 
  className = "", 
  images = [], 
  type = "snap", 
  autoplay = 0, 
  duration = 1, 
  ease = "elastic.out(1, 0.8)", 
  showControls = true 
}) {
  const wrapRef = useRef(null); 
  const containerRef = useRef(null); 
  const sliderItemsWrapRef = useRef(null); 
  const svgRef = useRef(null); 
  const pathRef = useRef(null); 
  const itemsRefs = useRef([]); 
  const prevAnimatedButtonRef = useRef(null); 
  const nextAnimatedButtonRef = useRef(null); 
  const stateRef = useRef({ 
    isDragging: false,
    arrowAnimating: false,
    autoplayTimer: null,
    autoplayTween: null,
    draggableInstance: null,
    resizeTimeout: null,
    circlePath: null,
    targetRotation: 0
  });

  useGSAP(() => {
    const container = containerRef.current; 
    const sliderWrap = sliderItemsWrapRef.current; 
    const svgEl = svgRef.current; 
    const pathEl = pathRef.current; 
    const itemEls = itemsRefs.current.filter(Boolean); 
    
    if (!container || !sliderWrap || !svgEl || !pathEl || !itemEls.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    const count = itemEls.length; 
    const angleStep = 360 / count; 
    const isSnap = type === "snap"; 
    const state = stateRef.current; 
    
    state.isDragging = false;
    state.circlePath = null;
    state.targetRotation = 0;
    
    const setupSlider = (isResize = false) => { 
      let winWidth = window.innerWidth; 
      let firstItemImg = itemEls[0]?.querySelector(".circular_slider_image"); 
      let multiplier = parseFloat(getComputedStyle(container).getPropertyValue("--anm-circle-multiplier") || "") || 8;
      let circleSize = Math.max((firstItemImg ? firstItemImg.offsetWidth : 360) * multiplier, winWidth + 800); 
      
      let currentRotation = isResize && state.draggableInstance ? gsap.getProperty(sliderWrap, "rotation") : 0; 
      state.targetRotation = isResize && isSnap ? gsap.utils.snap(angleStep, currentRotation) : currentRotation;
      
      gsap.set(sliderWrap, {
        position: "absolute",
        width: circleSize,
        height: circleSize,
        left: "50%",
        top: "50%",
        xPercent: -50,
        display: "block",
        overflow: "visible",
        padding: 0,
        gap: 0,
        rotation: currentRotation,
        force3D: true
      });
      
      gsap.set(svgEl, {
        display: "block",
        position: "absolute",
        width: "100%",
        height: "100%",
        pointerEvents: "none"
      });
      
      gsap.set(itemEls, { position: "absolute", flex: "none" });
      
      if (!state.circlePath) {
        state.circlePath = MotionPathPlugin.convertToPath(pathEl, false)[0];
        state.circlePath.id = "cs-path-" + Math.random().toString(36).slice(2, 9);
        svgEl.prepend(state.circlePath);
      }
      
      gsap.set(itemEls, {
        force3D: true,
        motionPath: {
          path: state.circlePath,
          align: state.circlePath,
          alignOrigin: [0.5, 0.5],
          start: -0.25,
          end: (index) => index / count - 0.25,
          autoRotate: true
        }
      });
    };
    
    const stopAutoplay = () => { 
      if (state.autoplayTimer) {
        clearInterval(state.autoplayTimer);
        state.autoplayTimer = null;
      }
      if (state.autoplayTween) {
        state.autoplayTween.kill();
        state.autoplayTween = null;
      }
    };
    
    const animateRotation = (direction) => { 
      if (state.draggableInstance) {
        if (!state.arrowAnimating) {
          let currentRot = gsap.getProperty(sliderWrap, "rotation"); 
          state.targetRotation = isSnap ? gsap.utils.snap(angleStep, currentRot) : currentRot;
        }
        state.targetRotation += direction * angleStep;
        state.arrowAnimating = true;
        gsap.to(sliderWrap, {
          rotation: state.targetRotation,
          duration: duration,
          ease: ease,
          overwrite: "auto",
          force3D: true
        });
      }
    };
    
    const startAutoplay = () => { 
      if (autoplay <= 0 || state.isDragging) return;
      if (isSnap) {
        if (!state.autoplayTimer) {
          state.autoplayTimer = setInterval(() => {
            if (!state.isDragging) animateRotation(-1);
          }, autoplay);
        }
      } else {
        let currentRot = gsap.getProperty(sliderWrap, "rotation"); 
        state.autoplayTween = gsap.to(sliderWrap, {
          rotation: currentRot - 360,
          duration: (autoplay / 1000) * 10,
          ease: "none",
          repeat: -1
        });
      }
    };
    
    const initDraggable = () => { 
      if (state.draggableInstance) {
        state.draggableInstance.kill();
        state.draggableInstance = null;
      }
      state.draggableInstance = Draggable.create(sliderWrap, {
        type: "rotation",
        inertia: true,
        cursor: "grab",
        activeCursor: "grabbing",
        allowNativeTouchScrolling: true,
        snap: !!isSnap && ((val) => gsap.utils.snap(angleStep, val)),
        onDragStart() {
          state.isDragging = true;
          state.arrowAnimating = false;
          stopAutoplay();
        },
        onDragEnd() {
          state.isDragging = false;
          startAutoplay();
        }
      })[0];
    };
    
    setupSlider();
    initDraggable();
    startAutoplay();
    
    const handleResize = () => { 
      clearTimeout(state.resizeTimeout);
      state.resizeTimeout = setTimeout(() => {
        stopAutoplay();
        setupSlider(true);
        initDraggable();
        if (!state.isDragging) startAutoplay();
      }, 250);
    };
    
    const handleVisibilityChange = () => { 
      if (document.hidden) {
        stopAutoplay();
      } else if (!state.isDragging) {
        startAutoplay();
      }
    };
    
    const btnPrev = prevAnimatedButtonRef.current; 
    const btnNext = nextAnimatedButtonRef.current; 
    
    const handlePrevClick = () => { 
      stopAutoplay();
      animateRotation(1);
      startAutoplay();
    };
    
    const handleNextClick = () => { 
      stopAutoplay();
      animateRotation(-1);
      startAutoplay();
    };
    
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    btnPrev?.addEventListener("click", handlePrevClick);
    btnNext?.addEventListener("click", handleNextClick);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      btnPrev?.removeEventListener("click", handlePrevClick);
      btnNext?.removeEventListener("click", handleNextClick);
      clearTimeout(state.resizeTimeout);
      stopAutoplay();
      if (state.draggableInstance) {
        state.draggableInstance.kill();
        state.draggableInstance = null;
      }
      if (state.circlePath?.parentNode) {
        state.circlePath.parentNode.removeChild(state.circlePath);
      }
      state.circlePath = null;
    };
  }, { scope: wrapRef, dependencies: [type, autoplay, duration, ease, images.length], revertOnUpdate: true });

  return (
    <div ref={wrapRef} className={["circular_slider_demo_wrap", className].filter(Boolean).join(" ")}>
      <div ref={containerRef} className="circular_slider_wrap" data-anm-circular-slider={true}>
        <div ref={sliderItemsWrapRef} className="circular_slider_container" data-anm-circular-slider-container={true}>
          <svg ref={svgRef} className="circular_slider_svg" viewBox="0 0 200 200">
            <circle ref={pathRef} className="circular_slider_path" data-anm-circular-slider-path={true} cx="100" cy="100" r="100" />
          </svg>
          {images.map((imgItem, idx) => (
            <div key={idx} ref={(el) => { itemsRefs.current[idx] = el; }} className="circular_slider_item" data-anm-circular-slider-item={true}>
              <img src={imgItem.src} alt={imgItem.alt} className="circular_slider_image" />
            </div>
          ))}
        </div>
      </div>
      {showControls && (
        <div className="circular_slider_controls">
          <button ref={prevAnimatedButtonRef} className="circular_slider_arrow" data-anm-circular-slider-prev={true} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button ref={nextAnimatedButtonRef} className="circular_slider_arrow" data-anm-circular-slider-next={true} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function PresetCircularSlider({ preset }) { 
  return (
    <CircularSlider
      type="snap"
      showControls={true}
      duration={preset.duration}
      ease={preset.ease}
      images={POSTERS_FORMATTED}
      className="one-component-carousel"
    />
  );
}

function PresetControls({ preset, presetIdx, setPresetIdx }) { 
  return (
    <div className="rounded-md border border-foreground/12 bg-background/80 p-14 text-foreground backdrop-blur-sm">
      <div className="mb-10 flex items-center justify-between gap-24">
        <p className="text-accent-xs m-0 text-foreground-muted">{t("landing.oneComponent.snapFeelLabel")}</p>
        <p className="text-accent-xs m-0 text-foreground-muted">{preset.duration}s</p>
      </div>
      <div role="radiogroup" aria-label={t("landing.oneComponent.snapGroupAria")} className="flex items-center gap-4">
        {ONE_COMP_PRESET_CONFIGS.map((config, idx) => {
          const isActive = idx === presetIdx; 
          return (
            <button
              key={config.label}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setPresetIdx(idx)}
              className={`text-accent-xs cursor-pointer rounded-sm border-0 px-12 py-8 transition-colors duration-300 ${isActive ? "bg-foreground text-background" : "bg-transparent text-foreground-muted hover:bg-foreground/10 hover:text-foreground"}`}
            >
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function generatePresetCode(tab, config) { 
  const { duration, ease } = config; 
  if (tab === "HTML") {
    return `<div data-anm-circular-slider
     data-anm-circular-slider-type="snap"
     data-anm-duration="${duration}"
     data-anm-ease="${ease}">
  <img class="circular_slider_image" src="card-1.jpg" alt="" />
  <!-- ...more cards... -->
</div>`;
  }
  if (tab === "React") {
    return `<CircularSlider
  type="snap"
  duration={${duration}}
  ease="${ease}"
  showControls
  images={cards}
/>`;
  }
  return `<CircularSlider
  type="snap"
  :duration="${duration}"
  ease="${ease}"
  show-controls
  :images="cards"
/>`;
}

function CodeTabs({ tab, setTab, preset }) { 
  return (
    <div className="w-full rounded-md border border-foreground/12 bg-background/80 p-14 text-left backdrop-blur-sm lg:w-[300px]">
      <div className="mb-10 flex items-center gap-8 border-b border-foreground/10 pb-8">
        <div role="tablist" aria-label={t("landing.oneComponent.codeTablistAria")} className="flex items-center gap-8">
          {ONE_COMP_TABS.map((tabName) => {
            const isSelected = tabName === tab; 
            return (
              <button
                key={tabName}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setTab(tabName)}
                className={`text-accent-xs cursor-pointer rounded-sm border-0 bg-transparent px-4 py-2 transition-colors duration-300 ${isSelected ? "text-foreground" : "text-foreground-muted hover:text-foreground"}`}
              >
                {tabName}
              </button>
            );
          })}
        </div>
      </div>
      <pre className="one-component-code m-0 overflow-hidden whitespace-pre p-0 normal-case tracking-normal text-foreground">
        <code>{generatePresetCode(tab, preset)}</code>
      </pre>
    </div>
  );
}

function OneComponentSection() { 
  const [codeTab, setCodeTab] = useState("HTML"); 
  const [presetIdx, setPresetIdx] = useState(1); 
  const currentPreset = ONE_COMP_PRESET_CONFIGS[presetIdx]; 
  const isDesktop = useBreakpoint("lg"); 

  return (
    <section data-theme="dark" className="one-component relative bg-background py-96 text-foreground lg:py-128">
      <div className="v2-container">
        {isDesktop ? (
          <div className="hidden grid-cols-12 items-center gap-0 lg:grid">
            <div className="col-span-5 col-start-1 flex flex-col gap-32">
              <header className="max-w-[44ch]">
                <RevealHeadline as="h2" trigger="scroll">
                  {t("landing.oneComponent.headline")}
                </RevealHeadline>
                <AnimatedText
                  tag="p"
                  className="text-body-lg mt-24 max-w-[44ch] text-foreground-muted"
                  type="lines"
                  mask="lines"
                  duration={0.6}
                  stagger={0.03}
                  ease="power2.out"
                  animationProps={{ yPercent: 100 }}
                  triggerMode="scroll"
                >
                  {t("landing.oneComponent.body", { count: SiteConfig.animationStats.displayCount })}
                </AnimatedText>
              </header>
              <div className="flex flex-wrap items-center gap-16">
                <AnimatedButton href="/animations" theme="brand" size="sm">
                  {t("landing.oneComponent.cta")}
                </AnimatedButton>
              </div>
            </div>
            <div className="col-span-6 col-start-7">
              <div className="relative">
                <div className="one-component-exhibit relative h-[64svh] min-h-[540px] w-full overflow-hidden bg-surface">
                  <div className="one-component-glow pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
                  <span className="text-mono-sm absolute left-24 top-20 z-[3] text-foreground-muted" aria-hidden="true">
                    {t("landing.oneComponent.exhibitLabel")}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PresetCircularSlider preset={currentPreset} />
                  </div>
                </div>
                <div className="absolute -bottom-32 left-24 z-[5]">
                  <PresetControls preset={currentPreset} presetIdx={presetIdx} setPresetIdx={setPresetIdx} />
                </div>
                <div className="absolute -top-48 right-32 z-[5]">
                  <CodeTabs tab={codeTab} setTab={setCodeTab} preset={currentPreset} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-32 lg:hidden">
            <header className="max-w-[44ch]">
              <RevealHeadline as="h2" trigger="scroll">
                {t("landing.oneComponent.headline")}
              </RevealHeadline>
              <AnimatedText
                tag="p"
                className="text-body-lg mt-24 max-w-[44ch] text-foreground-muted"
                type="lines"
                mask="lines"
                duration={0.6}
                stagger={0.03}
                ease="power2.out"
                animationProps={{ yPercent: 100 }}
                triggerMode="scroll"
              >
                {t("landing.oneComponent.body", { count: SiteConfig.animationStats.displayCount })}
              </AnimatedText>
            </header>
            <div className="flex flex-col gap-16">
              <div className="relative h-[64svh] min-h-[540px] overflow-hidden bg-surface">
                <div className="one-component-glow pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PresetCircularSlider preset={currentPreset} />
                </div>
              </div>
              <PresetControls preset={currentPreset} presetIdx={presetIdx} setPresetIdx={setPresetIdx} />
              <CodeTabs tab={codeTab} setTab={setCodeTab} preset={currentPreset} />
            </div>
            <div className="flex flex-wrap items-center gap-16">
              <AnimatedButton href="/animations" theme="brand" size="sm">
                {t("landing.oneComponent.cta")}
              </AnimatedButton>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const PRICING_PLANS = SiteConfig.stripe.landingPlans; 

function PricingSection({ shippedRecently = 0 }) { 
  const [cycle, setCycle] = useState("quarterly"); 
  const router = useTransitionRouter(); 
  
  const handleCheckout = (planId) => { 
    router.push(`/checkout?plan=${planId}&cycle=${cycle}`);
  };

  return (
    <section data-theme="light" className="pricing relative bg-background text-foreground">
      <div className="v2-container py-96 lg:py-128">
        <div className="grid grid-cols-12 gap-x-24 gap-y-32">
          <div className="col-span-12 flex flex-col items-center gap-32 text-center lg:col-span-8 lg:col-start-3">
            <RevealHeadline as="h2" trigger="scroll">
              {t("landing.pricingSection.headline")}
            </RevealHeadline>
            <AnimatedText
              tag="p"
              className="text-body max-w-[58ch] text-foreground-muted"
              type="lines"
              mask="lines"
              duration={0.6}
              stagger={0.03}
              ease="power2.out"
              animationProps={{ yPercent: 100 }}
              triggerMode="scroll"
            >
              {t("landing.pricingSection.subhead")}
            </AnimatedText>
            <PricingCycleToggle cycle={cycle} onChange={setCycle} />
          </div>
          <div className="col-span-12 grid grid-cols-1 gap-x-24 gap-y-24 lg:col-span-10 lg:col-start-2 lg:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.key}
                plan={plan}
                cycle={cycle}
                onCheckout={handleCheckout}
                shippedRecently={shippedRecently}
              />
            ))}
            <KitSpotlight className="lg:col-span-3" />
          </div>
          <div className="col-span-12 mt-16 flex justify-center">
            <AnimatedButton href="/pricing" theme="brand" size="sm">
              {t("landing.pricingSection.bottomCta")}
            </AnimatedButton>
          </div>
        </div>
      </div>
    </section>
  );
}

const CustomCursor = forwardRef(function ( 
  { className = "", children, speed = 0.7, ease = "expo.out", size = 48, maxRotation = 35, rotationDecay = 0.92, velocityMultiplier = 0.5, hideNativeCursor = false },
  ref 
) {
  const wrapRef = useRef(null); 
  const cursorRef = useRef(null); 
  const textRef = useRef(null); 
  
  const mousePos = useRef({ x: 0, y: 0 }); 
  const lastMousePos = useRef({ x: 0, y: 0 }); 
  const delta = useRef({ x: 0, y: 0 }); 
  
  const currentRotation = useRef(0); 
  const targetRotation = useRef(0); 
  const rafId = useRef(null); 
  const lastTime = useRef(0); 
  
  const isVisible = useRef(false); 
  const isAnimatedTextMode = useRef(false); 
  const resizeTimeout = useRef(null); 
  
  const [isTouch, setIsTouch] = useState(true); 
  const [mounted, setMounted] = useState(false); 

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0 || window.matchMedia("(hover: none)").matches);
    setMounted(true);
  }, []);

  const { contextSafe } = useGSAP({ scope: wrapRef }); 

  const updatePosition = useCallback((xPos, yPos, immediate = false) => { 
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        x: xPos,
        y: yPos,
        force3D: true,
        overwrite: true,
        ease: ease,
        duration: immediate ? 0 : speed
      });
    }
  }, [ease, speed]);

  const showCursor = useCallback(() => { 
    if (!isVisible.current && cursorRef.current) {
      isVisible.current = true;
      cursorRef.current.classList.add("is-visible");
    }
  }, []);

  const hideCursor = useCallback(() => { 
    if (isVisible.current && cursorRef.current) {
      isVisible.current = false;
      cursorRef.current.classList.remove("is-visible");
    }
  }, []);

  const setLabel = contextSafe((text, bgColor, color) => { 
    if (textRef.current && cursorRef.current) {
      gsap.killTweensOf(textRef.current);
      textRef.current.innerHTML = text;
      cursorRef.current.classList.add("is-text");
      isAnimatedTextMode.current = true;
      showCursor();
      textRef.current.style.backgroundColor = bgColor || "";
      textRef.current.style.color = color || "";
      gsap.fromTo(textRef.current, { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(1.7)", force3D: true });
    }
  });

  const clearLabel = contextSafe(() => { 
    if (textRef.current && cursorRef.current) {
      gsap.killTweensOf(textRef.current);
      cursorRef.current.classList.remove("is-text");
      isAnimatedTextMode.current = false;
      hideCursor();
      gsap.to(textRef.current, {
        scale: 0,
        rotation: 0,
        duration: 0.25,
        ease: "power2.inOut",
        force3D: true,
        onComplete: () => {
          if (!isAnimatedTextMode.current && textRef.current) {
            textRef.current.innerHTML = "";
            textRef.current.style.backgroundColor = "";
            textRef.current.style.color = "";
          }
        }
      });
    }
  });

  useImperativeHandle(ref, () => ({
    setLabel: (text, bgColor, color) => setLabel(text, bgColor, color),
    clearLabel: () => clearLabel()
  }), [setLabel, clearLabel]);

  useGSAP(() => {
    if (isTouch || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !cursorRef.current || !textRef.current || !wrapRef.current) return;
    
    document.documentElement.style.setProperty("--anm-cursor-size", `${size}px`);
    gsap.set(textRef.current, { x: 0, y: 0, xPercent: -50, yPercent: -50, scale: 0, rotation: 0, force3D: true });
    updatePosition(-window.innerWidth, -window.innerHeight, true);
    
    const interactables = wrapRef.current.querySelectorAll("[data-anm-cursor-text]"); 
    const listeners = []; 
    
    interactables.forEach((el) => {
      const text = el.dataset.anmCursorText; 
      if (!text) return;
      
      const onEnter = () => { setLabel(text, el.dataset.anmCursorBg || null, el.dataset.anmCursorColor || null); }; 
      const onLeave = () => { clearLabel(); }; 
      
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      listeners.push({ element: el, handleEnter: onEnter, handleLeave: onLeave });
    });
    
    let currentTheme = null; 
    const onMouseMove = (event) => { 
      mousePos.current.x = event.clientX;
      mousePos.current.y = event.clientY;
      updatePosition(mousePos.current.x, mousePos.current.y);
      detectTheme(event.target);
    };
    
    const detectTheme = (targetNode) => { 
      if (!cursorRef.current) return;
      const themeContainer = targetNode?.closest?.("[data-theme]"); 
      const nextTheme = (themeContainer?.dataset?.theme || "light") === "dark" ? "light" : "dark"; 
      if (nextTheme !== currentTheme) {
        currentTheme = nextTheme;
        cursorRef.current.setAttribute("data-cursor-theme", nextTheme);
      }
    };
    
    document.addEventListener("mousemove", onMouseMove);
    
    const renderLoop = (time) => { 
      if (!lastTime.current) lastTime.current = time;
      const dt = time - lastTime.current; 
      lastTime.current = time;
      
      const dx = mousePos.current.x - lastMousePos.current.x; 
      if (dt > 0) {
        delta.current.x = 0.7 * delta.current.x + 0.3 * dx;
      }
      lastMousePos.current.x = mousePos.current.x;
      lastMousePos.current.y = mousePos.current.y;
      
      targetRotation.current = Math.max(-maxRotation, Math.min(maxRotation, delta.current.x * velocityMultiplier));
      
      if (isAnimatedTextMode.current) {
        currentRotation.current += (targetRotation.current - currentRotation.current) * 0.2;
      } else {
        currentRotation.current *= rotationDecay;
      }
      
      if (textRef.current) {
        gsap.set(textRef.current, { rotation: currentRotation.current, xPercent: -50, yPercent: -50, force3D: true });
      }
      
      rafId.current = requestAnimationFrame(renderLoop);
    };
    
    rafId.current = requestAnimationFrame(renderLoop);
    
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      clearTimeout(resizeTimeout.current);
      document.removeEventListener("mousemove", onMouseMove);
      listeners.forEach(({ element, handleEnter, handleLeave }) => {
        element.removeEventListener("mouseenter", handleEnter);
        element.removeEventListener("mouseleave", handleLeave);
      });
      if (cursorRef.current) gsap.killTweensOf(cursorRef.current);
      if (textRef.current) gsap.killTweensOf(textRef.current);
    };
  }, { scope: wrapRef, dependencies: [isTouch, speed, ease, size, maxRotation, rotationDecay, velocityMultiplier] });

  const renderPortal = mounted && !isTouch && createPortal( 
    <div ref={cursorRef} className="anm-cursor">
      <div ref={textRef} className="anm-cursor-text" />
    </div>,
    document.body
  );

  return (
    <Fragment>
      <div
        ref={wrapRef}
        className={`custom_cursor_wrap ${className}`.trim()}
        data-anm-custom-cursor={true}
        style={hideNativeCursor ? { cursor: "none" } : undefined}
      >
        {children}
      </div>
      {renderPortal}
    </Fragment>
  );
});





export default function LandingClient({ animations = [], shippedRecently = 0 }) { 
  const imagesWithPreviews = useMemo(() => animations.filter((anim) => anim.preview_image_url), [animations]); 
  const previewImageUrls = useMemo(() => imagesWithPreviews.map((anim) => anim.preview_image_url), [imagesWithPreviews]); 
  
  const initialAnimations = useMemo(() => { 
    const animMap = new Map(imagesWithPreviews.map((anim) => [anim.slug, anim])); 
    const fallbackMatched = FALLBACK_ANIMATIONS.map((slug) => animMap.get(slug)).filter(Boolean); 
    const addedSlugs = new Set(fallbackMatched.map((anim) => anim.slug)); 
    
    for (let anim of imagesWithPreviews) {
      if (fallbackMatched.length >= 9) break;
      if (!addedSlugs.has(anim.slug)) {
        fallbackMatched.push(anim);
      }
    }
    return fallbackMatched.slice(0, 9);
  }, [imagesWithPreviews]);

  useEffect(() => {
    if (previewImageUrls.length === 0) return;
    
    const preloaderId = typeof requestIdleCallback === "function" 
      ? requestIdleCallback(() => preloadSharedImages(previewImageUrls, { maxWidth: 384 }), { timeout: 2000 })
      : setTimeout(() => preloadSharedImages(previewImageUrls, { maxWidth: 384 }), 1000);
      
    return () => {
      if (typeof cancelIdleCallback === "function") {
        try {
          cancelIdleCallback(preloaderId);
        } catch (err) {
          clearTimeout(preloaderId);
        }
      } else {
        clearTimeout(preloaderId);
      }
    };
  }, [previewImageUrls]);

  const cursorNodeRef = useRef(null); 
  const { addReadyGate } = useAnimation(); 

  useEffect(() => {
    perfLog("LandingClient mounted; holding cover on landing-fonts gate");
    const releaseGate = addReadyGate("landing-fonts"); 
    return document.fonts?.ready.then(() => {
      perfLog("fonts ready -> releasing landing-fonts gate");
      releaseGate();
    }), () => releaseGate();
  }, [addReadyGate]);

  return (
    <CustomCursor ref={cursorNodeRef}>
      <div className="landing">
        <HeroSection animations={initialAnimations} count={animations.length} pool={animations} />
        <ProblemSection />
        <HowItWorksSection animations={animations} />
        <OneComponentSection />
        <TwoWaysSection images={previewImageUrls} animations={animations} cursorRef={cursorNodeRef} />
        <JustShipped items={animations} count={animations.length} />
        <TestimonialsSection
        images={previewImageUrls} 
        />
        <StarterPackSection theme="dark" />
        <PricingSection shippedRecently={shippedRecently} />
        <ValueMath cta={{ label: t("common.valueMath.ctaLanding"), href: "/pricing" }} />
        <Footer />
        <EndCTA images={previewImageUrls} bleed={true} />
      </div>
    </CustomCursor>
  );
}
