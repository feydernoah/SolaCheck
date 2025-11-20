import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-gray-400 text-white shadow-lg active:shadow-xl md:hover:shadow-xl transform active:scale-105 md:hover:scale-105 active:bg-yellow-400 active:text-gray-800 md:hover:bg-yellow-400 md:hover:text-gray-800',
    secondary: 'bg-gray-400 text-white shadow-lg active:shadow-xl md:hover:shadow-xl transform active:scale-105 md:hover:scale-105 active:bg-yellow-400 active:text-gray-800 md:hover:bg-yellow-400 md:hover:text-gray-800',
    outline: 'border-2 border-gray-400 text-gray-800 hover:bg-gray-100 active:scale-95',
    ghost: 'text-gray-800 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-error hover:bg-error/90 text-white shadow-sm hover:shadow-md active:scale-95',
  };
  
  const sizes = {
    sm: 'px-6 py-2 text-body-sm',
    md: 'px-8 py-3 text-body',
    lg: 'px-8 py-4 text-lg',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
