'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Activity } from 'lucide-react';

export default function LoadingScreen() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lock scrolling during active load
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = '';
    }, 1800);

    const removeTimer = setTimeout(() => {
      setRemoved(true);
    }, 2400); // 1800ms timer + 500ms exit animation + buffer

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted || removed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0A1F] text-white"
        >
          {/* Ambient glow background */}
          <div className="absolute inset-0 bg-[#0070CD]/15 blur-[120px] rounded-full pointer-events-none"></div>

          {/* Logo container with pulse glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="relative mb-6"
          >
            <div className="absolute -inset-4 bg-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-white/10">
              <Image
                src="/emc-logo.jpg"
                alt="EMC Logo"
                width={70}
                height={70}
                className="object-contain rounded-xl"
              />
            </div>
          </motion.div>

          {/* Clinica Name with Heartbeat icon */}
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="flex items-center gap-2 mb-8"
          >
            <Activity className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <span className="font-extrabold tracking-widest text-base font-outfit uppercase">
              EMC <span className="text-cyan-400">Clinics</span>
            </span>
          </motion.div>

          {/* Sliding Progress Bar */}
          <div className="w-48 h-1 bg-white/15 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ left: '-100%' }}
              animate={{ left: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-primary to-cyan-400 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
