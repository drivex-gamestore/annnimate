'use client';

import { useRef } from 'react';
import Link from 'next/link'; 
import LogoIcon from '@components/LogoIcon'; 
import LogoText from '@features/utilities/LogoText'; 
import { cn } from '@lib/vendor'; 
import { useTransitionClick } from '@hooks/useTransitionClick'; 
import { t } from '@components/helpers/translate'; 

export default function HeaderLogo({ className }) {
  const handleTransitionClick = useTransitionClick('/');
  const logoIconRef = useRef(null);

  return (
    <Link
      href="/"
      onClick={handleTransitionClick}
      onMouseEnter={() => logoIconRef.current?.play()}
      aria-label="Annnimate - Home"
      className={cn('flex shrink-0 items-end justify-start gap-8', className)}
    >
      <span className="flex items-end gap-6">
        <LogoIcon ref={logoIconRef} className="h-[15px] lg:h-[18px]" />
        <LogoText className="h-[15px] w-auto text-foreground lg:h-[18px]" />
      </span>
      <span className="-mb-2 mt-auto text-[9px] text-foreground-muted lg:text-[10px]">
        {t('common.header.logoByline')}
      </span>
    </Link>
  );
}
