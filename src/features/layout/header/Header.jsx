import { Fragment, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import Link from 'next/link';
import { cn } from '@lib/vendor';
import { t } from '@features/helpers/translate'; 
import { isRouteActive } from '@config/isRouteActive'; 
import { bunnyImageUrl } from '@config/bunnyImageUrl'; 
import { useCategories } from '@lib/providers/CategoryProvider'; 
import { useAuthSession } from '@hooks/useAuthSession.js';
import { useHeaderState } from '@hooks/useHeaderState';
import { DesktopNavItem } from '@features/layout/header/DesktopNavItem';
import { MobileNavItem } from '@features/layout/header/MobileNavItem';
import { HeaderMarquee } from '@features/layout/header/HeaderMarquee';
import { NAV_ITEMS } from '@config/headerNavConfig';
import Logo from '@components/ui/Logo'; 
import NavLink from '@components/NavLink'; 
import AnimatedButton from '@animations/components/AnimatedButton'; 

export default function Header({ latestAnimation }) {
  const pathname = usePathname();
  const { hasAccess, isAuthenticated, loading: isAuthLoading } = useAuthSession();
  
  const headerRef = useRef(null);
  const headerBarRef = useRef(null);
  const headerInnerRef = useRef(null);
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownInnerRef = useRef(null);
  const scrimRef = useRef(null);
  
  const navItemRefs = useRef({});
  const dropdownGroupRefs = useRef({});
  const enterTimeoutRef = useRef(null);
  const leaveTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(0);

  const [activeMegaKey, setActiveMegaKey] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileMegaKey, setActiveMobileMegaKey] = useState(null);
  const [isDropdownAnimating, setIsDropdownAnimating] = useState(false);
  const [marqueeShiftY, setMarqueeShiftY] = useState(0);

  const { headerTheme, scrollState } = useHeaderState(headerBarRef);
  
  const headerPadState = isDropdownAnimating || isMobileMenuOpen 
    ? "open" 
    : scrollState === "scrolled" ? "scrolled" : "top";
    
  const isSurfaceBackground = scrollState === "scrolled" || isMobileMenuOpen || isDropdownAnimating;

  const categories = useCategories();
  
  const navigationItems = useMemo(() => {
    const categoryLinks = categories.map(cat => ({
      label: cat.name,
      href: `/animations?category=${cat.slug}`
    }));
    
    return NAV_ITEMS.map(item => {
      if (item.mega?.columns) {
        return {
          ...item,
          mega: {
            ...item.mega,
            columns: item.mega.columns.map(col => {
              const updatedCol = col.dynamic === "categories" 
                ? { ...col, links: categoryLinks } 
                : col;
              return isAuthenticated ? updatedCol : {
                ...updatedCol,
                links: updatedCol.links.filter(link => link.href !== "/animations/saved")
              };
            })
          }
        };
      }
      return item;
    });
  }, [categories, isAuthenticated]);

  const megaMenuConfigs = useMemo(() => navigationItems.filter(item => item.mega), [navigationItems]);

  const updateIndicator = useCallback((key, { instant = false } = {}) => {
    const itemEl = navItemRefs.current[key];
    const indicatorEl = indicatorRef.current;
    
    if (itemEl && indicatorEl) {
      if (instant) {
        gsap.set(indicatorEl, {
          x: itemEl.offsetLeft,
          scaleX: itemEl.offsetWidth,
          autoAlpha: 0
        });
        gsap.to(indicatorEl, {
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out"
        });
        return;
      }
      gsap.to(indicatorEl, {
        x: itemEl.offsetLeft,
        scaleX: itemEl.offsetWidth,
        autoAlpha: 1,
        duration: 0.4,
        ease: "expo.out"
      });
    }
  }, []);

  const prevActiveMegaKeyRef = useRef(null);

  useEffect(() => {
    const prevKey = prevActiveMegaKeyRef.current;
    if (prevKey === activeMegaKey) return;
    
    prevActiveMegaKeyRef.current = activeMegaKey;
    
    const dropdownInnerEl = dropdownInnerRef.current;
    const dropdownEl = dropdownRef.current;
    const scrimEl = scrimRef.current;
    
    if (!dropdownInnerEl || !dropdownEl) return;
    
    const itemsToKill = [];
    megaMenuConfigs.forEach(config => {
      const groupEl = dropdownGroupRefs.current[config.key];
      if (groupEl) {
        gsap.killTweensOf(groupEl);
        itemsToKill.push(...groupEl.querySelectorAll("[data-mm-reveal]"));
      }
    });
    
    gsap.killTweensOf([dropdownInnerEl, scrimEl, indicatorRef.current, ...itemsToKill]);
    
    if (activeMegaKey === null) {
      let isComplete = false;
      gsap.to(dropdownInnerEl, {
        height: 0,
        duration: 0.3,
        ease: "power3.out",
        onUpdate: function() {
          if (!isComplete && this.ratio >= 0.9) {
            isComplete = true;
            setIsDropdownAnimating(false);
          }
        },
        onComplete: () => {
          gsap.set(dropdownEl, {
            visibility: "hidden",
            pointerEvents: "none"
          });
          megaMenuConfigs.forEach(config => {
            const groupEl = dropdownGroupRefs.current[config.key];
            if (groupEl) {
              gsap.set(groupEl, {
                visibility: "hidden",
                opacity: 0,
                pointerEvents: "none"
              });
            }
          });
          if (!isComplete) setIsDropdownAnimating(false);
        }
      });
      
      gsap.to(scrimEl, {
        autoAlpha: 0,
        duration: 0.3,
        ease: "power3.out"
      });
      
      gsap.to(indicatorRef.current, {
        autoAlpha: 0,
        duration: 0.2
      });
      return;
    }
    
    const activeGroupEl = dropdownGroupRefs.current[activeMegaKey];
    if (!activeGroupEl) return;
    
    const isOpeningFromClosed = prevKey === null;
    setIsDropdownAnimating(true);
    
    megaMenuConfigs.forEach(config => {
      const groupEl = dropdownGroupRefs.current[config.key];
      if (!groupEl) return;
      const isActive = config.key === activeMegaKey;
      gsap.set(groupEl, {
        visibility: isActive ? "visible" : "hidden",
        opacity: isActive ? 1 : 0,
        pointerEvents: isActive ? "auto" : "none"
      });
    });
    
    gsap.set(dropdownEl, {
      visibility: "visible",
      pointerEvents: "auto"
    });
    
    gsap.to(dropdownInnerEl, {
      height: activeGroupEl.offsetHeight,
      duration: isOpeningFromClosed ? 0.5 : 0.4,
      ease: isOpeningFromClosed ? "expo.out" : "expo.inOut"
    });
    
    gsap.to(scrimEl, {
      autoAlpha: 1,
      duration: 0.3,
      ease: "power2.out"
    });
    
    if (isOpeningFromClosed) {
      gsap.set(indicatorRef.current, { autoAlpha: 0 });
      setTimeout(() => {
        if (prevActiveMegaKeyRef.current === activeMegaKey) {
          updateIndicator(activeMegaKey, { instant: true });
        }
      }, 320);
    } else {
      updateIndicator(activeMegaKey);
    }
    
    const revealEls = activeGroupEl.querySelectorAll("[data-mm-reveal]");
    if (isOpeningFromClosed) {
      gsap.fromTo(revealEls, {
        y: 24,
        autoAlpha: 0
      }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        ease: "expo.out",
        stagger: 0.05
      });
    } else {
      const direction = megaMenuConfigs.findIndex(e => e.key === activeMegaKey) >= megaMenuConfigs.findIndex(e => e.key === prevKey) ? 1 : -1;
      gsap.fromTo(revealEls, {
        x: 48 * direction,
        autoAlpha: 0
      }, {
        x: 0,
        autoAlpha: 1,
        duration: 0.45,
        ease: "expo.out",
        stagger: 0.04
      });
    }
  }, [activeMegaKey, megaMenuConfigs, updateIndicator]);

  useEffect(() => {
    if (!activeMegaKey) {
      setMarqueeShiftY(0);
      return;
    }
    const reqFrame = requestAnimationFrame(() => {
      const activeGroupEl = dropdownGroupRefs.current[activeMegaKey];
      setMarqueeShiftY(activeGroupEl ? activeGroupEl.offsetHeight : 0);
    });
    return () => cancelAnimationFrame(reqFrame);
  }, [activeMegaKey]);

  const clearHoverTimeouts = () => {
    clearTimeout(enterTimeoutRef.current);
    clearTimeout(leaveTimeoutRef.current);
  };

  const handleMouseLeaveNav = () => {
    clearHoverTimeouts();
    leaveTimeoutRef.current = setTimeout(() => setActiveMegaKey(null), 200);
  };

  const handleMouseEnterNavItem = (item) => {
    clearHoverTimeouts();
    if (item.mega) {
      if (activeMegaKey) {
        setActiveMegaKey(item.key);
      } else {
        enterTimeoutRef.current = setTimeout(() => setActiveMegaKey(item.key), 150);
      }
    } else if (activeMegaKey) {
      handleMouseLeaveNav();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveMegaKey(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setActiveMegaKey(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const headerEl = headerRef.current;
      if (!headerEl) return;
      const scrollY = window.scrollY;
      
      if (activeMegaKey) setActiveMegaKey(null);
      
      let isHidden = false;
      if (!isMobileMenuOpen && scrollY > 120) {
        isHidden = scrollY > lastScrollYRef.current;
        headerEl.classList.toggle("is-hidden", isHidden);
      } else {
        headerEl.classList.remove("is-hidden");
      }
      document.documentElement.classList.toggle("v2-header-hidden", isHidden);
      lastScrollYRef.current = scrollY;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeMegaKey, isMobileMenuOpen]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove("v2-header-hidden");
    };
  }, []);

  useEffect(() => {
    return () => clearHoverTimeouts();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("v2-scroll-locked", isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  return (
    <Fragment>
      <header
        ref={headerRef}
        data-v2={true}
        data-theme={headerTheme}
        data-pad-state={headerPadState}
        className="v2-header fixed inset-x-0 top-0 z-[300] pt-[var(--v2-header-gap)]"
      >
        <div ref={headerBarRef} className="v2-mm-bar">
          <div
            ref={headerInnerRef}
            className={cn(
              "v2-bar-padx v2-container flex h-full items-center justify-between transition-colors duration-300 ease-power3-out lg:grid lg:grid-cols-12 lg:gap-16",
              isSurfaceBackground ? "bg-surface" : "bg-transparent"
            )}
          >
            <Logo className="lg:col-span-3" />
            
            <nav
              ref={navRef}
              onMouseEnter={() => clearHoverTimeouts()}
              onMouseLeave={handleMouseLeaveNav}
              className="relative hidden h-full items-center justify-center gap-x-32 lg:col-span-4 lg:col-start-5 lg:flex"
            >
              {navigationItems.map(item => item.mega ? (
                <DesktopNavItem
                  key={item.key}
                  item={item}
                  href={item.triggerHref}
                  badge={item.badge}
                  active={activeMegaKey === item.key || (item.triggerHref && isRouteActive(pathname, item.triggerHref))}
                  expanded={activeMegaKey === item.key}
                  setRef={el => {
                    navItemRefs.current[item.key] = el;
                  }}
                  onMouseEnter={() => handleMouseEnterNavItem(item)}
                  onClick={() => {
                    clearHoverTimeouts();
                    setActiveMegaKey(null);
                  }}
                />
              ) : (
                <NavLink
                  key={item.key}
                  href={item.href}
                  inline={true}
                  active={isRouteActive(pathname, item.href)}
                  onMouseEnter={() => handleMouseEnterNavItem(item)}
                  className={cn(
                    "text-mono h-full items-center",
                    isRouteActive(pathname, item.href) ? "text-foreground" : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
              <span
                ref={indicatorRef}
                className="v2-mm-indicator"
                aria-hidden="true"
              />
            </nav>
            
            <div className="hidden items-center justify-end gap-20 lg:col-span-3 lg:col-start-10 lg:flex">
              {!isAuthLoading && (
                <Link
                  href={hasAccess ? "/animations" : "/login"}
                  className="text-mono text-foreground-muted transition-colors duration-200 hover:text-foreground"
                >
                  {hasAccess ? t("common.header.actions.account") : t("common.header.actions.login")}
                </Link>
              )}
              <AnimatedButton href="/checkout?plan=solo&cycle=quarterly" size="sm" theme="light">
                {t("common.header.actions.getAnnnimate")}
              </AnimatedButton>
            </div>
            
            <AnimatedButton
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="relative size-32 lg:hidden"
            >
              <span
                className={cn(
                  "absolute left-1/2 h-[1.5px] w-20 -translate-x-1/2 bg-foreground transition-transform duration-300",
                  isMobileMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[calc(50%-4px)]"
                )}
              />
              <span
                className={cn(
                  "absolute left-1/2 h-[1.5px] w-20 -translate-x-1/2 bg-foreground transition-transform duration-300",
                  isMobileMenuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-[calc(50%+4px)]"
                )}
              />
            </AnimatedButton
          </div>
        </div>
        
        <div
          ref={dropdownRef}
          className="v2-mm-dropdown"
          onMouseEnter={() => clearHoverTimeouts()}
          onMouseLeave={handleMouseLeaveNav}
        >
          <div ref={dropdownInnerRef} className="v2-mm-dropdown-inner">
            {megaMenuConfigs.map(config => (
              <div
                key={config.key}
                ref={el => {
                  dropdownGroupRefs.current[config.key] = el;
                }}
                className="v2-mm-group"
              >
                <div className="grid grid-cols-12 gap-16 py-32">
                  <div
                    data-mm-reveal={true}
                    className="col-span-3 col-start-1 flex flex-col gap-16"
                  >
                    <p className="text-mono-sm text-foreground-muted">
                      {config.mega.intro.eyebrow}
                    </p>
                    <p className="text-h4 text-foreground">
                      {config.mega.intro.heading}
                    </p>
                    <p className="text-body-sm text-foreground-muted">
                      {config.mega.intro.text}
                    </p>
                    <Link
                      href={config.mega.intro.cta.href}
                      onClick={() => setActiveMegaKey(null)}
                      className="text-mono-sm w-fit text-foreground underline underline-offset-4 hover:text-foreground-muted"
                    >
                      {config.mega.intro.cta.label}
                    </Link>
                  </div>
                  
                  <div className="col-span-4 col-start-5 flex gap-48">
                    {config.mega.columns.map(col => (
                      <div
                        key={col.label}
                        data-mm-reveal={true}
                        className="flex flex-1 flex-col gap-8"
                      >
                        <span className="text-mono-sm mb-4 text-foreground-muted">
                          {col.label}
                        </span>
                        {col.links.map(link => (
                          <NavLink
                            key={link.label}
                            href={link.href}
                            className="text-body-sm py-4 text-foreground-muted transition-colors duration-200 hover:text-foreground"
                          >
                            {link.label}
                            {link.badge ? (
                              <span className="text-accent-2xs ml-8 inline-block bg-brand px-6 py-2 align-middle text-black">
                                {link.badge}
                              </span>
                            ) : null}
                          </NavLink>
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  {config.mega.featured ? (
                    <div data-mm-reveal={true} className="col-span-3 col-start-10">
                      <Link
                        href={config.mega.featured.href}
                        onClick={() => setActiveMegaKey(null)}
                        className="flex flex-col gap-12"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden bg-background-muted">
                          <picture>
                            {config.mega.featured.image.avif ? (
                              <source srcSet={config.mega.featured.image.avif} type="image/avif" />
                            ) : null}
                            <img
                              src={config.mega.featured.image.jpg}
                              alt={config.mega.featured.image.alt}
                              className="block object-cover"
                              style={{ width: "100%", height: "100%" }}
                            />
                          </picture>
                        </div>
                        <div className="flex flex-col gap-4">
                          <p className="text-mono-sm text-foreground-muted">
                            {config.mega.featured.eyebrow}
                          </p>
                          <p className="text-body-sm text-foreground">
                            {config.mega.featured.title}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ) : latestAnimation ? (
                    <div data-mm-reveal={true} className="col-span-3 col-start-10">
                      <Link
                        href={`/animations/${latestAnimation.slug}`}
                        onClick={() => setActiveMegaKey(null)}
                        className="flex flex-col gap-12"
                      >
                        <div className="aspect-[16/10] w-full overflow-hidden bg-background-muted">
                          {latestAnimation.preview_video_url ? (
                            <video
                              src={latestAnimation.preview_video_url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="h-full w-full object-cover"
                            />
                          ) : latestAnimation.preview_image_url ? (
                            <img
                              src={bunnyImageUrl(latestAnimation.preview_image_url, { width: 480 })}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-4">
                          <p className="text-mono-sm text-foreground-muted">
                            {t("common.header.latestComponentLabel")}
                          </p>
                          <p className="text-body-sm text-foreground">
                            {latestAnimation.title}
                          </p>
                        </div>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <HeaderMarquee 
          scrolled={scrollState === "scrolled"} 
          shiftY={marqueeShiftY} 
        />
        
        <div
          className="v2-mm-collapse v2-container absolute inset-x-0 top-full lg:hidden"
          data-open={isMobileMenuOpen}
          inert={!isMobileMenuOpen ? "" : undefined}
        >
          <div>
            <div className="max-h-[calc(100vh-var(--v2-header-h)-var(--v2-header-gap))] overflow-y-auto border-b border-border bg-surface">
              <div className="flex flex-col px-32 py-16">
                {navigationItems.map(item => item.mega ? (
                  <MobileNavItem
                    key={item.key}
                    item={item}
                    expanded={activeMobileMegaKey === item.key}
                    onToggle={() => setActiveMobileMegaKey(prev => prev === item.key ? null : item.key)}
                  />
                ) : (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="text-mono border-b border-border-muted py-12 text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                
                <div className="flex items-center gap-20 pt-16">
                  {!isAuthLoading && (
                    <Link
                      href={hasAccess ? "/animations" : "/login"}
                      className="text-mono text-foreground-muted"
                    >
                      {hasAccess ? t("common.header.actions.account") : t("common.header.actions.login")}
                    </Link>
                  )}
                  <AnimatedButton href="/checkout?plan=solo&cycle=quarterly" size="sm" theme="light">
                    {t("common.header.actions.getAnnnimate")}
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div
        ref={scrimRef}
        className="v2-mm-scrim"
        onClick={() => setActiveMegaKey(null)}
        aria-hidden="true"
      />
    </Fragment>
  );
}
