'use client';

import { useState, use } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Send OTP code via Gmail SMTP API
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), action: 'send' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code');

      setStep('verify');
      if (data.devMode && data.code) {
        setSuccessMsg(
          isAr 
            ? `⚠️ [وضع التطوير] لم يتم إعداد البريد الإلكتروني. رمز التحقق التجريبي هو: ${data.code}` 
            : `⚠️ [Dev Mode] Mail server not configured. Test OTP code is: ${data.code}`
        );
      } else {
        setSuccessMsg(
          isAr 
            ? 'تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني.' 
            : 'A 6-digit verification code has been sent to your email.'
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (isAr ? 'فشل إرسال الرمز، تأكد من صحة البريد الإلكتروني' : 'Failed to send OTP code. Please verify your email.'));
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP and Reset Password via Admin API on Server
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          action: 'verify',
          userType: 'patient',
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'MISSING_SERVICE_ROLE_KEY') {
          throw new Error(
            isAr 
              ? 'برجاء إضافة مفتاح الـ SUPABASE_SERVICE_ROLE_KEY في ملف .env.local لإتمام تحديث كلمة مرور المريض بدون SMTP سوبابيز.'
              : 'Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file to reset the patient password.'
          );
        }
        throw new Error(data.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته');
      }

      setSuccessMsg(isAr ? 'تم إعادة تعيين كلمة المرور بنجاح! جاري تحويلك...' : 'Password reset successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = `/${locale}/login`;
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (isAr ? 'الرمز غير صحيح أو انتهت صلاحيته' : 'Invalid or expired code.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A2E] flex flex-col justify-between pt-28 relative overflow-hidden text-start">
        
        {/* Sleek Radial Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

        <div className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-md w-full bg-white border border-gray-150 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/5 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1A1A2E] font-outfit">
                {isAr ? 'استعادة كلمة المرور للمريض' : 'Patient Reset Password'}
              </h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {isAr 
                  ? 'أدخل بريدك الإلكتروني المسجل للحصول على رمز تحقق مؤقت' 
                  : 'Enter your email address to receive a secure login OTP code'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2.5 text-right"
                  dir="rtl"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 text-right"
                  dir="rtl"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {step === 'request' ? (
                <motion.form 
                  key="request-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSendOTP} 
                  className="space-y-5"
                >
                  <div className="space-y-1.5 text-right" dir="rtl">
                    <label className="text-xs font-bold text-gray-650 block">
                      {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full pe-11 ps-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-right"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>{isAr ? 'إرسال رمز التحقق' : 'Send Verification Code'}</span>
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="verify-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleVerifyAndReset} 
                  className="space-y-5"
                >
                  <div className="space-y-1.5 text-right" dir="rtl">
                    <label className="text-xs font-bold text-gray-650 block text-center">
                      {isAr ? 'رمز التحقق (6 أرقام)' : 'Verification Code (6-digits)'}
                    </label>
                    <input 
                      type="text" 
                      required 
                      maxLength={6}
                      placeholder="123456"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-lg font-bold tracking-[0.5em] text-center outline-none focus:border-primary focus:bg-white transition-all"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5 text-right" dir="rtl">
                    <label className="text-xs font-bold text-gray-650 block">
                      {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pe-11 ps-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-right"
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
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    <span>{isAr ? 'تحديث كلمة المرور' : 'Reset Password'}</span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
        <Footer />
      </div>
    </>
  );
}
