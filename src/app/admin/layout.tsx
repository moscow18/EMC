'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Users, Calendar, Tag, LogOut, Menu, X, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { playNotificationSound } from '@/lib/audio';
import { ToastProvider } from '@/components/ui/Toast';
import '../globals.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [notification, setNotification] = useState<{ visible: boolean; text: string } | null>(null);

  // Sync language selection from LocalStorage
  const syncLang = () => {
    const storedLang = localStorage.getItem('emc_admin_lang') as 'ar' | 'en';
    if (storedLang) {
      setLang(storedLang);
    }
  };

  useEffect(() => {
    syncLang();
    
    // Periodically sync language changes if user modifies in settings page
    const interval = setInterval(syncLang, 1000);
    return () => clearInterval(interval);
  }, []);

  const translations = {
    ar: {
      panelTitle: 'الاستقبال',
      dashboard: 'الرئيسية',
      doctors: 'الأطباء',
      appointments: 'مواعيد الحجوزات',
      offers: 'العروض الترويجية',
      messages: 'رسائل المرضى',
      profile: 'الإعدادات والملف الشخصي',
      logout: 'تسجيل الخروج',
      viewSite: 'معاينة الموقع ←',
      newNotif: 'إشعار جديد',
      incomingMsg: 'رسالة جديدة من المريض',
      newBooking: 'حجز جديد باسم المريض',
    },
    en: {
      panelTitle: 'Receptionist',
      dashboard: 'Dashboard',
      doctors: 'Doctors',
      appointments: 'Appointments',
      offers: 'Special Offers',
      messages: 'Patient Messages',
      profile: 'Settings & Profile',
      logout: 'Logout',
      viewSite: 'View Site →',
      newNotif: 'New Notification',
      incomingMsg: 'New message from patient',
      newBooking: 'New booking by patient',
    }
  };

  const t = translations[lang];

  const sidebarLinks = [
    { name: t.dashboard, href: '/admin', icon: LayoutDashboard },
    { name: t.doctors, href: '/admin/doctors', icon: Users },
    { name: t.appointments, href: '/admin/appointments', icon: Calendar },
    { name: t.offers, href: '/admin/offers', icon: Tag },
    { name: t.messages, href: '/admin/messages', icon: MessageSquare },
    { name: t.profile, href: '/admin/profile', icon: User },
  ];

  // Play chime based on user selections
  const playChime = () => {
    const isSoundEnabled = localStorage.getItem('emc_notifications_sound_enabled') !== 'false';
    if (!isSoundEnabled) return;
    const soundType = localStorage.getItem('emc_notification_sound') || 'double_beep';
    const volume = Number(localStorage.getItem('emc_notifications_volume') || '0.5');
    playNotificationSound(soundType, volume);
  };

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthenticated(false);
      return;
    }

    // 1. Check local session
    const localSession = localStorage.getItem('emc_admin_session');
    if (localSession) {
      setAuthenticated(true);
      return;
    }

    // 2. Check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setAuthenticated(true);
      }
    });
  }, [router, pathname]);

  // Supabase Realtime Listener
  useEffect(() => {
    // 1. Listen for new messages
    const channelContacts = supabase
      .channel('public:contacts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts' }, (payload) => {
        playChime();
        setNotification({
          visible: true,
          text: `${t.incomingMsg}: ${payload.new.name}`
        });
        setTimeout(() => setNotification(null), 6000);
      })
      .subscribe();

    // 2. Listen for new appointments
    const channelAppointments = supabase
      .channel('public:appointments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        playChime();
        setNotification({
          visible: true,
          text: `${t.newBooking}: ${payload.new.patient_name}`
        });
        setTimeout(() => setNotification(null), 6000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelContacts);
      supabase.removeChannel(channelAppointments);
    };
  }, [lang]);

  const handleLogout = async () => {
    localStorage.removeItem('emc_admin_session');
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const wrapRoot = (content: React.ReactNode) => (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className="antialiased bg-gray-50 min-h-screen text-start">
        <ToastProvider>
          {content}
        </ToastProvider>
      </body>
    </html>
  );

  // Login page - no layout
  if (pathname === '/admin/login') {
    return wrapRoot(<>{children}</>);
  }

  if (authenticated === null) {
    return wrapRoot(
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100/50 p-6 relative">
        {/* Glowing grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        <div className="relative flex flex-col items-center max-w-sm w-full text-center space-y-6">
          {/* Triple-action loader */}
          <div className="w-16 h-16 relative">
            <div className="w-16 h-16 rounded-full border-4 border-blue-50 border-t-primary animate-spin absolute" />
            <div className="w-12 h-12 rounded-full border-4 border-dashed border-primary/25 animate-spin absolute top-2 left-2" style={{ animationDirection: 'reverse' }} />
            <div className="w-6 h-6 bg-primary/10 rounded-full absolute top-5 left-5 animate-ping" />
          </div>
          
          <div className="space-y-1.5">
            <h4 className="text-base font-black text-gray-900 tracking-tight">
              {lang === 'ar' ? 'جاري تحضير واجهة الاستقبال' : 'Preparing Receptionist Interface'}
            </h4>
            <p className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">
              {lang === 'ar' ? 'عيادة EMC - رعاية طبية متكاملة' : 'EMC Clinic - Integrated Care'}
            </p>
          </div>
          
          {/* Progress loader */}
          <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden relative">
            <div className="h-full bg-primary rounded-full w-1/2 absolute left-0 top-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-primary via-blue-400 to-primary" style={{
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return wrapRoot(
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-50 w-72 bg-white border-e border-gray-200 text-gray-700 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-3">
                <Image src="/emc-logo.jpg" alt="EMC Logo" width={38} height={38} className="rounded-lg object-contain" />
                <div>
                  <span className="font-bold text-lg text-gray-900">EMC</span>
                  <p className="text-xs text-gray-500 -mt-0.5">{t.panelTitle}</p>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-55 transition-all w-full text-start"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {sidebarLinks.find(l => l.href === pathname)?.name || t.dashboard}
          </h1>
          <Link href="/" className="text-sm text-primary hover:underline">
            {t.viewSite}
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 relative">
          {children}
        </main>

        {/* Realtime Notification Banner */}
        {notification?.visible && (
          <div className={`fixed top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-50 max-w-sm w-full bg-white border border-primary/20 shadow-2xl rounded-2xl p-4 flex items-start gap-3 border-s-4 border-s-primary animate-in fade-in duration-300`}>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-400">{t.newNotif}</h4>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{notification.text}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
