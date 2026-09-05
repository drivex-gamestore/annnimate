import { useState } from 'react';

let cachedWebGLSupport;

function checkWebGLSupport() {
  if (typeof document === "undefined") return true;
  if (cachedWebGLSupport !== undefined) return cachedWebGLSupport;
  
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    cachedWebGLSupport = !!gl;
    
    try {
      gl?.getExtension?.("WEBGL_lose_context")?.loseContext?.();
    } catch (e) {}
  } catch (e) {
    cachedWebGLSupport = false;
  }
  
  return cachedWebGLSupport;
}

export function useWebGLSupport() {
  const [isSupported] = useState(checkWebGLSupport);
  return isSupported;
}