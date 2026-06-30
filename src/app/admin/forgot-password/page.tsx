'use client';

import { useState } from 'react';
import { Mail, Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const cleanEmail = email.trim().toLowerCase();

    // Check receptionist list
    const localStaff = localStorage.getItem('emc_receptionists');
    const staffArray = localStaff ? JSON.parse(localStaff) : [];
    const matched = staffArray.find((r: any) => r.email.toLowerCase() === cleanEmail);

    if (!matched) {
      setErrorMsg('البريد الإلكتروني غير مسجل في قائمة موظفي الاستقبال بالعيادة.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, action: 'send' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إرسال رمز التحقق');

      setStep('verify');
      if (data.devMode && data.code) {
        setSuccessMsg(`⚠️ [وضع التطوير] لم يتم إعداد البريد الإلكتروني. رمز التحقق التجريبي هو: ${data.code}`);
      } else {
        setSuccessMsg('تم إرسال رمز تحقق مؤقت مكون من 6 أرقام إلى بريدك الإلكتروني.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال رمز التحقق.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify and reset password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) return;

    const cleanEmail = email.trim().toLowerCase();

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: code.trim(), action: 'verify' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'الرمز المدخل غير صحيح');

      // Update password locally
      const localStaff = localStorage.getItem('emc_receptionists');
      if (localStaff) {
        const staffArray = JSON.parse(localStaff);
        const updated = staffArray.map((r: any) => 
          r.email.toLowerCase() === cleanEmail ? { ...r, password: newPassword.trim() } : r
        );
        localStorage.setItem('emc_receptionists', JSON.stringify(updated));
      }

      setSuccessMsg('تم إعادة تعيين كلمة مرور موظف الاستقبال بنجاح! جاري تحويلك...');
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A2E] flex items-center justify-center p-4 relative overflow-hidden text-start">
      
      {/* Radial Background decorative glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full bg-white border border-gray-100 p-8 rounded-[32px] shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/5 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1A1A2E] font-outfit">استعادة كلمة مرور الاستقبال</h2>
          <p className="text-xs text-gray-500 mt-2">أدخل بريدك الإلكتروني للحصول على رمز تحقق مؤقت</p>
        </div>

        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 bg-red-50 border border-red-100 text-red-650 text-xs font-semibold rounded-xl flex items-center gap-2.5 text-right" 
              dir="rtl"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2.5 text-right" 
              dir="rtl"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 'request' ? (
            <motion.form 
              key="request"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              onSubmit={handleSendOTP} 
              className="space-y-4" 
              dir="rtl"
            >
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-gray-650">البريد الإلكتروني للاستقبال</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pe-11 ps-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400 text-right"
                    placeholder="receptionist@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>إرسال رمز التحقق</span>
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="verify"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleVerifyAndReset} 
              className="space-y-4" 
              dir="rtl"
            >
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-gray-650">رمز التحقق (6 أرقام)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-lg font-bold tracking-[0.5em] text-center outline-none focus:border-primary focus:bg-white transition-all"
                  placeholder="123456"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-gray-650">كلمة المرور الجديدة</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pe-11 ps-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all placeholder:text-gray-400 text-right"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>تأكيد واستعادة كلمة المرور</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <a href="/admin/login" className="text-xs text-gray-500 hover:text-primary inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>العودة لتسجيل الدخول</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
