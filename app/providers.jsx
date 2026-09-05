"use client";

import LenisProvider from '@providers/LenisProvider'
import TransitionRouterContext, { RouterTransition } from '@providers/TransitionRouterProvider'
import AnimationProvider from '@providers/AnimationProvider'
import CategoryProvider from '@providers/CategoryProvider'
import CookieConsentProvider from '@providers/CookieConsentProvider'
import { UserProvider } from '@providers/UserProvider'
import { ScrollLockProvider } from '@providers/ScrollLockProvider'
import AppProvidersExtras from '@providers/AppProviders'

const noop = async () => {};

export default function AppProviders({ children }) {
  return (
    <UserProvider>
      <ScrollLockProvider>
        <LenisProvider>
          <RouterTransition leave={noop} enter={noop}>
            <TransitionRouterContext>
              <AnimationProvider>
                <CategoryProvider>
                  <AppProvidersExtras>
                    {children}
                  </AppProvidersExtras>
                  <CookieConsentProvider />
                </CategoryProvider>
              </AnimationProvider>
            </TransitionRouterContext>
          </RouterTransition>
        </LenisProvider>
      </ScrollLockProvider>
    </UserProvider>
  );
}
