import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ className = '', glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={`${glass ? 'glass-panel rounded-2xl' : 'clean-card'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
