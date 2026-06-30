'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Calendar, User, Clock, ChevronRight, CheckCircle2, ShieldCheck, 
  Mail, LogOut, Phone, Trash2, CalendarX, Info, HeartPulse, Loader2, Star, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { doctors } from '@/data/doctors';

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email?: string;
  appointment_date: string;
  appointment_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  doctor_id?: string;
}

interface Review {
  id: string;
  patient_name: string;
  email: string;
  rating: number;
  comment: string;
  doctor_id?: string;
  type: 'doctor' | 'clinic';
}

export default function DashboardPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ type: 'doctor' | 'clinic'; doctor_id?: string; doctor_name?: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Check login state
  useEffect(() => {
    async function loadDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setUser(session.user);

      // Fetch patient's appointments by email
      if (session.user.email) {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('email', session.user.email)
          .order('appointment_date', { ascending: true });

        if (!error && data) {
          setAppointments(data);
        }
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this appointment?')) return;
    setActionLoading(id);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      // Update state local
      setAppointments(prev =>
        prev.map(appt => appt.id === id ? { ...appt, status: 'cancelled' } : appt)
      );
    } catch (err: any) {
      console.error(err);
      showToast(
        isAr ? 'فشل إلغاء الحجز، حاول مرة أخرى' : 'Failed to cancel, try again',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getDoctorName = (docId?: string) => {
    if (!docId) return isAr ? 'دكتور متخصص' : 'Specialist Doctor';
    const doc = doctors.find(d => d.id === docId);
    if (!doc) return isAr ? 'دكتور متخصص' : 'Specialist Doctor';
    return doc.nameKey; // Resolved array key fallback
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isAr ? 'مؤكد' : 'Confirmed'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold">
            <CalendarX className="w-3.5 h-3.5" />
            {isAr ? 'ملغي' : 'Cancelled'}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isAr ? 'مكتمل' : 'Completed'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            {isAr ? 'قيد الانتظار' : 'Pending'}
          </span>
        );
    }
  };

  // Open Review Dialog
  const openReviewModal = (type: 'doctor' | 'clinic', docId?: string, docName?: string) => {
    setReviewTarget({ type, doctor_id: docId, doctor_name: docName });
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingReview(true);

    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Patient';
    const isValidUUID = (uuidStr: string) => {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuidStr);
    };

    const reviewData = {
      patient_name: displayName,
      rating: reviewRating,
      comment: reviewComment,
      doctor_id: (reviewTarget?.doctor_id && isValidUUID(reviewTarget.doctor_id)) ? reviewTarget.doctor_id : null,
    };

    try {
      const { error } = await supabase
        .from('reviews')
        .insert(reviewData);

      if (error) {
        console.error('Supabase review insert error:', error);
        // Fallback local reviews key
        const localReviews = localStorage.getItem('emc_reviews') || '[]';
        const updated = [...JSON.parse(localReviews), { id: Date.now().toString(), ...reviewData, type: reviewTarget?.type || 'clinic' }];
        localStorage.setItem('emc_reviews', JSON.stringify(updated));
      }

      showToast(
        isAr ? 'شكراً لك! تم إرسال تقييمك بنجاح.' : 'Thank you! Your review has been submitted.',
        'success'
      );
      setReviewModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen text-[#1A1A2E] flex flex-col justify-between pt-20">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <HeartPulse className="w-12 h-12 text-primary animate-pulse" />
            <p className="text-gray-500 text-sm">{isAr ? 'جاري تحميل الملف الشخصي...' : 'Loading profile...'}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen text-[#1A1A2E] flex flex-col justify-between pt-20">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white border border-gray-100 rounded-[32px] p-8 text-center shadow-xl">
            <Info className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{isAr ? 'يرجى تسجيل الدخول أولاً' : 'Sign in required'}</h1>
            <p className="text-gray-500 text-sm mb-6">
              {isAr 
                ? 'يجب تسجيل الدخول للوصول إلى الملف الشخصي واستعراض حجوزاتك.' 
                : 'Please sign in to access your personal profile and view appointments.'}
            </p>
            <Link 
              href="/login"
              className="inline-block w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 transition-all text-center"
            >
              {isAr ? 'تسجيل الدخول الآن' : 'Sign In Now'}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Patient';

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[#1A1A2E] flex flex-col justify-between pt-20">
      <Navbar />
      
      <div className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-start">
        
        {/* Glow ambient */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        {/* Dashboard Title */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-100 p-6 rounded-[24px] shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-[#1A1A2E]">
              {isAr ? `مرحباً بك، ${displayName}` : `Welcome, ${displayName}`} 👋
            </h1>
            <p className="text-sm text-gray-500">
              {isAr ? 'تابع حوزاتك، قم بتقييم تجربتك مع الأطباء، وقيم العيادة.' : 'Track appointments, review doctors and evaluate the clinic.'}
            </p>
          </div>
          <Link
            href="/doctors"
            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-md text-sm hover:scale-[1.02] transition-transform"
          >
            {isAr ? 'حجز كشف جديد' : 'New Appointment'}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile panel & Clinic review card */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 border-b border-gray-100 pb-2 flex items-center gap-2 text-[#1A1A2E]">
                <User className="w-5 h-5 text-primary" />
                {isAr ? 'الملف الشخصي' : 'Patient Profile'}
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs mb-1">{isAr ? 'الاسم' : 'Name'}</span>
                  <span className="font-bold text-gray-800 block bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">{displayName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs mb-1">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</span>
                  <span className="font-medium text-gray-800 block bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 break-all">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Rate Clinic CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-[#E6F0FA] border border-primary/10 rounded-3xl p-6 text-center">
              <Star className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-base mb-1 text-[#1A1A2E]">{isAr ? 'كيف كانت تجربتك في العيادة؟' : 'How was your clinic visit?'}</h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {isAr ? 'رأيك يهمنا لمساعدتنا في تقديم رعاية طبية أفضل لك ولجميع المرضى.' : 'Your feedback helps us deliver better services to you and all patients.'}
              </p>
              <button
                onClick={() => openReviewModal('clinic')}
                className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                {isAr ? 'تقييم العيادة بالكامل' : 'Write Clinic Review'}
              </button>
            </div>
          </div>

          {/* Booked appointments & Rate buttons */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 min-h-[400px] shadow-sm">
              <h2 className="text-lg font-bold mb-6 border-b border-gray-100 pb-2 flex items-center gap-2 text-[#1A1A2E]">
                <Calendar className="w-5 h-5 text-primary" />
                {isAr ? 'مواعيد حجوزاتي الطبية الأخيرة' : 'My Recent Appointments'}
              </h2>

              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                  <Calendar className="w-12 h-12 mb-3 text-gray-200" />
                  <p className="text-gray-500 text-sm mb-1">{isAr ? 'لا يوجد أي حجوزات مسجلة لك حالياً' : 'No appointments booked yet'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appt) => (
                    <div 
                      key={appt.id} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 border ${
                        appt.status === 'cancelled' ? 'border-red-100 opacity-75' : 'border-gray-100 hover:border-[#0070CD]/20 hover:bg-[#0070CD]/[0.02]'
                      } rounded-2xl transition-all gap-4`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <HeartPulse className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#1A1A2E]">{appt.patient_name}</h4>
                          <p className="text-xs text-primary font-semibold mt-0.5">{getDoctorName(appt.doctor_id)}</p>
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {appt.appointment_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {appt.appointment_time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:self-center self-end">
                        {getStatusBadge(appt.status)}

                        {/* Rate Doctor trigger (For confirmed/completed appointments) */}
                        {appt.status !== 'cancelled' && (
                          <button
                            onClick={() => openReviewModal('doctor', appt.doctor_id, getDoctorName(appt.doctor_id))}
                            className="flex items-center gap-1 px-3 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 rounded-xl text-xs font-bold transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {isAr ? 'تقييم التجربة' : 'Rate Experience'}
                          </button>
                        )}

                        {/* Cancel Action */}
                        {appt.status === 'pending' && (
                          <button
                            onClick={() => handleCancelAppointment(appt.id)}
                            disabled={actionLoading === appt.id}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl transition-all disabled:opacity-50"
                          >
                            {actionLoading === appt.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Review Modal Dialog Overlay */}
      <AnimatePresence>
        {reviewModalOpen && reviewTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-gray-100 rounded-[36px] max-w-md w-full p-8 text-center shadow-2xl relative"
            >
              <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-2">
                {reviewTarget.type === 'clinic' 
                  ? (isAr ? 'تقييم تجربة العيادة بالكامل' : 'Rate Egypt Medical Clinic')
                  : (isAr ? `تقييم تجربتك مع ${reviewTarget.doctor_name}` : `Rate Dr. ${reviewTarget.doctor_name}`)}
              </h3>
              
              <p className="text-gray-500 text-xs leading-relaxed mb-6">
                {isAr 
                  ? 'يرجى اختيار عدد النجوم وكتابة تعليقك لمساعدتنا في تقديم خدمة أفضل.' 
                  : 'Please pick a rating and share your feedback with us.'}
              </p>

              <form onSubmit={handleSubmitReview}>
                {/* Stars container */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setReviewRating(val)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${val <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <textarea
                    rows={4}
                    required
                    placeholder={isAr ? 'اكتب تجربتك هنا بكل أمانة وموضوعية...' : 'Write your honest feedback here...'}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 resize-none text-start"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm border border-gray-200 transition-colors"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isAr ? 'إرسال التقييم' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
