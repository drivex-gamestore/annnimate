"use client"; 

import { useState } from 'react';
import PreloaderWrapper from '@animations/utils/PreloaderWrapper';
import Header from '@features/layout/header/Header';
import Footer from '@features/layout/footer/Footer'; 
import CookiePreferencesModal from '@components/CookiePreferencesModal';

export default function AppLayout({ children, latestAnimation }) {
  const [isCookieOpen, setIsCookieOpen] = useState(false);

  return (
    <>
      <PreloaderWrapper />
      <Header latestAnimation={latestAnimation} />
      <main className="flex-1 relative z-[2] bg-background" data-transition-content="true">
        {children}
      </main>
     
      <Footer latestAnimation={latestAnimation} />

      <CookiePreferencesModal 
        open={isCookieOpen} 
        onOpenChange={setIsCookieOpen} 
      />
    </>
  );
}
