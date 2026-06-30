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
      {/* Toast container floating on screen */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
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
      bg: 'bg-emerald-950/90 backdrop-blur-md border-emerald-500/30 text-emerald-100',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      glow: 'shadow-xl shadow-emerald-500/10'
    },
    error: {
      bg: 'bg-rose-950/90 backdrop-blur-md border-rose-500/30 text-rose-100',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
      glow: 'shadow-xl shadow-rose-500/10'
    },
    info: {
      bg: 'bg-slate-950/90 backdrop-blur-md border-slate-500/30 text-slate-100',
      icon: <Info className="w-5 h-5 text-sky-400" />,
      glow: 'shadow-xl shadow-sky-500/10'
    }
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto p-4.5 rounded-2xl border flex items-start gap-3.5 shadow-lg ${config.bg} ${config.glow}`}
    >
      <div className="shrink-0 pt-0.5">{config.icon}</div>
      <div className="flex-grow text-xs font-bold leading-relaxed text-start">
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 p-0.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
