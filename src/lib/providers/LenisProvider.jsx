import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react'
import { gsap, ScrollTrigger } from '@lib/vendor'

function GSAPIntegration() {

  const lenis = useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    if (!lenis) return;
    window.lenis = lenis;
    const update = (time) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      gsap.ticker.remove(update);
      delete window.lenis;
    };
  }, [lenis]);

  return null;
}


export default function LenisProvider({ children }) {
  return (
    <ReactLenis
      root={true}
      options={{
        duration: 1.2,
        easing: (e) => Math.min(1, 1.001 - Math.pow(2, -10 * e)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        autoRaf: false,
      }}
    >
      <GSAPIntegration />
      {children}
    </ReactLenis>
  );
}