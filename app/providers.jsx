"use client";

import LenisProvider from '@providers/LenisProvider'
import TransitionRouterContext from '@providers/TransitionRouterProvider'
import AnimationProvider from '@providers/AnimationProvider'
import CategoryProvider from '@providers/CategoryProvider'

export default function AppProviders({ children }) {
  return (
    <LenisProvider>
      <TransitionRouterContext>
        <AnimationProvider>
          <CategoryProvider>
             <LazyAnalytics>
              {children}
            </LazyAnalytics>
          </CategoryProvider>
        </AnimationProvider>
      </TransitionRouterContext>
    </LenisProvider>
  );
}