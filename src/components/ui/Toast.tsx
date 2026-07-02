'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container floating on screen - responsive for mobile/desktop */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const config = {
    success: {
      bg: 'bg-white/95 backdrop-blur-md border-emerald-150 text-slate-800',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
      accent: 'bg-emerald-500',
      icon: <CheckCircle className="w-5 h-5" />
    },
    error: {
      bg: 'bg-white/95 backdrop-blur-md border-rose-150 text-slate-800',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100/50',
      accent: 'bg-rose-500',
      icon: <AlertCircle className="w-5 h-5" />
    },
    info: {
      bg: 'bg-white/95 backdrop-blur-md border-sky-150 text-slate-800',
      iconBg: 'bg-sky-50 text-sky-600 border border-sky-100/50',
      accent: 'bg-sky-500',
      icon: <Info className="w-5 h-5" />
    }
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
      className={`pointer-events-auto p-4 rounded-2xl border flex items-center gap-3.5 shadow-2xl relative overflow-hidden ${config.bg}`}
    >
      {/* Side color accent bar */}
      <div className={`absolute top-0 bottom-0 w-1 start-0 ${config.accent}`} />
      
      {/* Icon with colored container */}
      <div className={`shrink-0 p-2 rounded-xl ${config.iconBg}`}>
        {config.icon}
      </div>
      
      {/* Message content */}
      <div className="flex-grow text-xs font-bold leading-relaxed text-start text-gray-800 ps-1">
        {toast.message}
      </div>
      
      {/* Close button */}
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
