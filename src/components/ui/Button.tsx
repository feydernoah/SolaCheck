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
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-sm hover:shadow-md active:scale-95',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-sm active:scale-95',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white active:scale-95',
    ghost: 'text-brand-primary hover:bg-brand-primary/10 active:bg-brand-primary/20',
    danger: 'bg-error hover:bg-error/90 text-white shadow-sm hover:shadow-md active:scale-95',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-body-sm',
    md: 'px-6 py-3 text-body',
    lg: 'px-8 py-4 text-body-lg',
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
