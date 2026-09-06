import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  forwardRef
} from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { gsap } from 'gsap';


import { cn } from '@utils/cn';





export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

const BASE_TOOLTIP_CLASSES = "z-50 overflow-hidden border border-foreground/10 bg-surface px-10 py-6 text-accent-xs text-foreground";

export const TooltipContent = forwardRef(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      BASE_TOOLTIP_CLASSES,
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";

const SmartTooltipContext = createContext(null);

export function SmartTooltipGroup({
  children,
  delayDuration = 300,
  flipDuration = 0.2,
  flipEase = "power3.out",
  enterDuration = 0.25,
  enterEase = "power3.out",
  exitDuration = 0.2,
  exitEase = "power2.in",
  hideDelay = 100,
  flipThreshold = 800,
  side = "top",
  sideOffset = 8
}) {
  const [activeTooltipId, setActiveTooltipId] = useState(null);
  const [activeContent, setActiveContent] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const tooltipRef = useRef(null);
  const triggerRectsMap = useRef(new Map());
  const enterTimeoutRef = useRef(null);
  const exitTimeoutRef = useRef(null);
  const lastExitTimeRef = useRef(0);
  const isAnimatingExitRef = useRef(false);

  const calculatePosition = useCallback((triggerEl) => {
    let top, left;
    if (!triggerEl || !tooltipRef.current) return { top: 0, left: 0 };
    
    const triggerRect = triggerEl.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let computedSide = side;

    switch (side) {
      case "top":
        top = triggerRect.top - tooltipRect.height - sideOffset;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        if (top < sideOffset) {
          computedSide = "bottom";
          top = triggerRect.bottom + sideOffset;
        }
        break;
      case "bottom":
        top = triggerRect.bottom + sideOffset;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        if (top + tooltipRect.height > windowHeight - sideOffset) {
          computedSide = "top";
          top = triggerRect.top - tooltipRect.height - sideOffset;
        }
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - sideOffset;
        if (left < sideOffset) {
          computedSide = "right";
          left = triggerRect.right + sideOffset;
        }
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + sideOffset;
        if (left + tooltipRect.width > windowWidth - sideOffset) {
          computedSide = "left";
          left = triggerRect.left - tooltipRect.width - sideOffset;
        }
        break;
      default:
        top = triggerRect.top - tooltipRect.height - sideOffset;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
    }

    left = Math.max(sideOffset, Math.min(left, windowWidth - tooltipRect.width - sideOffset));
    top = Math.max(sideOffset, Math.min(top, windowHeight - tooltipRect.height - sideOffset));
    
    return { top, left, side: computedSide };
  }, [side, sideOffset]);

  const handleShow = useCallback((triggerId, content) => {
    const now = Date.now();
    const timeSinceLastExit = now - lastExitTimeRef.current;
    lastExitTimeRef.current = now;

    const triggerEl = triggerRectsMap.current.get(triggerId);
    if (triggerEl) {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }

      if (isVisible && activeTooltipId !== triggerId && timeSinceLastExit < flipThreshold && tooltipRef.current) {
        setActiveContent(content);
        setActiveTooltipId(triggerId);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!tooltipRef.current) return;
            const { top, left } = calculatePosition(triggerEl);
            gsap.to(tooltipRef.current, { x: left, y: top, duration: flipDuration, ease: flipEase });
          });
        });
      } else {
        setActiveContent(content);
        setActiveTooltipId(triggerId);
        setIsVisible(true);
        requestAnimationFrame(() => {
          if (!tooltipRef.current) return;
          const { top, left, side: computedSide } = calculatePosition(triggerEl);
          gsap.set(tooltipRef.current, { x: left, y: top });
          gsap.fromTo(
            tooltipRef.current,
            { 
              opacity: 0, 
              scale: 0.9, 
              yPercent: computedSide === "top" ? 5 : computedSide === "bottom" ? -5 : 0 
            },
            { 
              opacity: 1, 
              scale: 1, 
              yPercent: 0, 
              duration: enterDuration, 
              ease: enterEase 
            }
          );
        });
      }
    }
  }, [isVisible, activeTooltipId, flipThreshold, flipDuration, flipEase, enterDuration, enterEase, calculatePosition]);

  const handleHide = useCallback(() => {
    if (tooltipRef.current && !isAnimatingExitRef.current) {
      isAnimatingExitRef.current = true;
      gsap.to(tooltipRef.current, {
        opacity: 0,
        scale: 0.9,
        yPercent: side === "top" ? 5 : side === "bottom" ? -5 : 0,
        duration: exitDuration,
        ease: exitEase,
        onComplete: () => {
          setIsVisible(false);
          setActiveTooltipId(null);
          isAnimatingExitRef.current = false;
        }
      });
    }
  }, [side, exitDuration, exitEase]);

  const registerTrigger = useCallback((triggerId, element) => {
    if (element) {
      triggerRectsMap.current.set(triggerId, element);
    } else {
      triggerRectsMap.current.delete(triggerId);
    }
  }, []);

  const handleMouseEnter = useCallback((triggerId, content) => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }
    
    if (isVisible) {
      handleShow(triggerId, content);
    } else {
      enterTimeoutRef.current = setTimeout(() => {
        handleShow(triggerId, content);
        enterTimeoutRef.current = null;
      }, delayDuration);
    }
  }, [isVisible, delayDuration, handleShow]);

  const handleMouseLeave = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    exitTimeoutRef.current = setTimeout(() => {
      handleHide();
      exitTimeoutRef.current = null;
    }, hideDelay);
  }, [hideDelay, handleHide]);

  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  return (
    <SmartTooltipContext.Provider value={{ registerTrigger, handleMouseEnter, handleMouseLeave, activeTooltip: activeTooltipId }}>
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn("pointer-events-none fixed", BASE_TOOLTIP_CLASSES)}
          style={{ top: 0, left: 0, opacity: 0 }}
        >
          {activeContent}
        </div>
      )}
    </SmartTooltipContext.Provider>
  );
}

export function SmartTooltip({ children, content, id }) {
  const context = useContext(SmartTooltipContext);
  const tooltipIdRef = useRef(id || `tooltip-${Math.random().toString(36).substr(2, 9)}`);
  const [triggerNode, setTriggerNode] = useState(null);

  const handleRef = useCallback((node) => {
    setTriggerNode(node);
  }, []);

  useEffect(() => {
    if (context && triggerNode) {
      context.registerTrigger(tooltipIdRef.current, triggerNode);
      return () => {
        context.registerTrigger(tooltipIdRef.current, null);
      };
    }
  }, [context, triggerNode]);

  if (context) {
    return (
      <div
        ref={handleRef}
        onMouseEnter={() => context.handleMouseEnter(tooltipIdRef.current, content)}
        onMouseLeave={() => context.handleMouseLeave()}
        className="flex flex-1 min-w-0"
      >
        {children}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}