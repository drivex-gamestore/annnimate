"use client";

import {
  createContext,
  useContext,
  useState,
  useTransition,
  useRef,
  useEffect,
  useCallback,
  useMemo
} from "react";
import { usePathname, useRouter } from "next/navigation";

const RouterTransitionContext = createContext(null);

export function useRouterTransition() {
  const context = useContext(RouterTransitionContext);
  if (!context) {
    throw Error("useRouterTransition must be used within TransitionProvider");
  }
  return context;
}

export function RouterTransition({ children, leave, enter }) {
  const pathname = usePathname();
  const [isLeaving, setIsLeaving] = useState(false);
  const [stage, setStage] = useState(undefined);
  const [pendingPath, setPendingPath] = useState(null);
  const [, startTransition] = useTransition();
  const hasRunEnter = useRef(false);

  useEffect(() => {
    if (!isLeaving || hasRunEnter.current) return;
    
    const runEnter = () => {
      if (!hasRunEnter.current) {
        hasRunEnter.current = true;
        setStage("entering");
        startTransition(async () => {
          await enter().then(cb => cb?.());
          setStage(undefined);
          setIsLeaving(false);
          setPendingPath(null);
        });
      }
    };
    
    if (!pendingPath || pathname === pendingPath) {
      runEnter();
      return;
    }
    
    const timeout = setTimeout(runEnter, 2000);
    return () => clearTimeout(timeout);
  }, [enter, isLeaving, pathname, pendingPath]);

  const transitionContextValue = [
    {
      isPending: !!stage,
      stage: stage,
      pendingPath: pendingPath
    },
    (navigationCallback, targetPath) => {
      if (stage) {
        
      } else {
        hasRunEnter.current = false;
        setStage("leaving");
        setPendingPath(targetPath);
        startTransition(async () => {
          setIsLeaving(true);
          await leave().then(cb => cb?.());
          await navigationCallback();
        });
      }
    }
  ];

  return (
    <RouterTransitionContext.Provider value={transitionContextValue}>
      {children}
    </RouterTransitionContext.Provider>
  );
}




const TransitionRouterContext = createContext(null);

function getPathname(urlOrObj) {
  if (!urlOrObj) return null;
  if (typeof urlOrObj === "object" && urlOrObj.pathname) return urlOrObj.pathname;
  const str = typeof urlOrObj === "object" ? urlOrObj.toString() : urlOrObj;
  
  try {
    if (str.startsWith("http://") || str.startsWith("https://")) {
      return new URL(str).pathname;
    }
    const [path] = str.split(/[?#]/);
    return path || "/";
  } catch {
    return str;
  }
}

function isSamePathnameOrQuery(currentPathname, targetPath) {
  const targetPathname = getPathname(targetPath);
  return !!(
    !targetPathname || 
    currentPathname === targetPathname || 
    (typeof targetPath === "string" && targetPath.startsWith("#"))
  );
}

export function TransitionRouterProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [transitionState, startRouteTransition] = useRouterTransition();

  const push = useCallback((href, options) => {
    if (isSamePathnameOrQuery(pathname, href)) {
      return router.push(href, options);
    }
    const targetPathname = getPathname(href);
    startRouteTransition(() => {
      router.push(href, options);
    }, targetPathname);
  }, [router, pathname, startRouteTransition]);

  const replace = useCallback((href, options) => {
    if (isSamePathnameOrQuery(pathname, href)) {
      return router.replace(href, options);
    }
    const targetPathname = getPathname(href);
    startRouteTransition(() => {
      router.replace(href, options);
    }, targetPathname);
  }, [router, pathname, startRouteTransition]);

  const transitionRouterValue = useMemo(() => ({
    ...router,
    push,
    replace,
    transition: transitionState
  }), [router, push, replace, transitionState]);

  return (
    <TransitionRouterContext.Provider value={transitionRouterValue}>
      {children}
    </TransitionRouterContext.Provider>
  );
}

export function useTransitionRouter() {
  const context = useContext(TransitionRouterContext);
  if (!context) {
    throw Error("useTransitionRouter must be used within TransitionRouterProvider. Make sure TransitionRouterProvider wraps your component.");
  }
  return context;
}


export default TransitionRouterProvider;

