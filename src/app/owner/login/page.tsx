'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, Loader2, AlertCircle, ArrowLeft, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Lockout States
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    const checkLockout = () => {
      const until = localStorage.getItem('emc_owner_lockout_until');
      if (until) {
        const diff = Math.ceil((Number(until) - Date.now()) / 1000);
        if (diff > 0) {
          setLockoutSeconds(diff);
        } else {
          localStorage.removeItem('emc_owner_lockout_until');
          setLockoutSeconds(0);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    if (!email || !password) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setLoading(true);
    setErrorMsg('');

    // Local executive backup credentials check
    const savedOwnerPass = localStorage.getItem('emc_owner_password') || 'EMC_Owner_2026!#';
    if (cleanEmail === 'emc.egypt12@gmail.com' && cleanPassword === savedOwnerPass) {
      localStorage.removeItem('emc_owner_failed_attempts');
      localStorage.removeItem('emc_owner_lockout_until');
      sessionStorage.setItem('emc_owner_session', 'true');
      router.push('/owner');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        const currentAttempts = Number(localStorage.getItem('emc_owner_failed_attempts') || 0) + 1;
        localStorage.setItem('emc_owner_failed_attempts', String(currentAttempts));
        
        if (currentAttempts >= 3) {
          const until = Date.now() + 180 * 1000; // 3 minutes
          localStorage.setItem('emc_owner_lockout_until', String(until));
          localStorage.setItem('emc_owner_failed_attempts', '0');
          setLockoutSeconds(180);
          setErrorMsg('تم قفل الحساب مؤقتاً لمدة 3 دقائق بسبب محاولات الدخول الخاطئة.');
        } else {
          setErrorMsg(`بيانات الدخول غير صحيحة. متبقي لديك ${3 - currentAttempts} محاولات.`);
        }
        setLoading(false);
      } else {
        localStorage.removeItem('emc_owner_failed_attempts');
        localStorage.removeItem('emc_owner_lockout_until');
        sessionStorage.setItem('emc_owner_session', 'true');
        router.push('/owner');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء الاتصال بالخادم.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="max-w-md w-full bg-white border border-gray-100 p-8 rounded-[32px] shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/emc-logo.jpg" alt="EMC Logo" width={56} height={56} className="rounded-2xl mx-auto mb-4 border border-gray-100 shadow-sm" />
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1A1A2E]">بوابة إدارة المالك</h2>
          <p className="text-xs text-gray-500 mt-2">قم بتسجيل الدخول للاطلاع على التقارير المالية للعيادة</p>
        </div>

        {lockoutSeconds > 0 ? (
          <div className="p-4 mb-5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2.5 text-right" dir="rtl">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>تم قفل الدخول. يرجى المحاولة بعد {lockoutSeconds} ثانية.</span>
          </div>
        ) : errorMsg ? (
          <div className="p-4 mb-5 bg-red-50 border border-red-100 text-red-500 text-xs font-semibold rounded-xl flex items-center gap-2.5 text-right" dir="rtl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-4" dir="rtl">
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-gray-600">البريد الإلكتروني للإدارة</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                disabled={lockoutSeconds > 0}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pe-11 ps-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400 text-right disabled:opacity-50"
                placeholder="admin@emc-clinic.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-right">
            <label className="text-xs font-bold text-gray-600">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={lockoutSeconds > 0}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pe-11 ps-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400 text-right disabled:opacity-50"
                placeholder="••••••••"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={lockoutSeconds > 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-left mt-1.5">
              <Link href="/owner/forgot-password" className="text-xs text-primary font-bold hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutSeconds > 0}
            className="w-full py-3.5 mt-2 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التحقق...</span>
              </>
            ) : (
              <span>دخول للوحة التحكم</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-primary inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة للموقع الرئيسي</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
