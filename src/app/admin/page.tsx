'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Users, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Plus, ArrowLeftRight, ArrowUpRight, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalDoctors: number;
  totalAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
}

interface RecentAppointment {
  id: string;
  patient_name: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
  created_at: string;
  doctors?: {
    name: string;
    name_ar?: string;
  };
}

interface RecentMessage {
  id: string;
  name: string;
  subject?: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalDoctors: 0, totalAppointments: 0, pendingAppointments: 0, todayAppointments: 0 });
  const [recent, setRecent] = useState<RecentAppointment[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeGreeting, setTimeGreeting] = useState('');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [doctors, appointments, pending, todayAppts, recentData, messagesData] = await Promise.all([
        supabase.from('doctors').select('id', { count: 'exact' }),
        supabase.from('appointments').select('id', { count: 'exact' }),
        supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('appointments').select('id', { count: 'exact' }).eq('appointment_date', today),
        supabase.from('appointments').select('*, doctors(name, name_ar)').order('created_at', { ascending: false }).limit(5),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(4),
      ]);

      setStats({
        totalDoctors: doctors.count || 0,
        totalAppointments: appointments.count || 0,
        pendingAppointments: pending.count || 0,
        todayAppointments: todayAppts.count || 0,
      });

      if (recentData.data) setRecent(recentData.data);
      if (messagesData.data) setRecentMessages(messagesData.data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load language preference
    const storedLang = localStorage.getItem('emc_admin_lang') as 'ar' | 'en';
    if (storedLang) setLang(storedLang);

    loadDashboardData();

    // Determine greeting based on local time and language
    const hr = new Date().getHours();
    const isAr = (storedLang || 'ar') === 'ar';
    if (hr < 12) {
      setTimeGreeting(isAr ? 'صباح الخير' : 'Good Morning');
    } else {
      setTimeGreeting(isAr ? 'مساء الخير' : 'Good Evening');
    }

    // Live sync for updates
    const channelAppts = supabase
      .channel('admin_dashboard_appts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        loadDashboardData();
      })
      .subscribe();

    const channelContacts = supabase
      .channel('admin_dashboard_contacts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        loadDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelAppts);
      supabase.removeChannel(channelContacts);
    };
  }, []);

  const t = {
    ar: {
      morningGreeting: 'صباح الخير',
      eveningGreeting: 'مساء الخير',
      onlineStatus: 'متصل الآن',
      portalTitle: 'الاستقبال - عيادة EMC',
      loadingText: 'جاري تحميل لوحة التحكم الفورية...',
      manualBookBtn: 'تسجيل حجز يدوي',
      messagesInboxBtn: 'صندوق الرسائل الواردة',
      todayAppts: 'حجوزات اليوم',
      doctorsCount: 'طاقم الأطباء',
      totalAppts: 'إجمالي الحجوزات',
      pendingAppts: 'قيد الانتظار',
      liveBadge: 'فوري',
      recentApptsTitle: 'أحدث طلبات الحجز',
      recentApptsSub: 'آخر 5 حجوزات تم تسجيلها فورياً على النظام',
      allBookingsLink: 'كل الحجوزات',
      thPatient: 'المريض',
      thPhone: 'رقم الهاتف',
      thDoctor: 'الطبيب',
      thDateTime: 'التاريخ والوقت',
      thStatus: 'الحالة',
      noBookings: 'لا توجد حجوزات مسجلة بعد',
      liveSyncNote: 'يتطابق النظام مع قنوات Supabase البث المباشر الفوري',
      recentMessagesTitle: 'آخر رسائل التواصل',
      recentMessagesSub: 'استفسارات وشكاوى المرضى الواردة حديثاً',
      viewAllLink: 'عرض الكل',
      noMessages: 'لا توجد رسائل واردة بعد',
      msgBadgeNew: 'جديد',
      msgActionLink: 'معاينة الرسالة ←',
      dailyStatTitle: 'احصائية العمل اليومية',
      dailyStatSub: 'تأكد من متابعة الحجوزات والرد على جميع رسائل المرضى بانتظام لضمان جودة الخدمة.',
      notAssigned: 'غير معين',
      confirmed: 'مؤكد',
      pending: 'قيد الانتظار',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    },
    en: {
      morningGreeting: 'Good Morning',
      eveningGreeting: 'Good Evening',
      onlineStatus: 'Online Now',
      portalTitle: 'Receptionist - EMC Clinic',
      loadingText: 'Loading real-time dashboard...',
      manualBookBtn: 'Register Manual Booking',
      messagesInboxBtn: 'Inbox Messages',
      todayAppts: "Today's Bookings",
      doctorsCount: 'Active Doctors',
      totalAppts: 'Total Bookings',
      pendingAppts: 'Pending Bookings',
      liveBadge: 'Live',
      recentApptsTitle: 'Recent Bookings',
      recentApptsSub: 'Latest 5 appointments recorded on the system',
      allBookingsLink: 'View All',
      thPatient: 'Patient',
      thPhone: 'Phone',
      thDoctor: 'Doctor',
      thDateTime: 'Date & Time',
      thStatus: 'Status',
      noBookings: 'No appointments registered yet',
      liveSyncNote: 'System matches real-time Supabase postgres live channels',
      recentMessagesTitle: 'Latest Messages',
      recentMessagesSub: 'Inquiries and complaints received from patients recently',
      viewAllLink: 'View All',
      noMessages: 'No messages received yet',
      msgBadgeNew: 'New',
      msgActionLink: 'View Message ←',
      dailyStatTitle: 'Daily Work Checklist',
      dailyStatSub: 'Ensure to track bookings and reply to all patient queries to maintain quality.',
      notAssigned: 'Unassigned',
      confirmed: 'Confirmed',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
  }[lang];

  const statCards = [
    { label: t.todayAppts, value: stats.todayAppointments, icon: Calendar, color: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-50/70', shadow: 'shadow-blue-500/10' },
    { label: t.doctorsCount, value: stats.totalDoctors, icon: Users, color: 'bg-indigo-600', text: 'text-indigo-600', bgLight: 'bg-indigo-50/70', shadow: 'shadow-indigo-500/10' },
    { label: t.totalAppts, value: stats.totalAppointments, icon: CheckCircle, color: 'bg-emerald-600', text: 'text-emerald-600', bgLight: 'bg-emerald-50/70', shadow: 'shadow-emerald-500/10' },
    { label: t.pendingAppts, value: stats.pendingAppointments, icon: Clock, color: 'bg-amber-600', text: 'text-amber-600', bgLight: 'bg-amber-50/70', shadow: 'shadow-amber-500/10' },
  ];

  const statusMap: Record<string, { label: string; style: string }> = {
    pending: { label: t.pending, style: 'bg-amber-50 text-amber-700 border-amber-100' },
    confirmed: { label: t.confirmed, style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    completed: { label: t.completed, style: 'bg-blue-50 text-blue-700 border-blue-100' },
    cancelled: { label: t.cancelled, style: 'bg-rose-50 text-rose-700 border-rose-100' },
  };

  const formattedDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        {/* Triple-action loader */}
        <div className="w-16 h-16 relative">
          <div className="w-16 h-16 rounded-full border-4 border-blue-50 border-t-primary animate-spin absolute" />
          <div className="w-12 h-12 rounded-full border-4 border-dashed border-primary/25 animate-spin absolute top-2 left-2" style={{ animationDirection: 'reverse' }} />
          <div className="w-6 h-6 bg-primary/10 rounded-full absolute top-5 left-5 animate-ping" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-base font-black text-gray-900 tracking-tight">{t.loadingText}</h4>
          <p className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">
            {lang === 'ar' ? 'الرجاء الانتظار قليلاً...' : 'Please wait a moment...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. Header Greeting Section */}
      <div className="relative overflow-hidden bg-gradient-to-l from-primary/10 via-primary/[0.02] to-transparent p-6 sm:p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all">
        <div className="space-y-2 text-start">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-500">{timeGreeting}، {t.onlineStatus}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{t.portalTitle}</h2>
          <p className="text-sm text-gray-500 font-medium">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link href="/admin/appointments" className="flex items-center gap-1.5 px-5 py-3 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg shadow-primary/15 transition-all">
            <Plus className="w-4 h-4" />
            <span>{t.manualBookBtn}</span>
          </Link>
          <Link href="/admin/messages" className="flex items-center gap-1.5 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold border border-gray-200 rounded-2xl text-xs sm:text-sm shadow-sm transition-all">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span>{t.messagesInboxBtn}</span>
          </Link>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 text-start">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${card.bgLight} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${card.text}`} />
                </div>
                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-lg">{t.liveBadge}</span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{card.value}</p>
              <p className="text-gray-500 text-sm font-bold mt-1.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* 3. Main Dashboard Contents */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Bookings list */}
        <div className="xl:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="space-y-0.5 text-start">
                <h3 className="text-lg font-black text-gray-900">{t.recentApptsTitle}</h3>
                <p className="text-xs text-gray-400 font-medium">{t.recentApptsSub}</p>
              </div>
              <Link href="/admin/appointments" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
                <span>{t.allBookingsLink}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <th className="px-6 py-4">{t.thPatient}</th>
                    <th className="px-6 py-4">{t.thPhone}</th>
                    <th className="px-6 py-4">{t.thDoctor}</th>
                    <th className="px-6 py-4">{t.thDateTime}</th>
                    <th className="px-6 py-4 text-center">{t.thStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-450 font-medium">{t.noBookings}</td>
                    </tr>
                  ) : (
                    recent.map((appt) => {
                      const stat = statusMap[appt.status] || { label: appt.status, style: 'bg-gray-100 text-gray-600' };
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50/40 transition-colors text-sm">
                          <td className="px-6 py-4.5 font-bold text-gray-900">{appt.patient_name}</td>
                          <td className="px-6 py-4 text-gray-650 font-semibold">{appt.phone}</td>
                          <td className="px-6 py-4 text-gray-800">
                            {appt.doctors ? (
                              appt.doctors.name_ar || appt.doctors.name
                            ) : appt.notes ? (
                              appt.notes
                            ) : (
                              <span className="text-xs text-gray-400 font-bold">{t.notAssigned}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-750">
                            <span className="block font-medium">{appt.appointment_date}</span>
                            <span className="text-xs text-gray-400 font-semibold">{appt.appointment_time}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${stat.style}`}>
                              {stat.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-gray-50/70 border-t border-gray-100 text-center">
            <span className="text-xs font-bold text-gray-500">{t.liveSyncNote}</span>
          </div>
        </div>

        {/* Right Column: Latest Contact messages / Queries */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-gray-100 pb-4.5 text-start flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">{t.recentMessagesTitle}</h3>
                <p className="text-xs text-gray-450 font-medium">{t.recentMessagesSub}</p>
              </div>
              <Link href="/admin/messages" className="text-xs font-extrabold text-primary hover:underline">
                {t.viewAllLink}
              </Link>
            </div>

            <div className="space-y-4.5 pt-4">
              {recentMessages.length === 0 ? (
                <div className="py-12 text-center text-gray-450 font-medium text-sm">{t.noMessages}</div>
              ) : (
                recentMessages.map((msg) => (
                  <div key={msg.id} className={`p-4 rounded-2xl border transition-all text-start ${msg.is_read ? 'bg-white border-gray-100' : 'bg-primary/[0.01] border-primary/20 shadow-sm'}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-bold text-gray-800">{msg.name}</span>
                      {!msg.is_read && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-black">{t.msgBadgeNew}</span>
                      )}
                    </div>
                    {msg.subject && <p className="text-xs font-bold text-gray-700 mb-1">{msg.subject}</p>}
                    <p className="text-xs text-gray-550 line-clamp-2 leading-relaxed mb-2.5">{msg.message}</p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-gray-55/40">
                      <span>{new Date(msg.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                      <span>{t.msgActionLink}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-4 mt-4 text-start flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-xs font-black text-primary block">{t.dailyStatTitle}</span>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{t.dailyStatSub}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
