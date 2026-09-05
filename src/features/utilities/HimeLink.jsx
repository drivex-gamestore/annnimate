'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link'; 
import { useTransitionClick } from '@hooks/useTransitionClick'; 

const HomeLink = forwardRef(function HomeLink({ 
  href, 
  onClick, 
  children, 
  ...restProps 
}, ref) {
  
  const transitionClickHandler = useTransitionClick(href, { onClick });
  return (
    <Link 
      ref={ref} 
      href={href} 
      onClick={transitionClickHandler} 
      {...restProps}
    >
      {children}
    </Link>
  );
});

export default HomeLink;