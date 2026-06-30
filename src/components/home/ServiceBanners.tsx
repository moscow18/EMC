'use client';

import { useTranslations } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useAnimations';
import { motion } from 'framer-motion';
import { Stethoscope, Video, Home, ArrowRight } from 'lucide-react';

const services = [
  {
    id: 'clinic',
    titleKey: 'clinic_title',
    descKey: 'clinic_desc',
    ctaKey: 'clinic_cta',
    icon: Stethoscope,
    gradient: 'from-[#0070CD] to-[#0050A0]',
    iconBg: 'bg-white/20',
  },
  {
    id: 'online',
    titleKey: 'online_title',
    descKey: 'online_desc',
    ctaKey: 'online_cta',
    icon: Video,
    gradient: 'from-[#7C3AED] to-[#5B21B6]',
    iconBg: 'bg-white/20',
  },
  {
    id: 'home',
    titleKey: 'home_title',
    descKey: 'home_desc',
    ctaKey: 'home_cta',
    icon: Home,
    gradient: 'from-[#059669] to-[#047857]',
    iconBg: 'bg-white/20',
  },
];

export default function ServiceBanners() {
  const t = useTranslations('ServiceBanners');
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="services" ref={ref} className="section-padding bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="section-title">{t('title')}</h2>
        </motion.div>

        {/* Service Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 25 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`vez-service-banner bg-gradient-to-br ${service.gradient} text-white group`}
              >
                {/* Decorative circle */}
                <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-4 -start-4 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${service.iconBg} flex items-center justify-center mb-5`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{t(service.titleKey)}</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">{t(service.descKey)}</p>

                  {/* CTA */}
                  <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all group-hover:gap-3">
                    {t(service.ctaKey)}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
