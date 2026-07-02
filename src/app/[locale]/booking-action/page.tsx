'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, Phone } from 'lucide-react';
import '../../globals.css';

export default function BookingActionPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const isAr = locale === 'ar';

  const appointmentId = searchParams.get('id');
  const action = searchParams.get('action'); // 'confirm' or 'cancel'

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!appointmentId || !action) {
      setStatus('error');
      setMessage(isAr ? 'بيانات الطلب غير مكتملة.' : 'Invalid booking request parameters.');
      return;
    }

    async function processAction() {
      try {
        const res = await fetch(`/api/book?id=${appointmentId}&action=${action}`);
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(
            action === 'confirm'
              ? (isAr ? 'تم تأكيد حجزك بنجاح في نظام العيادة. نتطلع لرؤيتك قريباً.' : 'Your appointment has been successfully confirmed. We look forward to seeing you.')
              : (isAr ? 'تم إلغاء الحجز بنجاح بناءً على طلبك.' : 'Your appointment has been successfully cancelled.')
          );
        } else {
          setStatus('error');
          setMessage(data.error || (isAr ? 'فشلت العملية، يرجى المحاولة لاحقاً.' : 'Action failed, please try again later.'));
        }
      } catch (err) {
        setStatus('error');
        setMessage(isAr ? 'حدث خطأ في الاتصال بالخادم.' : 'Connection error occurred.');
      }
    }

    processAction();
  }, [appointmentId, action, isAr]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-white border border-gray-150 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        
        {/* Logo */}
        <div className="mx-auto w-16 h-16 relative">
          <Image 
            src="/emc-logo.jpg" 
            alt="EMC Logo" 
            fill
            className="rounded-2xl object-contain border border-gray-100 shadow-sm"
          />
        </div>

        {/* Dynamic content based on state */}
        {status === 'loading' && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">
              {isAr ? 'جاري معالجة طلبك...' : 'Processing your request...'}
            </h1>
            <p className="text-sm text-gray-500">
              {isAr ? 'يرجى الانتظار لحظة بينما نقوم بتحديث حالة الحجز.' : 'Please wait a moment while we update your booking status.'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            {action === 'confirm' ? (
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
            <h1 className="text-xl font-bold text-gray-900">
              {action === 'confirm' 
                ? (isAr ? 'تم تأكيد الموعد!' : 'Booking Confirmed!') 
                : (isAr ? 'تم إلغاء الموعد!' : 'Booking Cancelled!')}
            </h1>
            <p className="text-sm text-gray-650 leading-relaxed">
              {message}
            </p>
            <div className="pt-4">
              <Link 
                href={`/${locale}`}
                className="block w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition-all text-sm shadow-md shadow-primary/20"
              >
                {isAr ? 'العودة للموقع الرئيسي' : 'Go to Homepage'}
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-300">
            <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">
              {isAr ? 'عذراً، حدث خطأ ما' : 'Oops, something went wrong'}
            </h1>
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 leading-relaxed">
              {message}
            </p>
            <div className="pt-4 space-y-3">
              <Link 
                href={`/${locale}`}
                className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition-all text-sm"
              >
                {isAr ? 'العودة للرئيسية' : 'Back to Home'}
              </Link>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{isAr ? 'للمساعدة اتصل بنا: 01044437797' : 'For support call: 01044437797'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
          <p>© 2026 عيادة مصر الطبية EMC.</p>
        </div>

      </div>
    </div>
  );
}
