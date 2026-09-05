"use client";

import LenisProvider from '@providers/LenisProvider'
import TransitionRouterContext, { RouterTransition } from '@providers/TransitionRouterProvider'
import AnimationProvider from '@providers/AnimationProvider'
import CategoryProvider from '@providers/CategoryProvider'

const noop = async () => {};

export default function AppProviders({ children }) {
  return (
    <LenisProvider>
      <RouterTransition leave={noop} enter={noop}>
        <TransitionRouterContext>
          <AnimationProvider>
            <CategoryProvider>
              {children}
            </CategoryProvider>
          </AnimationProvider>
        </TransitionRouterContext>
      </RouterTransition>
    </LenisProvider>
  );
}