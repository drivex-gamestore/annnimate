"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect
} from "react";

import { usePathname } from "next/navigation";


let isPerfEnabledCache = null;

function isPerfEnabled() {
  if (isPerfEnabledCache !== null) return isPerfEnabledCache;
  try {
    isPerfEnabledCache =
      new URLSearchParams(window.location.search).has("perf") ||
      window.localStorage?.getItem("anm-perf") === "1";
  } catch {
    isPerfEnabledCache = false;
  }
  
  if (isPerfEnabledCache) {
    console.log(
      "%c[perf] debug logging ON (remove ?perf=1 to silence)",
      "color:#fd551d;font-weight:bold"
    );
  }
  
  return isPerfEnabledCache;
}

const getTimestamp = () => {
  return typeof performance !== "undefined" ? performance.now() : 0;
};

export function perfLog(message, data) {
  if (!isPerfEnabled()) return;
  const seconds = (getTimestamp() / 1000).toFixed(2);
  if (data !== undefined) {
    console.log(`[perf +${seconds}s] ${message}`, data);
  } else {
    console.log(`[perf +${seconds}s] ${message}`);
  }
}

export function perfMeasure(label, fn) {
  if (!isPerfEnabled()) return fn();
  const startTime = getTimestamp();
  const result = fn();
  console.log(`[perf] ${label} took ${(getTimestamp() - startTime).toFixed(1)}ms`);
  return result;
}

const AnimationContext = createContext(null);
const defaultContextValue = {
  revealed: false,
  revealPage: () => {},
  whenRevealed: () => () => {},
  addReadyGate: () => () => {},
  onGatesClear: () => () => {},
  triggerPageEnter: () => {},
  getHasTriggered: () => false
};

export function useAnimation() {
  const context = useContext(AnimationContext);
  return context || defaultContextValue;
}


export default function AnimationProvider({ children }) {
  const pathname = usePathname();
  const currentPathRef = useRef(pathname);
  currentPathRef.current = pathname;
  
  const revealedPathRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  const whenRevealedSubscribers = useRef(new Set());
  const readyGates = useRef(new Set());
  const onGatesClearCallback = useRef(null);
  const pendingPageEnter = useRef(false);

  const revealPage = useCallback(() => {
    if (revealedPathRef.current === currentPathRef.current) {
      
      return;
    }
    
    revealedPathRef.current = currentPathRef.current;
    setIsRevealed(true);
    
    perfLog("revealPage() fired", {
      path: currentPathRef.current,
      subscribers: whenRevealedSubscribers.current.size
    });

    if (typeof document !== "undefined") {
      document.querySelectorAll("[data-page-enter-animation]").forEach((el) => {
        el.setAttribute("data-animation-started", "true");
      });
    }

    perfMeasure("reveal wave (all whenRevealed callbacks)", () => {
      Array.from(whenRevealedSubscribers.current).forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error("Error in whenRevealed callback:", error);
        }
      });
    });
  }, []);

  const whenRevealed = useCallback((callback) => {
    if (revealedPathRef.current === currentPathRef.current) {
      try {
        callback();
      } catch (error) {
        console.error("Error in whenRevealed callback:", error);
      }
      return () => {};
    }
    
    whenRevealedSubscribers.current.add(callback);
    return () => whenRevealedSubscribers.current.delete(callback);
  }, []);

  useEffect(() => {
    if (revealedPathRef.current !== pathname) {
      setIsRevealed(false);
    }
  }, [pathname]);

  const addReadyGate = useCallback((gateId) => {
    readyGates.current.add(gateId);
    let isReleased = false;
    
    return () => {
      if (!isReleased) {
        isReleased = true;
        readyGates.current.delete(gateId);
        
        if (readyGates.current.size === 0) {
          onGatesClearCallback.current?.();
          
          if (pendingPageEnter.current) {
            pendingPageEnter.current = false;
            revealPage();
          }
        }
      }
    };
  }, [revealPage]);

  const onGatesClear = useCallback((callback) => {
    onGatesClearCallback.current = callback;
    if (readyGates.current.size === 0) {
      callback();
    }
    return () => {
      if (onGatesClearCallback.current === callback) {
        onGatesClearCallback.current = null;
      }
    };
  }, []);

  const triggerPageEnter = useCallback(() => {
    if (readyGates.current.size > 0) {
      pendingPageEnter.current = true;
      return;
    }
    revealPage();
  }, [revealPage]);

  const getHasTriggered = useCallback(() => {
    return revealedPathRef.current === currentPathRef.current;
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        revealed: isRevealed,
        revealPage,
        whenRevealed,
        addReadyGate,
        onGatesClear,
        triggerPageEnter,
        getHasTriggered
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}


export function usePageEnterAnimation(callback, deps = [], label = "", enabled = true) {
  const { whenRevealed } = useAnimation();
  const callbackRef = useRef(callback);
  
  callbackRef.current = callback;
  
  useEffect(() => {
    if (enabled) {
      return whenRevealed(() => callbackRef.current());
    }
  }, [whenRevealed, enabled, ...deps]);
}