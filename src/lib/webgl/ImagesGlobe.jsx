'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';

// NOTE: original module id: 457714
import { loadSharedImage } from '@/shared/loadSharedImage';

// ── MODULE 143848: useWebGLSupport ─────────────────────────
let cachedWebGLSupport;

function checkWebGLSupport() {
  if (typeof document === 'undefined') return true;
  if (cachedWebGLSupport !== undefined) return cachedWebGLSupport;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    cachedWebGLSupport = !!gl;

    try {
      gl?.getExtension?.('WEBGL_lose_context')?.loseContext?.();
    } catch (e) {}
  } catch (e) {
    cachedWebGLSupport = false;
  }
  return cachedWebGLSupport;
}

export function useWebGLSupport() {
  return useState(checkWebGLSupport)[0];
}

// ── MODULE 607601: ImagesGlobe ─────────────────────────────
const TILT_ANGLE = Math.PI / 7;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const planeGeometry = new THREE.PlaneGeometry(0.6, 0.44);

function debugLog(msg) {
  // Empty logger stripped for production
}

function Warmup() {
  const { gl, scene, camera } = useThree();
  const hasWarmedUpRef = useRef(false);

  useEffect(() => {
    if (hasWarmedUpRef.current) return;
    hasWarmedUpRef.current = true;

    const warmup = () => {
      const start = performance.now();
      try {
        gl.compile(scene, camera);
      } catch (e) {}
      debugLog(`warmup ${(performance.now() - start).toFixed(1)}ms`);
    };

    if (typeof requestIdleCallback === 'function') {
      const handle = requestIdleCallback(warmup, { timeout: 500 });
      return () => cancelIdleCallback(handle);
    }
    
    const handle = setTimeout(warmup, 0);
    return () => clearTimeout(handle);
  }, [gl, scene, camera]);

  return null;
}

function ImageNode({ position, rotation, texture, wantsPlay, revealDelay, reducedMotion }) {
  const meshRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(reducedMotion ? 1 : 0);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (wantsPlay && meshRef.current) {
      if (reducedMotion) {
        meshRef.current.scale.setScalar(1);
        return;
      }
      
      tweenRef.current?.kill();
      tweenRef.current = gsap.to(meshRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.1,
        ease: 'power3.out',
        delay: revealDelay
      });
      
      return () => tweenRef.current?.kill();
    }
  }, [wantsPlay, revealDelay, reducedMotion]);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} geometry={planeGeometry} frustumCulled={false}>
      <meshBasicMaterial map={texture} side={THREE.FrontSide} />
    </mesh>
  );
}

function useTextures(images) {
  const { gl } = useThree();
  const [, forceRender] = useState(0);
  const stateRef = useRef({
    textures: [],
    uploaded: new Set(),
    target: 0,
    loadedCount: 0,
    initialized: false
  });

  useEffect(() => {
    const state = stateRef.current;
    if (state.initialized) return;
    state.initialized = true;

    const targetCount = Math.min(70, images.length);
    if (state.target = targetCount, targetCount === 0) return;

    const startTime = performance.now();
    let isCancelled = false;
    let currentIndex = 0;
    let activeLoads = 0;
    const handles = new Set();

    function queueNext() {
      if (isCancelled) return;
      while (activeLoads < 4 && currentIndex < targetCount) {
        const index = currentIndex++;
        activeLoads++;
        
        const handle = typeof requestIdleCallback === 'function'
          ? requestIdleCallback(() => processImage(index, handle), { timeout: 2000 })
          : setTimeout(() => processImage(index, null), 0);
          
        if (handle) handles.add(handle);
      }
    }

    async function processImage(index, handle) {
      if (handle) handles.delete(handle);
      if (isCancelled) return;

      try {
        const imageSource = await loadSharedImage(images[index], { maxWidth: 384 });
        if (isCancelled) {
          imageSource.close?.();
          return;
        }

        const texture = new THREE.Texture(imageSource);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
        texture.flipY = false;
        texture.needsUpdate = true;

        const uploadStart = performance.now();
        gl.initTexture(texture);
        
        const uploadTime = performance.now() - uploadStart;
        if (uploadTime > 10) debugLog(`upload-slow #${index} ${uploadTime.toFixed(1)}ms`);

        state.textures[index] = texture;
        state.uploaded.add(index);
        state.loadedCount++;
        
        forceRender(prev => prev + 1);

        if (state.loadedCount === targetCount) {
          debugLog(`textures-ready (${(performance.now() - startTime).toFixed(0)}ms total)`);
        }
      } catch (err) {
        state.loadedCount++;
      } finally {
        activeLoads--;
        queueNext();
      }
    }

    queueNext();

    return () => {
      isCancelled = true;
      for (const handle of handles) {
        if (typeof cancelIdleCallback === 'function') {
          try {
            cancelIdleCallback(handle);
          } catch (e) {
            clearTimeout(handle);
          }
        } else {
          clearTimeout(handle);
        }
      }
      handles.clear();
      
      for (const tex of state.textures) {
        tex?.dispose();
      }
      
      state.textures = [];
      state.uploaded.clear();
      state.target = 0;
      state.loadedCount = 0;
      state.initialized = false;
    };
  }, [images, gl]);

  return { textures: stateRef.current.textures, uploaded: stateRef.current.uploaded };
}

function SceneGroup({ images, wantsPlay, reducedMotion }) {
  const groupRef = useRef(null);
  const physicsRef = useRef({
    spin: 0,
    inertia: 0,
    dragAccum: 0,
    dragging: false,
    lastX: 0,
    firstRenderLogged: false,
    frames: 0,
    droppedFrames: 0,
    maxDt: 0,
    lastLog: performance.now()
  });

  const { textures, uploaded } = useTextures(images);

  const layoutData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 70; i++) {
      const y = 1 - (i / 69) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = i * GOLDEN_ANGLE;
      
      const x = Math.cos(theta) * radius * 3;
      const z = Math.sin(theta) * radius * 3;
      const adjustedY = y * 3;

      const matrix = new THREE.Matrix4().lookAt(
        new THREE.Vector3(x, adjustedY, z),
        new THREE.Vector3(2 * x, 2 * adjustedY, 2 * z),
        new THREE.Vector3(0, 1, 0)
      );
      
      const quat = new THREE.Quaternion().setFromRotationMatrix(matrix);
      const euler = new THREE.Euler().setFromQuaternion(quat);

      data.push({
        position: [x, adjustedY, z],
        rotation: [euler.x, euler.y, euler.z],
        revealDelay: 0.7 * Math.random()
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    const p = physicsRef.current;
    
    p.frames++;
    if (delta > p.maxDt) p.maxDt = delta;
    if (delta > 0.033) p.droppedFrames++;
    
    if (!p.firstRenderLogged) {
      p.firstRenderLogged = true;
      debugLog("first-render");
    }

    const dragDelta = -0.0015 * p.dragAccum;
    p.dragAccum = 0;

    if (p.dragging) {
      p.inertia = delta > 0 ? Math.max(-1.4, Math.min(1.4, dragDelta / delta)) : 0;
    } else {
      p.inertia *= Math.exp(-2.4 * delta);
    }

    if (!reducedMotion) {
      p.spin += -0.05 * delta;
    }
    
    p.spin += dragDelta;
    
    if (!p.dragging) {
      p.spin += p.inertia * delta;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = p.spin;
    }

    const now = performance.now();
    if (now - p.lastLog > 1000) {
      const fps = p.frames / ((now - p.lastLog) / 1000);
      debugLog(`fps=${fps.toFixed(0)} maxDt=${(1000 * p.maxDt).toFixed(1)}ms dropped=${p.droppedFrames}`);
      p.frames = 0;
      p.droppedFrames = 0;
      p.maxDt = 0;
      p.lastLog = now;
    }
  });

  const { gl } = useThree();

  useEffect(() => {
    const domEl = gl.domElement;
    const p = physicsRef.current;

    function onPointerDown(e) {
      p.dragging = true;
      p.lastX = e.clientX;
      domEl.setPointerCapture?.(e.pointerId);
      domEl.style.cursor = "grabbing";
    }

    function onPointerMove(e) {
      if (p.dragging) {
        p.dragAccum += e.clientX - p.lastX;
        p.lastX = e.clientX;
      }
    }

    function onPointerUp(e) {
      if (p.dragging) {
        p.dragging = false;
        domEl.releasePointerCapture?.(e.pointerId);
        domEl.style.cursor = "grab";
      }
    }

    domEl.style.cursor = "grab";
    domEl.style.touchAction = "pan-y";

    domEl.addEventListener("pointerdown", onPointerDown);
    domEl.addEventListener("pointermove", onPointerMove);
    domEl.addEventListener("pointerup", onPointerUp);
    domEl.addEventListener("pointercancel", onPointerUp);

    return () => {
      domEl.removeEventListener("pointerdown", onPointerDown);
      domEl.removeEventListener("pointermove", onPointerMove);
      domEl.removeEventListener("pointerup", onPointerUp);
      domEl.removeEventListener("pointercancel", onPointerUp);
    };
  }, [gl]);

  return (
    <group rotation={[-TILT_ANGLE, 0, -(0.4 * TILT_ANGLE)]}>
      <group ref={groupRef}>
        {layoutData.map((data, index) => {
          const texture = textures[index];
          return texture && uploaded.has(index) ? (
            <ImageNode
              key={index}
              position={data.position}
              rotation={data.rotation}
              texture={texture}
              wantsPlay={wantsPlay}
              revealDelay={data.revealDelay}
              reducedMotion={reducedMotion}
            />
          ) : null;
        })}
      </group>
    </group>
  );
}

if (typeof performance !== 'undefined') {
  performance.now();
}

export default function ImagesGlobe({ images = [], wantsPlay = false, active = true }) {
  debugLog("mount");
  
  const [reducedMotion, setReducedMotion] = useState(false);
  const isWebGLSupported = useWebGLSupport();

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    
    const onChange = (e) => setReducedMotion(e.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  if (!isWebGLSupported) {
    return null;
  }

  return (
    <Canvas
      className="size-full block"
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 11], fov: 35 }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        debugLog("r3f-created");
        gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
      }}
    >
      <Warmup />
      <SceneGroup images={images} wantsPlay={wantsPlay} reducedMotion={reducedMotion} />
    </Canvas>
  );
}

