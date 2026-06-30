'use client';

import { useTranslations } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useAnimations';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Users, Stethoscope, Award, Calendar } from 'lucide-react';

const stats = [
  { id: 'doctors', icon: Stethoscope, valKey: 'doctors_val', numericEnd: 50, suffix: '+', color: '#0070CD' },
  { id: 'patients', icon: Users, valKey: 'patients_val', numericEnd: 100, suffix: 'K+', color: '#10B981' },
  { id: 'specialties', icon: Award, valKey: 'specialties_val', numericEnd: 12, suffix: '+', color: '#F59E0B' },
  { id: 'experience', icon: Calendar, valKey: 'experience_val', numericEnd: 10, suffix: '+', color: '#8B5CF6' },
];

function CountUp({ end, suffix, isActive }: { end: number; suffix: string; isActive: boolean }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isActive || hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isActive, end]);

  return <span className="counter-value">{count}{suffix}</span>;
}

export default function StatsSection() {
  const t = useTranslations('Stats');
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="py-20 sm:py-24 lg:py-28 bg-gradient-to-r from-[#0070CD] to-[#005FB0] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold mb-1">
                  <CountUp end={stat.numericEnd} suffix={stat.suffix} isActive={isVisible} />
                </div>
                <p className="text-white/80 text-sm font-medium">
                  {t(stat.id)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
