
import { useContext } from 'react';
import TransitionRouterContext from '@providers/TransitionRouterProvider'; 
import { setTransitionTarget } from '@hooks/usePageTransition.js';

export function useTransitionClick(href, { replace = false, onClick } = {}) {
  const router = useContext(TransitionRouterContext);
  return (event) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      !router ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button === 1 ||
      typeof href !== 'string' ||
      !href.startsWith('/')
    ) {
      return;
    }
    event.preventDefault();
    setTransitionTarget(href);
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  };
}
