'use client';

import { useTranslations } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useAnimations';
import { motion } from 'framer-motion';
import { Check, Smartphone, Download } from 'lucide-react';

export default function AppDownloadSection() {
  const t = useTranslations('AppDownload');
  const { ref, isVisible } = useScrollAnimation();

  const features = [
    t('feature1'),
    t('feature2'),
    t('feature3'),
    t('feature4'),
  ];

  return (
    <section ref={ref} className="section-padding bg-gradient-to-br from-[#F0F7FF] to-[#E5F1FF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A2E] mb-4 leading-tight">
              {t('title')}
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
              {t('subtitle')}
            </p>

            {/* Features list */}
            <ul className="space-y-3 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0070CD] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-gray-700 text-[15px] font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            {/* App Store Buttons */}
            <div className="flex flex-wrap gap-3">
              <a href="#" className="inline-flex items-center gap-3 bg-[#1A1A2E] hover:bg-black text-white px-6 py-3 rounded-xl transition-colors">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="text-start">
                  <div className="text-[9px] uppercase tracking-wider opacity-80">Download on the</div>
                  <div className="text-[15px] font-bold -mt-0.5">App Store</div>
                </div>
              </a>
              <a href="#" className="inline-flex items-center gap-3 bg-[#1A1A2E] hover:bg-black text-white px-6 py-3 rounded-xl transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.414l2.937 1.7c.486.282.486.965 0 1.246l-2.937 1.7-2.523-2.523 2.523-2.523zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <div className="text-start">
                  <div className="text-[9px] uppercase tracking-wider opacity-80">Get it on</div>
                  <div className="text-[15px] font-bold -mt-0.5">Google Play</div>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Right - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex justify-center items-center"
          >
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-[260px] h-[520px] bg-[#1A1A2E] rounded-[40px] p-3 shadow-2xl shadow-[#0070CD]/20 mx-auto relative overflow-hidden">
                <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative border border-gray-800">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1A1A2E] rounded-b-xl z-20" />
                  
                  {/* Real screenshot from our generation */}
                  <img 
                    src="/emc_app_screen.png" 
                    alt="EMC Mobile App Screen" 
                    className="w-full h-full object-cover relative z-10"
                  />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -end-4 w-20 h-20 bg-[#0070CD]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -start-4 w-24 h-24 bg-[#0070CD]/10 rounded-full blur-2xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
