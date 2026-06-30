import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: string;
}

export function Input({ className = '', icon: Icon, error, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      )}
      <input
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 bg-gray-50 rounded-lg border ${error ? 'border-danger focus:ring-danger/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} focus:ring-2 outline-none transition-all text-sm text-dark placeholder-gray-400 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1.5 ml-1">{error}</p>}
    </div>
  );
}
