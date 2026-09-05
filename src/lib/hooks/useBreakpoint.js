import { useSyncExternalStore } from 'react';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
};

export function useBreakpoint(breakpoint) {
  const pixelValue = typeof breakpoint === "number" ? breakpoint : breakpoints[breakpoint];
  
  if (pixelValue == null) {
    throw new Error(`useBreakpoint: unknown breakpoint "${breakpoint}". Use one of: ${Object.keys(breakpoints).join(", ")} or a raw px number.`);
  }
  
  const query = `(min-width: ${pixelValue}px)`;
  
  return useSyncExternalStore(
    (callback) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);
      return () => mediaQueryList.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}