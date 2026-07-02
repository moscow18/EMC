'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, User, Phone, LogOut, LayoutDashboard } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const t = useTranslations('Navbar');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const pathname = usePathname();

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch session & auth state changes
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  };

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    window.location.href = newPath;
  };

  const navLinks = [
    { name: t('home'), href: '/' },
    { name: t('specialties'), href: '/#specialties' },
    { name: t('doctors'), href: '/#doctors' },
    { name: t('services'), href: '/#services' },
    { name: t('contact'), href: '/#contact' },
  ];

  return (
    <nav className={`fixed top-0 start-0 end-0 z-50 w-full transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md border-b border-gray-100' : 'bg-white/95 backdrop-blur-md border-b border-gray-100/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Nav links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <Image src="/emc-logo.jpg" alt="EMC Clinic" width={38} height={38} className="object-contain rounded-lg" priority />
              <div className="flex flex-col text-start">
                <span className="font-extrabold text-base leading-none text-[#1A1A2E] tracking-tight">EMC</span>
                <span className="text-[8px] font-semibold tracking-wider uppercase text-gray-400 leading-tight">
                  {isAr ? 'عيادة مصر الطبية' : 'Medical Clinic'}
                </span>
              </div>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-3.5 py-2 text-[13px] font-bold text-gray-600 hover:text-[#0062FF] transition-colors rounded-lg hover:bg-[#F0F6FF]"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Phone Number */}
            <a href="tel:01044437797" className="hidden sm:flex items-center gap-1 text-[#0062FF] font-extrabold text-[13px] hover:underline">
              <Phone className="w-3.5 h-3.5" />
              <span>01044437797</span>
            </a>

            <div className="hidden sm:block w-px h-4 bg-gray-200" />

            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[13px] font-bold text-gray-600 hover:text-[#0062FF] transition-colors rounded-lg hover:bg-[#F0F6FF]"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-xs">{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Dynamic Auth Section */}
            {!loading && user ? (
              <div className="hidden lg:flex items-center gap-1.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-bold text-gray-700 hover:text-[#0062FF] transition-colors rounded-lg border border-gray-200 hover:bg-[#F0F6FF]"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{isAr ? 'الملف الشخصي' : 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-bold text-red-600 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isAr ? 'خروج' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-bold text-gray-600 hover:text-[#0062FF] transition-colors rounded-lg border border-gray-200 hover:border-[#0062FF]/30 hover:bg-[#F0F6FF]"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('login')}</span>
              </Link>
            )}

            {/* Book Now CTA */}
            <Link
              href="/doctors"
              className="hidden lg:inline-block px-4.5 py-2 bg-[#0062FF] hover:bg-[#004BCA] text-white rounded-lg text-[13px] font-extrabold transition-all hover:shadow-lg hover:shadow-[#0062FF]/20"
            >
              {t('bookNow')}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden bg-white border-t border-gray-100 shadow-xl transition-all duration-300 overflow-y-auto ${
        isOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      }`}>
        <div className="px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-base font-semibold text-gray-700 hover:text-[#0062FF] hover:bg-[#F0F6FF] px-4 py-3 rounded-lg transition-colors text-start"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="h-px bg-gray-100 my-2" />
          
          <a href="tel:01044437797" className="flex items-center gap-2 px-4 py-3 text-[#0062FF] font-bold">
            <Phone className="w-5 h-5" />
            <span>01044437797</span>
          </a>

          {/* Mobile Dynamic Auth */}
          {!loading && user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-900 rounded-lg font-semibold"
              >
                <LayoutDashboard className="w-5 h-5 text-gray-500" />
                {isAr ? 'الملف الشخصي للمريض' : 'Profile'}
              </Link>
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold text-start w-full"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                {isAr ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-900 rounded-lg font-semibold"
            >
              <User className="w-5 h-5 text-gray-500" />
              {t('login')}
            </Link>
          )}

          <Link
            href="/doctors"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0062FF] text-white rounded-lg font-bold text-center mt-2"
          >
            {t('bookNow')}
          </Link>

          <button
            onClick={toggleLocale}
            className="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 font-semibold border border-gray-200 rounded-lg mt-2"
          >
            <Globe className="w-5 h-5" />
            {locale === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      </div>
    </nav>
  );
}
