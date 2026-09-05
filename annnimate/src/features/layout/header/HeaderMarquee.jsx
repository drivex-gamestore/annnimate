import { Fragment, useRef, useEffect } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { MARQUEE_ITEMS } from '@config/headerNavConfig';

export function HeaderMarquee({ scrolled = false, shiftY = 0 }) {
  const containerRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl || typeof ResizeObserver === "undefined") return;
    
    const root = document.documentElement;
    const updateHeight = () => root.style.setProperty("--anm-marquee-h", `${containerEl.offsetHeight}px`);
    
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(containerEl);
    
    return () => {
      resizeObserver.disconnect();
      root.style.removeProperty("--anm-marquee-h");
    };
  }, []);

  useEffect(() => {
    const innerEl = marqueeInnerRef.current;
    if (innerEl && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      timelineRef.current = gsap.to(innerEl, {
        xPercent: -50,
        duration: 60,
        ease: "none",
        repeat: -1
      });
      
      return () => {
        timelineRef.current?.kill();
        timelineRef.current = null;
        gsap.set(innerEl, { clearProps: "transform" });
      };
    }
  }, []);

  const handleHover = (timeScale) => {
    const tl = timelineRef.current;
    if (tl) {
      gsap.to(tl, {
        timeScale: timeScale,
        duration: timeScale === 0 ? 0.6 : 0.9,
        ease: "power3.out",
        overwrite: true
      });
    }
  };

  return (
    <div
      data-visible={scrolled}
      aria-hidden={!scrolled}
      className="invisible absolute inset-x-0 top-full z-[290] hidden opacity-0 transition-[opacity,visibility] duration-(--duration-quick) ease-(--ease-power3-out) data-[visible=true]:visible data-[visible=true]:opacity-100 lg:block"
    >
      <div
        style={{ transform: `translateY(${shiftY}px)` }}
        className="transition-transform duration-(--duration-snap) ease-(--ease-expo-out)"
      >
        <div className="mx-auto w-[calc(100%-2*var(--v2-header-pad,0px))] max-w-[calc(1920px-2*var(--v2-header-pad,0px))] transition-[width,max-width] duration-(--duration-quick) ease-(--ease-power3-out)">
          <div
            ref={containerRef}
            onMouseEnter={() => handleHover(0)}
            onMouseLeave={() => handleHover(1)}
            className="overflow-hidden border-y border-foreground/10 bg-background-muted text-foreground"
          >
            <div ref={marqueeInnerRef} className="flex w-max items-center">
              {Array.from({ length: 20 }).map((_, repeatIndex) => {
                const isFirst = repeatIndex === 0;
                return (
                  <Fragment key={repeatIndex}>
                    {MARQUEE_ITEMS.map((item, itemIndex) => (
                      <Fragment key={itemIndex}>
                        <Link
                          href={item.href}
                          aria-hidden={!isFirst ? true : undefined}
                          tabIndex={isFirst ? undefined : -1}
                          className="text-mono-sm inline-flex items-center gap-10 whitespace-nowrap px-32 py-8 transition-colors duration-(--duration-quick) hover:text-brand"
                        >
                          {item.square ? (
                            <span aria-hidden="true" className="size-8 shrink-0 bg-brand" />
                          ) : null}
                          {item.label}
                        </Link>
                        <span
                          aria-hidden="true"
                          className="size-3 shrink-0 rounded-full bg-foreground/30"
                        />
                      </Fragment>
                    ))}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}