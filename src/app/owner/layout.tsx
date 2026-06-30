'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, LogOut, Wallet, Receipt, PlusCircle, ArrowLeft, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { playNotificationSound } from '@/lib/audio';
import { ToastProvider } from '@/components/ui/Toast';
import '../globals.css'; // import css stylesheet

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  // Realtime notification state
  const [notification, setNotification] = useState<{ visible: boolean; text: string } | null>(null);

  // Play chime based on user settings
  const playChime = () => {
    const isSoundEnabled = localStorage.getItem('emc_notifications_sound_enabled') !== 'false';
    if (!isSoundEnabled) return;
    const soundType = localStorage.getItem('emc_notification_sound') || 'double_beep';
    const volume = Number(localStorage.getItem('emc_notifications_volume') || '0.5');
    playNotificationSound(soundType, volume);
  };

  // Real-time listener for Owner
  useEffect(() => {
    if (pathname === '/owner/login' || !authenticated) return;

    // 1. Listen for new messages
    const channelContacts = supabase
      .channel('owner:contacts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts' }, (payload) => {
        playChime();
        setNotification({
          visible: true,
          text: `رسالة جديدة من المريض: ${payload.new.name}`
        });
        setTimeout(() => setNotification(null), 6000);
      })
      .subscribe();

    // 2. Listen for new appointments
    const channelAppointments = supabase
      .channel('owner:appointments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments' }, (payload) => {
        playChime();
        setNotification({
          visible: true,
          text: `حجز جديد باسم المريض: ${payload.new.patient_name}`
        });
        setTimeout(() => setNotification(null), 6000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelContacts);
      supabase.removeChannel(channelAppointments);
    };
  }, [pathname, authenticated]);

  useEffect(() => {
    if (pathname === '/owner/login') {
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    // 1. Check local session fallback
    const localSession = sessionStorage.getItem('emc_owner_session');
    if (localSession) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/owner/login');
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !sessionStorage.getItem('emc_owner_session') && pathname !== '/owner/login') {
        router.push('/owner/login');
        setAuthenticated(false);
      } else if (session) {
        setAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  const handleLogout = async () => {
    sessionStorage.removeItem('emc_owner_session');
    await supabase.auth.signOut();
    router.push('/owner/login');
  };

  const wrapRoot = (content: React.ReactNode) => (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-[#F8F9FA] text-[#1A1A2E] min-h-screen">
        <ToastProvider>
          {content}
        </ToastProvider>
      </body>
    </html>
  );

  if (pathname === '/owner/login') {
    return wrapRoot(<>{children}</>);
  }

  if (loading) {
    return wrapRoot(
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-3">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">جاري التحقق من صلاحيات المالك...</p>
      </div>
    );
  }

  if (!authenticated) return null;

  return wrapRoot(
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image src="/emc-logo.jpg" alt="EMC Logo" width={36} height={36} className="rounded-lg object-contain" />
          <div>
            <h1 className="text-base font-bold text-[#1A1A2E]">لوحة تحكم المدير المالي</h1>
            <p className="text-[10px] text-gray-500">إدارة الأرباح والتدفقات النقدية</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>عرض موقع العيادة</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-xs font-bold text-red-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* Main page content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Realtime Notification Banner */}
      {notification?.visible && (
        <div className="fixed top-4 left-4 z-50 max-w-sm w-full bg-white border border-primary/20 shadow-2xl rounded-2xl p-4 flex items-start gap-3 border-r-4 border-r-primary animate-in fade-in slide-in-from-top-4 duration-300 text-right font-sans" dir="rtl">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 text-right">
            <h4 className="text-[10px] font-bold text-gray-400">إشعار جديد</h4>
            <p className="text-xs font-semibold text-gray-800 mt-0.5">{notification.text}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
