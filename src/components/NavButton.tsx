
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavButtonProps {
  to: string;
  className?: string;
  children: React.ReactNode;
}

const NavButton = ({ to, className, children }: NavButtonProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        'nav-button group',
        className
      )}
    >
      <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
        {children}
      </span>
    </Link>
  );
};

export default NavButton;
