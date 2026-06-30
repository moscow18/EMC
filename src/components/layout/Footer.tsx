'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, ArrowUp } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  const tSpec = useTranslations('Specialties');
  const locale = useLocale();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const quickLinks = [
    { href: '#', label: t('links.home') },
    { href: '#', label: t('links.about') },
    { href: '#doctors', label: t('links.doctors') },
    { href: '#contact', label: t('links.contact') },
    { href: '#', label: t('links.careers') },
    { href: '#', label: t('links.blog') },
  ];

  const specialties = ['cardiology', 'dentistry', 'dermatology', 'pediatrics', 'orthopedics', 'ent'];

  const helpLinks = [
    { href: '#', label: t('help_faq') },
    { href: '#', label: t('help_terms') },
    { href: '#', label: t('help_privacy') },
    { href: '#', label: t('help_contact') },
  ];

  return (
    <footer className="bg-[#1A1A2E] text-white">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
          
          {/* Brand + About */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/emc-logo.jpg"
                alt="EMC Logo"
                width={42}
                height={42}
                className="object-contain rounded-lg"
              />
              <div>
                <h3 className="text-xl font-extrabold tracking-tight">EMC</h3>
                <p className="text-[11px] text-gray-400 -mt-0.5">{t('brandSubtitle')}</p>
              </div>
            </div>
            <p className="text-gray-400 text-[13px] leading-relaxed mb-5 max-w-sm">
              {t('aboutText')}
            </p>

            {/* Social Media */}
            <div className="flex gap-2.5">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#1877F2] flex items-center justify-center transition-all duration-300" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-gradient-to-br hover:from-[#f09433] hover:to-[#dc2743] flex items-center justify-center transition-all duration-300" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#1DA1F2] flex items-center justify-center transition-all duration-300" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#FF0000] flex items-center justify-center transition-all duration-300" aria-label="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[15px] mb-5 text-white">{t('aboutEMC')}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((item, idx) => (
                <li key={idx}>
                  <Link href={`/${locale}${item.href}`} className="text-gray-400 hover:text-[#0070CD] transition-colors text-[13px] font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Search By Specialty */}
          <div>
            <h4 className="font-bold text-[15px] mb-5 text-white">{t('topSpecialties')}</h4>
            <ul className="space-y-2.5">
              {specialties.map((spec) => (
                <li key={spec}>
                  <Link href={`/${locale}#specialties`} className="text-gray-400 hover:text-[#0070CD] transition-colors text-[13px] font-medium">
                    {tSpec(spec)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-[15px] mb-5 text-white">{t('help')}</h4>
            <ul className="space-y-2.5">
              {helpLinks.map((item, idx) => (
                <li key={idx}>
                  <Link href={`/${locale}${item.href}`} className="text-gray-400 hover:text-[#0070CD] transition-colors text-[13px] font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact info small */}
            <div className="mt-6 space-y-2">
              <a href="https://maps.google.com/?q=Egypt+Medical+Clinic,+Heliopolis,+Cairo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white text-[12px]">
                <MapPin className="w-3.5 h-3.5 text-gray-500" />
                {locale === 'ar' ? 'مصر الجديدة، القاهرة' : 'Heliopolis, Cairo, Egypt'}
              </a>
              <a href="tel:19999" className="flex items-center gap-2 text-gray-400 hover:text-white text-[12px]">
                <Phone className="w-3.5 h-3.5 text-gray-500" />
                19999
              </a>
              <a href="mailto:emc.egypt12@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-white text-[12px]">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                emc.egypt12@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-[12px]">
            © {new Date().getFullYear()} EMC. {t('rights')}
          </p>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}#`} className="text-gray-500 hover:text-white text-[12px] transition-colors">{t('help_terms')}</Link>
            <Link href={`/${locale}#`} className="text-gray-500 hover:text-white text-[12px] transition-colors">{t('help_privacy')}</Link>
            <button onClick={scrollToTop} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#0070CD] flex items-center justify-center transition-all" aria-label="Scroll to top">
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
