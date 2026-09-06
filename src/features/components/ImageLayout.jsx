"use client";

import React, {
  forwardRef,
  useRef,
  useMemo,
  useCallback,
  useImperativeHandle,
  useEffect
} from "react";





import { gsap } from "@lib/vendor";



import { bunnyImageUrl } from "@/lib/imageUtils";




const DEFAULT_LAYOUT = {
  cardW: 320,
  cardH: 180,
  gap: 48,
  cols: 6,
  rowCount: 6,
  offsetX: 184
};






























const ImageLayout = forwardRef(function ImageLayout({
  images,
  className = "",
  cursorRef = null,
  layout = null,
  entrance = null,
  driftVx = -28,
  driftVy = -14
}, ref) {
  const mergedLayout = useMemo(() => ({ ...DEFAULT_LAYOUT, ...(layout || {}) }), [layout]);
  
  const containerRef = useRef(null);
  const wrapRef = useRef(null);
  const itemsDataRef = useRef([]);
  
  const posRef = useRef({ current: { x: 0, y: 0 }, target: { x: 0, y: 0 } });
  const dragState = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  const boundsRef = useRef({ w: 0, h: 0 });
  const physicsRef = useRef({ enabled: true, vx: driftVx, vy: driftVy });
  
  
  physicsRef.current.vx = driftVx;
  physicsRef.current.vy = driftVy;
  
  const rafId = useRef(0);
  const lastTime = useRef(0);
  const isIntersecting = useRef(true);
  const hasRevealed = useRef(false);

  
  const gridItems = useMemo(() => {
    let items = [];
    const cellW = mergedLayout.cardW + mergedLayout.gap;
    const cellH = mergedLayout.cardH + mergedLayout.gap;
    let imgIndex = 0;
    
    for (let row = 0; row < mergedLayout.rowCount; row++) {
      const rowOffset = row % 2 === 0 ? mergedLayout.offsetX : 0;
      const yPos = row * cellH;
      
      for (let col = 0; col < mergedLayout.cols; col++) {
        const xPos = rowOffset + col * cellW;
        const imgItem = images[imgIndex % images.length];
        
        items.push({
          x: xPos,
          y: yPos,
          src: bunnyImageUrl(imgItem, { width: 640 })
        });
        
        imgIndex++;
      }
    }
    return items;
  }, [images, mergedLayout]);

  
  const setItemRef = useCallback((index) => (node) => {
    if (!node) return;
    
    if (!itemsDataRef.current[index]) {
      itemsDataRef.current[index] = {};
    }
    
    const itemData = itemsDataRef.current[index];
    itemData.el = node;
    itemData.img = node.querySelector("img");
    itemData.x = gridItems[index].x;
    itemData.y = gridItems[index].y;
    itemData.w = mergedLayout.cardW;
    itemData.h = mergedLayout.cardH;
    itemData.extraX = 0;
    itemData.extraY = 0;
    
    if (entrance === "center-out" && !hasRevealed.current) {
      node.style.opacity = "0";
    }
  }, [gridItems, mergedLayout, entrance]);

  
  const revealAnim = useCallback(() => {
    if (entrance !== "center-out" || hasRevealed.current) return;
    
    hasRevealed.current = true;
    const bounds = boundsRef.current;
    const centerX = bounds.w / 2;
    const centerY = bounds.h / 2;
    const pCurrent = posRef.current.current;
    
    itemsDataRef.current.forEach(item => {
      if (!item?.el) return;
      
      
      const itemCenterX = item.x + pCurrent.x + (item.extraX || 0) + (item.w / 2);
      const itemCenterY = item.y + pCurrent.y + (item.extraY || 0) + (item.h / 2);
      const distance = Math.hypot(itemCenterX - centerX, itemCenterY - centerY);
      
      gsap.to(item.el, {
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.0016 * distance,
        overwrite: true
      });
    });
  }, [entrance]);

  useImperativeHandle(ref, () => ({
    reveal: revealAnim
  }), [revealAnim]);

  
  useEffect(() => {
    if (entrance !== "center-out") return;
    const timer = window.setTimeout(revealAnim, 4000);
    return () => window.clearTimeout(timer);
  }, [entrance, revealAnim]);

  
  useEffect(() => {
    const containerEl = containerRef.current;
    const wrapEl = wrapRef.current;
    if (!containerEl || !wrapEl) return;
    
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    physicsRef.current.enabled = !reducedMotion;
    
    const gridWidth = mergedLayout.cols * (mergedLayout.cardW + mergedLayout.gap);
    const gridHeight = mergedLayout.rowCount * (mergedLayout.cardH + mergedLayout.gap);
    
    const updateBounds = () => {
      const rect = containerEl.getBoundingClientRect();
      boundsRef.current.w = rect.width;
      boundsRef.current.h = rect.height;
    };
    updateBounds();
    
    
    posRef.current.current.x = posRef.current.target.x = -(0.1 * boundsRef.current.w);
    posRef.current.current.y = posRef.current.target.y = -(0.1 * boundsRef.current.h);
    
    const observer = new IntersectionObserver((entries) => {
      isIntersecting.current = entries[0]?.isIntersecting ?? true;
    }, { rootMargin: "200px" });
    observer.observe(containerEl);
    
    window.addEventListener("resize", updateBounds);
    
    
    const startDrag = (x, y) => {
      dragState.current.active = true;
      dragState.current.startX = x;
      dragState.current.startY = y;
      dragState.current.baseX = posRef.current.target.x;
      dragState.current.baseY = posRef.current.target.y;
      
      wrapEl.classList.add("is-dragging");
      
      if (!reducedMotion) {
        itemsDataRef.current.forEach(item => {
          if (item?.img) {
            gsap.to(item.img, { scale: 0.95, duration: 0.3, ease: "expo.out", overwrite: true });
          }
        });
      }
    };
    
    const moveDrag = (x, y) => {
      if (dragState.current.active) {
        posRef.current.target.x = dragState.current.baseX + (x - dragState.current.startX);
        posRef.current.target.y = dragState.current.baseY + (y - dragState.current.startY);
      }
    };
    
    const endDrag = () => {
      if (dragState.current.active) {
        dragState.current.active = false;
        wrapEl.classList.remove("is-dragging");
        
        itemsDataRef.current.forEach(item => {
          if (item?.img) {
            gsap.to(item.img, { scale: 1, duration: 0.3, ease: "expo.out", overwrite: true });
          }
        });
      }
    };
    
    const handleMouseDown = (e) => {
      if (e.button === 0) {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
      }
    };
    const handleMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const handleMouseUp = () => endDrag();
    
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    };
    const handleTouchMove = (e) => {
      if (!dragState.current.active) return;
      e.preventDefault();
      const touch = e.touches[0];
      moveDrag(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = () => endDrag();
    
    containerEl.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    containerEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    containerEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    containerEl.addEventListener("touchend", handleTouchEnd);
    
    
    const handlePointerEnter = () => cursorRef?.current?.setLabel?.("Drag");
    const handlePointerLeave = () => cursorRef?.current?.clearLabel?.();
    
    containerEl.addEventListener("pointerenter", handlePointerEnter);
    containerEl.addEventListener("pointerleave", handlePointerLeave);
    
    
    const tick = (time) => {
      rafId.current = requestAnimationFrame(tick);
      
      if (!isIntersecting.current) {
        lastTime.current = time;
        return;
      }
      
      const dt = lastTime.current ? (time - lastTime.current) / 1000 : 0;
      lastTime.current = time;
      
      
      if (physicsRef.current.enabled && !dragState.current.active && dt > 0) {
        posRef.current.target.x += physicsRef.current.vx * dt;
        posRef.current.target.y += physicsRef.current.vy * dt;
      }
      
      
      const pRef = posRef.current;
      pRef.current.x += (pRef.target.x - pRef.current.x) * 0.08;
      pRef.current.y += (pRef.target.y - pRef.current.y) * 0.08;
      
      const bounds = boundsRef.current;
      
      
      itemsDataRef.current.forEach(item => {
        if (!item?.el) return;
        
        let finalX = item.x + pRef.current.x + item.extraX;
        let finalY = item.y + pRef.current.y + item.extraY;
        
        while (finalX + item.w < 0) {
          item.extraX += gridWidth;
          finalX += gridWidth;
        }
        while (finalX > bounds.w) {
          item.extraX -= gridWidth;
          finalX -= gridWidth;
        }
        while (finalY + item.h < 0) {
          item.extraY += gridHeight;
          finalY += gridHeight;
        }
        while (finalY > bounds.h) {
          item.extraY -= gridHeight;
          finalY -= gridHeight;
        }
        
        item.el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
      });
    };
    
    rafId.current = requestAnimationFrame(tick);
    
    return () => {
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
      window.removeEventListener("resize", updateBounds);
      
      containerEl.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      
      containerEl.removeEventListener("touchstart", handleTouchStart);
      containerEl.removeEventListener("touchmove", handleTouchMove);
      containerEl.removeEventListener("touchend", handleTouchEnd);
      
      containerEl.removeEventListener("pointerenter", handlePointerEnter);
      containerEl.removeEventListener("pointerleave", handlePointerLeave);
      
      cursorRef?.current?.clearLabel?.();
      
      itemsDataRef.current.forEach(item => {
        if (item?.img) {
          gsap.killTweensOf(item.img);
        }
      });
    };
  }, [mergedLayout]);

  return (
    <div
      ref={containerRef}
      className={`library-showcase relative h-full w-full overflow-hidden ${className}`.trim()}
      aria-hidden="true"
    >
      <div
        ref={wrapRef}
        className="library-showcase-wrap absolute inset-0 cursor-grab select-none [&.is-dragging]:cursor-grabbing"
      >
        {gridItems.map((item, index) => (
          <div
            key={index}
            ref={setItemRef(index)}
            className="absolute left-0 top-0 will-change-transform"
            style={{ width: `${mergedLayout.cardW}px`, height: `${mergedLayout.cardH}px` }}
          >
            <img
              src={item.src}
              alt=""
              loading="lazy"
              draggable="false"
              className="block object-cover opacity-90 transition-opacity duration-300 hover:opacity-100"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

export default ImageLayout;