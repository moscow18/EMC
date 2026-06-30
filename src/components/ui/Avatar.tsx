import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, initials, size = 'md', className = '', ...props }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-2xl',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-primary/10 border-2 border-white shadow-sm shrink-0 ${sizes[size]} ${className}`}
      {...props}
    >
      {src ? (
        <img src={src} alt={initials || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-primary">{initials}</span>
      )}
    </div>
  );
}
