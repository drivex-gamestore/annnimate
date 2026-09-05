'use client';

import { forwardRef, useRef, useImperativeHandle } from 'react';
import gsap from 'gsap'; 
import { useGSAP } from '@gsap/react'; 
import { cn } from '@lib/vendor'; 
import LogoIconSvg from '@components/ui/LogoIconSvg'; 

const LogoIcon = forwardRef(function LogoIcon(
  { className, strokeWidth = 26, ...restProps },
  ref
) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  const getPaths = () => {
    const el = containerRef.current;
    return {
      brand: Array.from(el?.querySelectorAll('[data-pass="brand"] path') || []),
      fg: Array.from(el?.querySelectorAll('[data-pass="fg"] path') || []),
    };
  };

  const hidePaths = (paths) =>
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    });

  const play = () => {
    const { brand, fg } = getPaths();
    if (!brand.length) return;

    timelineRef.current?.kill();
    hidePaths(brand);
    hidePaths(fg);

    const staggerConfig = { each: 0.1 };
    const tl = gsap.timeline();

    tl.to(
      brand,
      {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: 'expo.inOut',
        stagger: staggerConfig,
      },
      0
    );

    tl.to(
      fg,
      {
        strokeDashoffset: 0,
        duration: 0.9,
        ease: 'expo.inOut',
        stagger: staggerConfig,
      },
      0.12
    );

    timelineRef.current = tl;
  };

  useImperativeHandle(ref, () => ({ play }), []);

  useGSAP(
    () => {
      const { brand, fg } = getPaths();

      [...brand, ...fg].forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: 0,
        });
      });

      return () => timelineRef.current?.kill();
    },
    { scope: containerRef }
  );

  const layeredItemClass = 'col-start-1 row-start-1 h-full w-auto';

  return (
    <span
      ref={containerRef}
      className={cn('grid place-items-center', className)}
      {...restProps}
    >
      <LogoIconSvg
        data-pass="brand"
        strokeWidth={strokeWidth}
        className={`${layeredItemClass} text-brand`}
      />
      <LogoIconSvg
        data-pass="fg"
        strokeWidth={strokeWidth}
        className={`${layeredItemClass} text-foreground`}
      />
    </span>
  );
});

export default LogoIcon;
