"use client"; 

import { useState } from 'react';
import PreloaderWrapper from '@animations/utils/PreloaderWrapper';
import Header from '@features/layout/header/Header';
import CookiePreferencesModal from '@components/CookiePreferencesModal';

export default function AppLayout({ children }) {
  const [isCookieOpen, setIsCookieOpen] = useState(false);

  return (
    <>
      <PreloaderWrapper />
      <Header />
      <main className="flex-1 relative z-[2] bg-background" data-transition-content="true">
        {children}
      </main>
      <CookiePreferencesModal 
        open={isCookieOpen} 
        onOpenChange={setIsCookieOpen} 
      />
    </>
  );
}
