'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, AlertCircle, Clock, Loader2, Search, Calendar, User, Plus, X } from 'lucide-react';

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email?: string;
  appointment_date: string;
  appointment_time: string;
  message?: string;
  status: string;
  created_at: string;
  doctor_id?: string;
  notes?: string;
  doctors?: {
    id: string;
    name: string;
    name_ar?: string;
  };
  departments?: {
    id: string;
    name: string;
    name_ar?: string;
  };
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  // Manual booking modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({
    patient_name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    let query = supabase
      .from('appointments')
      .select('*, doctors(id, name, name_ar), departments(id, name, name_ar)')
      .order('created_at', { ascending: false });
    
    if (filter !== 'all') query = query.eq('status', filter);
    
    const { data, error } = await query;
    if (error) console.error('Appointments query error:', error);
    if (data) setAppointments(data);
    setLoading(false);
  };

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, name, name_ar, specialty, department_id, schedule, departments(name, name_ar)')
      .eq('is_active', true);
    if (error) console.error('Doctors query error:', error);
    if (data) setDoctorsList(data);
  };

  useEffect(() => {
    // Load language preference
    const storedLang = localStorage.getItem('emc_admin_lang') as 'ar' | 'en';
    if (storedLang) setLang(storedLang);

    fetchAppointments();
    fetchDoctors();

    // Listen to real-time changes
    const channel = supabase
      .channel('admin:appointments_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    fetchAppointments();
  };

  const filtered = appointments.filter(a => {
    const name = a.patient_name || '';
    const phone = a.phone || '';
    return name.toLowerCase().includes(search.toLowerCase()) || phone.includes(search);
  });

  const t = {
    ar: {
      confirmBtn: 'تأكيد',
      cancelBtn: 'إلغاء الحجز',
      completeBtn: 'إتمام الكشف',
      patientDetails: 'تفاصيل المريض',
      phone: 'رقم الهاتف',
      doctor: 'الطبيب المعالج',
      date: 'تاريخ الحجز',
      time: 'ساعة الكشف',
      status: 'حالة الحجز',
      actions: 'خيارات التحكم',
      noAppts: 'لم يتم العثور على أي حجوزات تطابق البحث.',
      loadingText: 'جاري تحميل الحجوزات...',
      searchPlaceholder: 'ابحث باسم المريض أو رقم الهاتف...',
      manualBookBtn: 'حجز يدوي جديد (تليفون/عيادة)',
      notAssigned: 'غير معين',
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      modalTitle: 'حجز موعد يدوي جديد',
      modalSub: 'سجل بيانات المريض المتصل هاتفياً أو الحاضر للعيادة، واختر ميعاداً متاحاً للطبيب المعني.',
      doctorSelectLabel: 'اختر الطبيب المعالج *',
      doctorSelectPlaceholder: '-- اختر طبيباً من القائمة --',
      scheduleLabel: 'جدول المواعيد المتاحة للـ 7 أيام القادمة *',
      closedDay: 'العيادة مغلقة في هذا اليوم أو لا يوجد جدول للطبيب.',
      patientNameLabel: 'اسم المريض *',
      patientNamePlaceholder: 'مثال: أحمد عبد الله',
      patientPhoneLabel: 'رقم الهاتف *',
      patientPhonePlaceholder: 'مثال: 01xxxxxxxxx',
      patientEmailLabel: 'البريد الإلكتروني (اختياري)',
      patientNotesLabel: 'تفاصيل / ملاحظات الحجز (اختياري)',
      patientNotesPlaceholder: 'ملاحظات طبية أو شكوى المريض...',
      cancelBtnModal: 'إلغاء',
      submitBtnModal: 'تسجيل وتأكيد الحجز',
      requiredError: 'الاسم ورقم الهاتف حقول مطلوبة.',
      slotError: 'الرجاء تحديد موعد الكشف المتاح.',
      doctorError: 'الرجاء اختيار الدكتور أولاً.',
      complaintLabel: 'تفاصيل الشكوى:',
      all: 'الكل',
    },
    en: {
      confirmBtn: 'Confirm',
      cancelBtn: 'Cancel',
      completeBtn: 'Complete',
      patientDetails: 'Patient Details',
      phone: 'Phone Number',
      doctor: 'Assigned Doctor',
      date: 'Appt Date',
      time: 'Appt Time',
      status: 'Status',
      actions: 'Actions',
      noAppts: 'No appointments found matching filters.',
      loadingText: 'Loading appointments...',
      searchPlaceholder: 'Search patient name or phone...',
      manualBookBtn: 'New Manual Booking',
      notAssigned: 'Unassigned',
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      modalTitle: 'Register New Manual Booking',
      modalSub: 'Enter details of patient booking via phone or in-person, and select an available slot.',
      doctorSelectLabel: 'Select Doctor *',
      doctorSelectPlaceholder: '-- Select Doctor --',
      scheduleLabel: 'Available schedule slots for next 7 days *',
      closedDay: 'Clinic is closed on this day or doctor has no schedule.',
      patientNameLabel: 'Patient Name *',
      patientNamePlaceholder: 'e.g., John Doe',
      patientPhoneLabel: 'Phone Number *',
      patientPhonePlaceholder: 'e.g., 01xxxxxxxxx',
      patientEmailLabel: 'Email Address (Optional)',
      patientNotesLabel: 'Appointment Notes / Complaint (Optional)',
      patientNotesPlaceholder: 'Medical complaints or receptionist notes...',
      cancelBtnModal: 'Cancel',
      submitBtnModal: 'Register Booking',
      requiredError: 'Name and Phone fields are required.',
      slotError: 'Please select an available slot.',
      doctorError: 'Please select a doctor first.',
      complaintLabel: 'Complaint Details:',
      all: 'All',
    }
  }[lang];

  const statusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'completed': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border border-rose-100';
      default: return 'bg-amber-50 text-amber-700 border border-amber-100';
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-rose-600" />;
      default: return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  // Generate 7 days schedule helper
  const getBookingDaysForDoc = (docSchedule: any) => {
    const days = [];
    const daysOfWeekEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const daysOfWeekAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayIndex = d.getDay();
      const dayNameEn = daysOfWeekEn[dayIndex];
      const dayName = daysOfWeekAr[dayIndex];
      
      const isoDate = d.toISOString().split('T')[0];
      
      let slots: string[] = [];
      let isClosed = false;

      if (docSchedule && Object.keys(docSchedule).length > 0) {
        slots = docSchedule[dayNameEn] || [];
        isClosed = slots.length === 0;
      } else {
        isClosed = dayIndex === 5; // Friday closed
        slots = isClosed ? [] : ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '07:00 PM', '08:30 PM'];
      }

      days.push({
        dayName,
        dayNum: d.getDate(),
        monthName: monthsAr[d.getMonth()],
        isoDate,
        isClosed,
        slots
      });
    }
    return days;
  };

  const selectedDoctor = doctorsList.find(d => d.id === selectedDocId);
  const calculatedDays = getBookingDaysForDoc(selectedDoctor?.schedule);
  const currentSelectedDay = calculatedDays[selectedDayIdx];

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!selectedDocId) {
      setModalError(t.doctorError);
      return;
    }
    if (!selectedTimeSlot) {
      setModalError(t.slotError);
      return;
    }
    if (!manualForm.patient_name.trim() || !manualForm.phone.trim()) {
      setModalError(t.requiredError);
      return;
    }

    setSubmittingBooking(true);

    try {
      const { error } = await supabase.from('appointments').insert({
        patient_name: manualForm.patient_name.trim(),
        phone: manualForm.phone.trim(),
        email: manualForm.email.trim() || null,
        doctor_id: selectedDocId,
        department_id: selectedDoctor?.department_id || null,
        appointment_date: currentSelectedDay.isoDate,
        appointment_time: selectedTimeSlot,
        message: manualForm.message.trim() || null,
        status: 'confirmed'
      });

      if (error) throw error;

      // Reset & Reload
      setModalOpen(false);
      setSelectedDocId('');
      setSelectedTimeSlot(null);
      setManualForm({ patient_name: '', phone: '', email: '', message: '' });
      fetchAppointments();
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || 'Error occurred during manual booking.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const filters = [
    { value: 'all', label: t.all },
    { value: 'pending', label: t.pending },
    { value: 'confirmed', label: t.confirmed },
    { value: 'completed', label: t.completed },
    { value: 'cancelled', label: t.cancelled },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        {/* Triple-action loader */}
        <div className="w-16 h-16 relative mx-auto">
          <div className="w-16 h-16 rounded-full border-4 border-blue-50 border-t-primary animate-spin absolute" />
          <div className="w-12 h-12 rounded-full border-4 border-dashed border-primary/25 animate-spin absolute top-2 left-2" style={{ animationDirection: 'reverse' }} />
          <div className="w-6 h-6 bg-primary/10 rounded-full absolute top-5 left-5 animate-ping" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-base font-black text-gray-900 tracking-tight">{t.loadingText}</h4>
          <p className="text-[10px] text-gray-400 font-bold tracking-wide uppercase">
            {lang === 'ar' ? 'الرجاء الانتظار ثانية واحدة...' : 'Please wait a moment...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-start" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Filters & Action Header */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button 
              key={f.value} 
              onClick={() => setFilter(f.value)}
              className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                filter === f.value 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'bg-white text-gray-650 border border-gray-200/80 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-5 py-3 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg shadow-primary/15 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>{t.manualBookBtn}</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none w-full sm:w-64 transition-all placeholder:text-gray-400" 
            />
          </div>
        </div>
      </div>

      {/* Table view for larger screens */}
      <div className="hidden lg:block bg-white rounded-[24px] border border-gray-150 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4.5">{t.patientDetails}</th>
                <th className="px-6 py-4.5">{t.phone}</th>
                <th className="px-6 py-4.5">{t.doctor}</th>
                <th className="px-6 py-4.5">{t.date}</th>
                <th className="px-6 py-4.5">{t.time}</th>
                <th className="px-6 py-4.5">{t.status}</th>
                <th className="px-6 py-4.5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400 font-medium">
                    {t.noAppts}
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-gray-900">{appt.patient_name}</p>
                          {appt.email && <p className="text-xs text-gray-450 mt-0.5 font-medium">{appt.email}</p>}
                          {appt.message && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-100/50 px-2.5 py-1 rounded-xl mt-1.5 inline-block max-w-[240px] truncate" title={appt.message}>
                              💬 {appt.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base font-semibold text-gray-700">{appt.phone}</td>
                    <td className="px-6 py-4">
                      {appt.doctors ? (
                        <div>
                          <p className="text-base font-bold text-gray-800">{appt.doctors.name_ar || appt.doctors.name}</p>
                          {appt.departments && (
                            <p className="text-xs text-gray-400 font-medium mt-0.5">({appt.departments.name_ar || appt.departments.name})</p>
                          )}
                        </div>
                      ) : appt.notes ? (
                        <div>
                          <p className="text-base font-bold text-gray-800">{appt.notes}</p>
                          <span className="text-xs text-gray-450 mt-0.5 block">({t.notAssigned})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider bg-gray-50 border border-gray-150 px-2 py-0.5 rounded">{t.notAssigned}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-base font-medium text-gray-700">{appt.appointment_date}</td>
                    <td className="px-6 py-4 text-base font-semibold text-gray-800">{appt.appointment_time}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold ${statusColor(appt.status)}`}>
                        {statusIcon(appt.status)} 
                        <span>{{ pending: t.pending, confirmed: t.confirmed, completed: t.completed, cancelled: t.cancelled }[appt.status] || appt.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {appt.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateStatus(appt.id, 'confirmed')}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 transition-all cursor-pointer"
                            >
                              {t.confirmBtn}
                            </button>
                            <button 
                              onClick={() => updateStatus(appt.id, 'cancelled')}
                              className="px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-all cursor-pointer"
                            >
                              {t.cancelBtn}
                            </button>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <>
                            <button 
                              onClick={() => updateStatus(appt.id, 'completed')}
                              className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all cursor-pointer"
                            >
                              {t.completeBtn}
                            </button>
                            <button 
                              onClick={() => updateStatus(appt.id, 'cancelled')}
                              className="px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-100 transition-all cursor-pointer"
                            >
                              {t.cancelBtn}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card list view for mobile/tablet screens */}
      <div className="block lg:hidden space-y-4">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 bg-white rounded-[24px] border border-gray-150 font-medium">
            {t.noAppts}
          </div>
        ) : (
          filtered.map((appt) => (
            <div key={appt.id} className="bg-white border border-gray-150 rounded-[24px] p-5 shadow-sm space-y-4 text-start">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">{appt.patient_name}</h4>
                    {appt.email && <p className="text-xs text-gray-500 mt-0.5">{appt.email}</p>}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${statusColor(appt.status)}`}>
                  {statusIcon(appt.status)} 
                  <span>{{ pending: t.pending, confirmed: t.confirmed, completed: t.completed, cancelled: t.cancelled }[appt.status] || appt.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-sm py-3.5 border-y border-gray-100">
                <div>
                  <span className="text-[10px] uppercase font-black text-gray-400 block tracking-wider mb-0.5">{t.phone}</span>
                  <span className="text-gray-800 font-bold text-[15px]">{appt.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-gray-400 block tracking-wider mb-0.5">{t.doctor}</span>
                  <span className="text-gray-800 font-bold text-[15px] block truncate">
                    {appt.doctors ? appt.doctors.name_ar || appt.doctors.name : appt.notes ? appt.notes : t.notAssigned}
                  </span>
                  {appt.doctors && appt.departments && (
                    <span className="text-gray-400 text-xs block">({appt.departments.name_ar || appt.departments.name})</span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-gray-400 block tracking-wider mb-0.5">{t.date}</span>
                  <span className="text-gray-700 font-bold">{appt.appointment_date}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-gray-400 block tracking-wider mb-0.5">{t.time}</span>
                  <span className="text-gray-850 font-black">{appt.appointment_time}</span>
                </div>
              </div>

              {appt.message && (
                <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-3.5 text-xs text-amber-800 leading-relaxed text-right" dir="rtl">
                  <span className="font-black block mb-1">💬 {t.complaintLabel}</span>
                  {appt.message}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-1">
                {appt.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => updateStatus(appt.id, 'confirmed')}
                      className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/10 transition-all cursor-pointer"
                    >
                      {t.confirmBtn}
                    </button>
                    <button 
                      onClick={() => updateStatus(appt.id, 'cancelled')}
                      className="px-4.5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-extrabold border border-rose-100 transition-all cursor-pointer"
                    >
                      {t.cancelBtn}
                    </button>
                  </>
                )}
                {appt.status === 'confirmed' && (
                  <>
                    <button 
                      onClick={() => updateStatus(appt.id, 'completed')}
                      className="flex-1 px-4.5 py-2.5 bg-primary text-white rounded-xl text-xs font-extrabold shadow-md shadow-primary/10 hover:bg-primary-dark transition-all cursor-pointer"
                    >
                      {t.completeBtn}
                    </button>
                    <button 
                      onClick={() => updateStatus(appt.id, 'cancelled')}
                      className="px-4.5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-extrabold border border-rose-100 transition-all cursor-pointer"
                    >
                      {t.cancelBtn}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================
          🆕 MANUAL BOOKING DIALOG MODAL (RECEPTIONIST HANDLER)
         ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] max-w-2xl w-full border border-gray-150 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <button 
              onClick={() => {
                setModalOpen(false);
                setSelectedDocId('');
                setSelectedTimeSlot(null);
                setModalError('');
              }}
              className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-650 transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-start mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10.5px] font-black uppercase tracking-wide mb-3">
                <Calendar className="w-3.5 h-3.5" />
                {t.modalTitle}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{t.modalTitle}</h3>
              <p className="text-xs text-gray-500 mt-1 font-medium">{t.modalSub}</p>
            </div>

            {modalError && (
              <div className="mb-5 p-4 bg-rose-50 border border-rose-150 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2.5 text-start">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-5 text-start">
              {/* Select Doctor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">{t.doctorSelectLabel}</label>
                <select
                  required
                  value={selectedDocId}
                  onChange={(e) => {
                    setSelectedDocId(e.target.value);
                    setSelectedDayIdx(0);
                    setSelectedTimeSlot(null);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-850 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                >
                  <option value="">{t.doctorSelectPlaceholder}</option>
                  {doctorsList.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {lang === 'ar' ? doc.name_ar || doc.name : doc.name} ({doc.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Day & Slots Builder (Shows only if doctor is selected) */}
              {selectedDocId && (
                <div className="space-y-4 border-t border-b border-gray-100 py-4.5">
                  <label className="text-xs font-bold text-gray-650 block">{t.scheduleLabel}</label>
                  
                  {/* Days tab selection list */}
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
                    {calculatedDays.map((day, idx) => (
                      <button
                        type="button"
                        key={day.isoDate}
                        onClick={() => {
                          setSelectedDayIdx(idx);
                          setSelectedTimeSlot(null);
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl min-w-[70px] border transition-all duration-200 cursor-pointer ${
                          selectedDayIdx === idx
                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                            : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-[10px] font-bold opacity-80">{day.dayName}</span>
                        <span className="text-base font-black mt-0.5">{day.dayNum}</span>
                      </button>
                    ))}
                  </div>

                  {/* Available Time Slots Render */}
                  <div>
                    {currentSelectedDay?.isClosed ? (
                      <div className="py-6 bg-rose-50 border border-rose-100 rounded-2xl text-center text-rose-500 text-sm font-bold">
                        {t.closedDay}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {currentSelectedDay?.slots.map((slot: string) => {
                          const isTaken = appointments.some(a => 
                            a.doctor_id === selectedDocId && 
                            a.appointment_date === currentSelectedDay.isoDate && 
                            a.appointment_time === slot && 
                            a.status !== 'cancelled'
                          );

                          return (
                            <button
                              type="button"
                              key={slot}
                              disabled={isTaken}
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                                isTaken
                                  ? 'bg-rose-50 border-rose-100 text-rose-400 cursor-not-allowed line-through'
                                  : selectedTimeSlot === slot
                                  ? 'bg-primary border-primary text-white font-black shadow-lg shadow-primary/10'
                                  : 'bg-gray-50 border-gray-150 text-gray-700 hover:bg-primary/5 hover:border-primary/20'
                              }`}
                            >
                              <span>{slot}</span>
                              {isTaken && <span className="block text-[9px] font-bold opacity-75">({lang === 'ar' ? 'محجوز' : 'Booked'})</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Patient Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 block">{t.patientNameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.patientNamePlaceholder}
                    value={manualForm.patient_name}
                    onChange={(e) => setManualForm(p => ({ ...p, patient_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 block">{t.patientPhoneLabel}</label>
                  <input
                    type="tel"
                    required
                    placeholder={t.patientPhonePlaceholder}
                    value={manualForm.phone}
                    onChange={(e) => setManualForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">{t.patientEmailLabel}</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={manualForm.email}
                  onChange={(e) => setManualForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">{t.patientNotesLabel}</label>
                <textarea
                  placeholder={t.patientNotesPlaceholder}
                  rows={3}
                  value={manualForm.message}
                  onChange={(e) => setManualForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-850 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{t.submitBtnModal}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedDocId('');
                    setSelectedTimeSlot(null);
                    setModalError('');
                  }}
                  className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  {t.cancelBtnModal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
