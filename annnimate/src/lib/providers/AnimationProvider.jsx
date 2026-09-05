import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { perfLog, perfMeasure } from '@shared/performance';

const noopLog = (...args) => 0;
export const AnimationContext = createContext(null);

const defaultContextValue = {
  revealed: false,
  revealPage: () => {},
  whenRevealed: () => {},
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
  const [revealed, setRevealed] = useState(false);
  
  const subscribersRef = useRef(new Set());
  const activeGatesRef = useRef(new Set());
  const onGatesClearCallbackRef = useRef(null);
  const isRevealPendingRef = useRef(false);

  const revealPage = useCallback(() => {
    if (revealedPathRef.current === currentPathRef.current) {
      noopLog("revealPage skipped - already revealed:", currentPathRef.current);
    } else {
      revealedPathRef.current = currentPathRef.current;
      setRevealed(true);
      
      noopLog(`revealPage (${currentPathRef.current}), subscribers: ${subscribersRef.current.size}`);
      perfLog("revealPage() fired", { path: currentPathRef.current, subscribers: subscribersRef.current.size });
      
      if (typeof document !== "undefined") {
        document.querySelectorAll("[data-page-enter-animation]").forEach(el => {
          el.setAttribute("data-animation-started", "true");
        });
      }
      
      perfMeasure("reveal wave (all whenRevealed callbacks)", () => {
        Array.from(subscribersRef.current).forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error("Error in whenRevealed callback:", error);
          }
        });
      });
    }
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
    
    subscribersRef.current.add(callback);
    return () => subscribersRef.current.delete(callback);
  }, []);

  useEffect(() => {
    if (revealedPathRef.current !== pathname) {
      setRevealed(false);
    }
  }, [pathname]);

  const addReadyGate = useCallback((gateName) => {
    activeGatesRef.current.add(gateName);
    noopLog(`addReadyGate: ${gateName}, open: ${[...activeGatesRef.current].join(", ")}`);
    
    let isReleased = false;
    
    return () => {
      if (!isReleased) {
        isReleased = true;
        activeGatesRef.current.delete(gateName);
        noopLog(`gate released: ${gateName}, remaining: ${[...activeGatesRef.current].join(", ") || "(none)"}`);
        
        if (activeGatesRef.current.size === 0) {
          if (onGatesClearCallbackRef.current) {
            onGatesClearCallbackRef.current();
          }
          if (isRevealPendingRef.current) {
            isRevealPendingRef.current = false;
            revealPage(); 
          }
        }
      }
    };
  }, []);

  const onGatesClear = useCallback((callback) => {
    onGatesClearCallbackRef.current = callback;
    
    if (activeGatesRef.current.size === 0) {
      callback();
    }
    
    return () => {
      if (onGatesClearCallbackRef.current === callback) {
        onGatesClearCallbackRef.current = null;
      }
    };
  }, []);

  const triggerPageEnter = useCallback(() => {
    if (activeGatesRef.current.size > 0) {
      isRevealPendingRef.current = true;
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
        revealed,
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