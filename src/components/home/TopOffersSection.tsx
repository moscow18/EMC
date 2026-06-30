'use client';

import { useTranslations } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useAnimations';
import { motion } from 'framer-motion';
import { ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

const offers = [
  {
    id: 'offer1',
    titleKey: 'offer1_title',
    descKey: 'offer1_desc',
    discount: 30,
    originalPrice: 800,
    salePrice: 560,
    image: '/offer_dental.png',
  },
  {
    id: 'offer2',
    titleKey: 'offer2_title',
    descKey: 'offer2_desc',
    discount: 40,
    originalPrice: 500,
    salePrice: 300,
    image: '/offer_checkup.png',
  },
  {
    id: 'offer3',
    titleKey: 'offer3_title',
    descKey: 'offer3_desc',
    discount: 25,
    originalPrice: 1200,
    salePrice: 900,
    image: '/offer_checkup.png',
  },
  {
    id: 'offer4',
    titleKey: 'offer4_title',
    descKey: 'offer4_desc',
    discount: 35,
    originalPrice: 600,
    salePrice: 390,
    image: '/offer_checkup.png',
  },
];

export default function TopOffersSection() {
  const t = useTranslations('Offers');
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section ref={ref} className="section-padding bg-[#F4F6F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
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
            href="#"
            className="text-[#0070CD] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all shrink-0"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </motion.div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 25 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="vez-offer-card group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-[160px] overflow-hidden">
                <img
                  src={offer.image}
                  alt={t(offer.titleKey)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Discount Badge */}
                <div className="vez-discount-badge">
                  {offer.discount}% {t('off')}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-[14px] text-[#1A1A2E] mb-1 group-hover:text-[#0070CD] transition-colors">
                  {t(offer.titleKey)}
                </h3>
                <p className="text-[12px] text-gray-500 mb-3 line-clamp-2">
                  {t(offer.descKey)}
                </p>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#EF0F0F] font-bold text-lg">{offer.salePrice} EGP</span>
                  <span className="text-gray-400 text-sm line-through">{offer.originalPrice} EGP</span>
                </div>

                {/* Book button */}
                <button className="w-full py-2.5 bg-[#0070CD] hover:bg-[#005FB0] text-white font-bold text-[13px] rounded-lg transition-all flex items-center justify-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {t('book')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
