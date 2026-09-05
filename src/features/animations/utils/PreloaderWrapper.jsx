"use client";

import React, { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@lib/vendor";
import { getLayoutType } from "@/shared/getLayoutType";
import { useAnimation } from '@providers/AnimationProvider';
import BrandLogo from "@components/ui/BrandLogo";
import { perfLog } from '@shared/performance';

function Preloader({ onComplete }) {
  let rootRef = useRef(null);
  let bgRef = useRef(null);
  let logoRef = useRef(null);
  
  let { revealPage, onGatesClear } = useAnimation();
  
  let isRevealedRef = useRef(false);
  let isCompleteRef = useRef(false);
  let timelineRef = useRef(null);
  
  let logoDrawnRef = useRef(false);
  let gatesClearRef = useRef(false);
  let timeoutPassedRef = useRef(false);
  let timeoutIdRef = useRef(null);

  let startReveal = (instant) => {
    if (isRevealedRef.current) return;
    
    isRevealedRef.current = true;
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-preloader-ready", "true");
    }
    
    revealPage();
    perfLog("preloader: cover lifting -> revealPage()", { instant });

    let finish = () => {
      if (!isCompleteRef.current) {
        isCompleteRef.current = true;
        perfLog("preloader: cover removed (done)");
        if (onComplete) onComplete();
      }
    };

    let elements = [logoRef.current, bgRef.current].filter(Boolean);

    if (instant) {
      gsap.set(elements, { autoAlpha: 0 });
      finish();
      return;
    }

    let tl = gsap.timeline({ onComplete: finish });
    timelineRef.current = tl;
    tl.to(elements, { autoAlpha: 0, duration: 0.4, ease: "power2.inOut" }, 0);
  };

  let tryReveal = () => {
    if (logoDrawnRef.current && (gatesClearRef.current || timeoutPassedRef.current)) {
      startReveal(false);
    }
  };

  useEffect(() => {
    return onGatesClear(() => {
      perfLog("preloader: ready-gates clear (fonts)");
      gatesClearRef.current = true;
      tryReveal();
    });
  }, []);

  let markLogoDrawn = () => {
    if (!logoDrawnRef.current) {
      logoDrawnRef.current = true;
      perfLog("preloader: logo drawn");
      
      timeoutIdRef.current = setTimeout(() => {
        timeoutPassedRef.current = true;
        tryReveal();
      }, 400);
      
      tryReveal();
    }
  };

  useEffect(() => {
    let safetyTimeout = setTimeout(() => {
      perfLog("preloader: SAFETY timeout fired (cover held too long)");
      startReveal(true);
    }, 1200);
    
    return () => clearTimeout(safetyTimeout);
  }, []);

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  useGSAP(() => {
    let logoWrapper = logoRef.current;
    let brandPaths = Array.from(logoWrapper?.querySelectorAll('[data-pass="brand"] path') || []);
    let fgPaths = Array.from(logoWrapper?.querySelectorAll('[data-pass="fg"] path') || []);

    let preparePaths = (paths) => {
      paths.forEach(path => {
        let length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });
    };

    let matchMedia = gsap.matchMedia();

    matchMedia.add("(prefers-reduced-motion: no-preference)", () => {
      preparePaths(brandPaths);
      preparePaths(fgPaths);
      gsap.set(logoWrapper, { autoAlpha: 1 });

      let staggerConfig = { each: 0.06 };
      let totalDuration = 0.4 + 0.06 * Math.max(0, brandPaths.length - 1);
      let tl = gsap.timeline();

      tl.to(brandPaths, { strokeDashoffset: 0, duration: 0.4, ease: "expo.inOut", stagger: staggerConfig }, 0);
      tl.to(fgPaths, { strokeDashoffset: 0, duration: 0.4, ease: "expo.inOut", stagger: staggerConfig }, 0.1);
      
      tl.call(() => {
        markLogoDrawn();
      }, [], (0.1 + totalDuration) * 0.95);

      return () => tl.kill();
    });

    matchMedia.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([...brandPaths, ...fgPaths], { strokeDasharray: "none", strokeDashoffset: 0 });
      gsap.set(brandPaths, { autoAlpha: 0 });
      gsap.set(logoWrapper, { autoAlpha: 1 });

      let delayedCall = gsap.delayedCall(0.3, () => {
        markLogoDrawn();
      });

      return () => delayedCall.kill();
    });

    return () => matchMedia.revert();
  }, { scope: rootRef });

  let logoClassName = "col-start-1 row-start-1 h-auto w-[clamp(120px,26vw,168px)]";

  return (
    <div id="preloader-root" ref={rootRef} className="fixed inset-0 z-[320] overflow-hidden" style={{ pointerEvents: "none" }} aria-hidden="true">
      <div ref={bgRef} className="absolute inset-0 bg-[#141314]" />
      <div ref={logoRef} className="absolute inset-0 m-auto z-[2] grid h-max w-max place-items-center" style={{ opacity: 0 }}>
        <BrandLogo data-pass="brand" className={`${logoClassName} text-brand`} />
        <BrandLogo data-pass="fg" className={`${logoClassName} text-[#eeeeee]`} />
      </div>
    </div>
  );
}

function isExcludePath(pathname) {
  return pathname === "/learn" || pathname.startsWith("/learn/") || pathname === "/compare" || pathname.startsWith("/compare/");
}

export default function PreloaderWrapper() {
  let pathname = usePathname();
  let { revealPage } = useAnimation();
  let firstMountRef = useRef(true);
  
  let [showPreloader, setShowPreloader] = useState(() => {
    return getLayoutType(pathname) === "marketing" && !isExcludePath(pathname);
  });

  useEffect(() => {
    if (getLayoutType(pathname) !== "marketing" || isExcludePath(pathname)) {
      if (typeof document !== "undefined") {
        document.body.setAttribute("data-preloader-ready", "true");
      }
      if (firstMountRef.current) {
        firstMountRef.current = false;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => revealPage());
        });
      }
    }
  }, [pathname, revealPage]);

  if (!showPreloader) return null;

  return (
    <Preloader 
      onComplete={() => {
        setShowPreloader(false);
        if (typeof document !== "undefined") {
          document.body.setAttribute("data-preloader-ready", "true");
        }
      }} 
    />
  );
}