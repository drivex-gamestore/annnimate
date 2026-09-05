import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { THEMES } from '@features/layout/header/shared/headerNavConfig';

export function useHeaderState(headerRef) {
  const pathname = usePathname();
  const [scrollState, setScrollState] = useState("top");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerTheme, setHeaderTheme] = useState("dark");
  const isScrollLocked = useRef(false);

  const updateThemeFromScroll = useCallback((offsetY) => {
    const themeElements = document.querySelectorAll("main [data-theme]");
    if (themeElements.length === 0) return;
    
    const activeElement = Array.from(themeElements).find(el => {
      const rect = el.getBoundingClientRect();
      return rect.top <= offsetY && rect.bottom > offsetY;
    });
    
    const activeTheme = (activeElement ?? themeElements[0])?.dataset.theme;
    if (activeTheme && THEMES.includes(activeTheme)) {
      setHeaderTheme(activeTheme);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollState(window.scrollY > 50 ? "scrolled" : "top");
      if (headerRef.current) {
        updateThemeFromScroll(headerRef.current.offsetTop);
      }
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updateThemeFromScroll, headerRef]);

  useEffect(() => {
    let isUnmounted = false;
    
    const update = () => {
      if (!isUnmounted && headerRef.current) {
        setScrollState(window.scrollY > 50 ? "scrolled" : "top");
        updateThemeFromScroll(headerRef.current.offsetTop);
      }
    };
    
    const headerEl = headerRef.current?.closest(".v2-header");
    headerEl?.classList.add("no-transition");
    update();
    
    const animFrame = requestAnimationFrame(() => {
      update();
      requestAnimationFrame(() => headerEl?.classList.remove("no-transition"));
    });
    
    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    
    const timeoutId = setTimeout(() => observer.disconnect(), 800);
    
    return () => {
      isUnmounted = true;
      cancelAnimationFrame(animFrame);
      observer.disconnect();
      clearTimeout(timeoutId);
      headerEl?.classList.remove("no-transition");
    };
  }, [updateThemeFromScroll, headerRef]);

  const headerState = useMemo(() => isMenuOpen ? "menuOpen" : scrollState, [isMenuOpen, scrollState]);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, closeMenu]);

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.classList.add("v2-scroll-locked");
      window.lenis?.stop?.();
      isScrollLocked.current = true;
    } else if (isScrollLocked.current) {
      document.documentElement.classList.remove("v2-scroll-locked");
      window.lenis?.start?.();
      isScrollLocked.current = false;
    }
  }, [isMenuOpen]);

  return {
    scrollState,
    isMenuOpen,
    headerState,
    headerTheme,
    toggleMenu,
    closeMenu
  };
}
