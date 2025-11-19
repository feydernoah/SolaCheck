import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

export function Card({ 
  children, 
  padding = 'md', 
  hover = false, 
  className = '' 
}: CardProps) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6 md:p-8',
    lg: 'p-8 md:p-12',
  };
  
  const hoverEffect = hover 
    ? 'hover:shadow-xl transition-shadow duration-300' 
    : '';
  
  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${paddings[padding]} ${hoverEffect} ${className}`}
    >
      {children}
    </div>
  );
}
