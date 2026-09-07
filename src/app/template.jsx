"use client";

import { useEffect } from "react";
import { useAnimation } from "@providers/AnimationProvider";

export default function Template({ children }) {
  const { triggerPageEnter } = useAnimation();

  useEffect(() => {
    triggerPageEnter();
  }, [triggerPageEnter]);

  return <>{children}</>;
}
