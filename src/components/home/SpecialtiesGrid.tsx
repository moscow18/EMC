'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useAnimations';
import { motion } from 'framer-motion';
import { Heart, Smile, Bone, Ear, Baby, Brain, Eye, Stethoscope, Syringe, Ribbon, Activity, ShieldPlus, Wind, Pill, Scissors, Sparkles, PersonStanding, Apple, Droplets } from 'lucide-react';
import Link from 'next/link';

const specialties = [
  { id: 'cardiology', icon: Heart, color: '#EF4444', bg: '#FEE2E2' },
  { id: 'internal', icon: Stethoscope, color: '#0EA5E9', bg: '#E0F2FE' },
  { id: 'orthopedics', icon: Bone, color: '#10B981', bg: '#D1FAE5' },
  { id: 'pediatrics', icon: Baby, color: '#F59E0B', bg: '#FEF3C7' },
  { id: 'gynecology', icon: ShieldPlus, color: '#F472B6', bg: '#FCE7F3' },
  { id: 'ent', icon: Ear, color: '#8B5CF6', bg: '#EDE9FE' },
  { id: 'dermatology', icon: Ribbon, color: '#EC4899', bg: '#FCE7F3' },
  { id: 'urology', icon: Activity, color: '#F97316', bg: '#FFEDD5' },
  { id: 'neurology', icon: Brain, color: '#6366F1', bg: '#E0E7FF' },
  { id: 'gastro', icon: Pill, color: '#059669', bg: '#D1FAE5' },
  { id: 'chest', icon: Wind, color: '#0284C7', bg: '#E0F2FE' },
  { id: 'dentistry', icon: Smile, color: '#0062FF', bg: '#F0F6FF' },
  { id: 'ophthalmology', icon: Eye, color: '#14B8A6', bg: '#CCFBF1' },
  { id: 'psychiatry', icon: Syringe, color: '#A855F7', bg: '#F3E8FF' },
  { id: 'diabetes', icon: Droplets, color: '#DC2626', bg: '#FEE2E2' }, // fallback for missing lucide icon
  { id: 'general_surgery', icon: Scissors, color: '#475569', bg: '#F1F5F9' },
  { id: 'plastic_surgery', icon: Sparkles, color: '#D946EF', bg: '#FAE8FF' },
  { id: 'physiotherapy', icon: PersonStanding, color: '#16A34A', bg: '#DCFCE7' },
  { id: 'nephrology', icon: Activity, color: '#B45309', bg: '#FEF3C7' },
  { id: 'nutrition', icon: Apple, color: '#65A30D', bg: '#ECFCCB' },
];

const doctorCounts: Record<string, number> = {
  cardiology: 1, internal: 2, orthopedics: 1, pediatrics: 1,
  gynecology: 1, ent: 1, dermatology: 1, urology: 1,
  neurology: 1, gastro: 1, chest: 1, dentistry: 0,
  ophthalmology: 0, psychiatry: 0, diabetes: 0, general_surgery: 0,
  plastic_surgery: 0, physiotherapy: 0, nephrology: 0, nutrition: 0,
};

export default function SpecialtiesGrid() {
  const t = useTranslations('Specialties');
  const locale = useLocale();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="specialties" ref={ref} className="section-padding bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="section-title text-[#0F172A]">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </motion.div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-6 sm:gap-8">
          {specialties.map((spec, i) => {
            const Icon = spec.icon;
            return (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/${locale}/doctors?specialty=${spec.id}`}
                  className="vez-specialty-item group cursor-pointer flex flex-col items-center justify-center"
                >
                  <div
                    className="vez-specialty-icon group-hover:shadow-lg transition-all duration-300"
                    style={{ backgroundColor: spec.bg }}
                  >
                    {typeof Icon === 'function' ? (
                      <Icon className="w-7 h-7" style={{ color: spec.color }} />
                    ) : (
                      <Activity className="w-7 h-7" style={{ color: spec.color }} />
                    )}
                  </div>
                  <p className="vez-specialty-name group-hover:text-[#0070CD] transition-colors text-center font-bold text-sm text-gray-700 mt-2">
                    {t(spec.id)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 font-medium text-center">
                    {t('doctorsAvailable', { count: doctorCounts[spec.id] })}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
