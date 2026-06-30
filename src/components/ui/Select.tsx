import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: LucideIcon;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ className = '', icon: Icon, error, options, placeholder, ...props }: SelectProps) {
  return (
    <div className="relative w-full">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
      )}
      <select
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-10 py-3.5 bg-gray-50 rounded-lg border ${error ? 'border-danger focus:ring-danger/20' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} focus:ring-2 outline-none transition-all text-sm text-dark appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      {error && <p className="text-xs text-danger mt-1.5 ml-1">{error}</p>}
    </div>
  );
}
