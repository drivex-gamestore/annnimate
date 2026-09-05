import React, { forwardRef } from 'react';
import Link from 'next/link';
import { useTransitionClick } from '@hooks/useTransitionClick'; 

const NavLink = forwardRef(function({ href, onClick, children, ...rest }, ref) {
  const transitionClick = useTransitionClick(href, { onClick });
  
  return (
    <Link ref={ref} href={href} onClick={transitionClick} {...rest}>
      {children}
    </Link>
  );
});

export default NavLink;