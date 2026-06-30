'use client';

import { useTranslations } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useAnimations';
import { motion } from 'framer-motion';
import { Star, CheckCircle, Quote } from 'lucide-react';

const reviews = [
  {
    id: 'review1',
    nameKey: 'review1_name',
    textKey: 'review1_text',
    specialtyKey: 'review1_specialty',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: 'review2',
    nameKey: 'review2_name',
    textKey: 'review2_text',
    specialtyKey: 'review2_specialty',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
  },
  {
    id: 'review3',
    nameKey: 'review3_name',
    textKey: 'review3_text',
    specialtyKey: 'review3_specialty',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop',
  },
];

export default function ReviewsSection() {
  const t = useTranslations('Reviews');
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="section-padding bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 25 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-[#0070CD]/15 transition-all duration-300 relative group"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 end-4">
                <Quote className="w-8 h-8 text-[#0070CD]/10 group-hover:text-[#0070CD]/20 transition-colors" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(review.rating)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 text-[#FFB300] fill-[#FFB300]" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-600 text-[14px] leading-relaxed mb-6 min-h-[80px]">
                &ldquo;{t(review.textKey)}&rdquo;
              </p>

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <img
                  src={review.avatar}
                  alt={t(review.nameKey)}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#0070CD]/10"
                />
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A2E]">{t(review.nameKey)}</h4>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-[#10B981]" />
                    <span className="text-[11px] text-[#10B981] font-medium">{t('verified')}</span>
                    <span className="text-gray-300 text-[10px]">•</span>
                    <span className="text-[11px] text-gray-400">{t(review.specialtyKey)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
