import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

export function Badge({ className = '', variant = 'primary', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  
  const variants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning-dark',
    danger: 'bg-danger/10 text-danger',
    outline: 'border border-gray-200 text-gray-800',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
