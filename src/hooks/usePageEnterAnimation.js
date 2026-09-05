import { useRef, useEffect } from 'react';
import { useAnimation } from '@providers/AnimationProvider';

export function usePageEnterAnimation(callback, deps = [], name = "", isEnabled = true) {
  const { whenRevealed } = useAnimation();
  
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  
  useEffect(() => {
    if (isEnabled) {
      return whenRevealed(() => callbackRef.current());
    }
  }, [whenRevealed, isEnabled, ...deps]);
}