'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useAnimations';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { doctors, filterTabs } from '@/data/doctors';

export default function DoctorsSection() {
  const t = useTranslations('Doctors');
  const tSpec = useTranslations('Specialties');
  const locale = useLocale();
  const { ref, isVisible } = useScrollAnimation();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredDoctors = activeFilter === 'all'
    ? doctors
    : doctors.filter(d => d.category === activeFilter);

  return (
    <section id="doctors" ref={ref} className="section-padding bg-[#F4F6F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4"
        >
          <div>
            <h2 className="section-title">{t('title')}</h2>
            <p className="section-subtitle">{t('subtitle')}</p>
          </div>
          <Link 
            href={`/${locale}/doctors`} 
            className="text-[#0070CD] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all shrink-0"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#0070CD] text-white shadow-md shadow-[#0070CD]/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0070CD]/30 hover:text-[#0070CD]'
              }`}
            >
              {tab.id === 'all' ? t('all') : tSpec(tab.key)}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor, i) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="vez-doctor-card group"
            >
              <div className="flex gap-4 p-4">
                {/* Doctor Image */}
                <div className="w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <img
                    src={doctor.image}
                    alt={t(doctor.nameKey)}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[15px] text-[#1A1A2E] group-hover:text-[#0070CD] transition-colors truncate">
                    {t(doctor.nameKey)}
                  </h3>
                  <p className="text-[12px] text-[#0070CD] font-semibold mt-0.5">
                    {t(doctor.specialtyKey)}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center gap-0.5 bg-[#FFF8E1] px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 text-[#FFB300] fill-[#FFB300]" />
                      <span className="text-[12px] font-bold text-[#1A1A2E]">{doctor.rating}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {t('reviews', { count: doctor.reviews })}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 mt-1.5 text-gray-400">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="text-[11px] truncate">{t(doctor.locationKey)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-[#FAFBFC]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{t('waitTime', { time: doctor.waitTime })}</span>
                  </div>
                  <div className="text-[12px] font-bold text-[#1A1A2E]">
                    {t('fees')}: {doctor.fees} {t('egp')}
                  </div>
                </div>
                <Link
                  href={`/${locale}/doctors/${doctor.id}`}
                  className="px-4 py-1.5 bg-[#0070CD] hover:bg-[#005FB0] text-white text-[12px] font-bold rounded-lg transition-all"
                >
                  {t('book')}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
