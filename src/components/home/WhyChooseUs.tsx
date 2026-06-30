'use client';

import { useTranslations } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useAnimations';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, CreditCard, Percent } from 'lucide-react';

const reasons = [
  { id: 'reason1', icon: ShieldCheck, color: '#0070CD', bg: '#E5F1FF' },
  { id: 'reason2', icon: Zap, color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'reason3', icon: CreditCard, color: '#10B981', bg: '#D1FAE5' },
  { id: 'reason4', icon: Percent, color: '#EF4444', bg: '#FEE2E2' },
];

export default function WhyChooseUs() {
  const t = useTranslations('WhyChooseUs');
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </motion.div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl border border-gray-100 hover:border-[#0070CD]/20 hover:shadow-lg transition-all duration-300 group bg-white"
              >
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: reason.bg }}
                >
                  <Icon className="w-8 h-8" style={{ color: reason.color }} />
                </div>

                <h3 className="font-bold text-[16px] text-[#1A1A2E] mb-2 group-hover:text-[#0070CD] transition-colors">
                  {t(`${reason.id}_title`)}
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  {t(`${reason.id}_desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
