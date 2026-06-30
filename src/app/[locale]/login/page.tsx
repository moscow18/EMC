'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Lock, ArrowRight, User, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email & Password Auth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !fullName)) {
      setErrorMsg(isAr ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect to dashboard
        window.location.href = `/${locale}/dashboard`;
      } else {
        // Sign Up (Register)
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/${locale}/dashboard`,
          },
        });

        if (error) throw error;

        showToast(
          isAr
            ? 'تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتأكيد الحساب.'
            : 'Account created! Please check your email to verify your registration.',
          'success'
        );
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (isAr ? 'حدث خطأ ما، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again'));
    } finally {
      setLoading(false);
    }
  };

  // OAuth logins
  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/${locale}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (isAr ? 'فشل تسجيل الدخول الاجتماعي' : 'Social sign-in failed'));
      setSocialLoading(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A2E] flex flex-col justify-between pt-24 relative overflow-hidden">
        
        {/* Decorative Background Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary/5 blur-[100px] rounded-full pointer-events-none z-0"></div>

        <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="w-full max-w-5xl bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            {/* Left Side: Form Container */}
            <div className="w-full md:w-1/2 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Header */}
                <div className="text-center md:text-start mb-8">
                  <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-2 tracking-tight">
                    {isLogin 
                      ? (isAr ? 'مرحباً بعودتك' : 'Welcome Back') 
                      : (isAr ? 'إنشاء حساب جديد' : 'Create Account')}
                  </h1>
                  <p className="text-gray-500 text-sm">
                    {isLogin 
                      ? (isAr ? 'سجل دخولك لمتابعة مواعيدك الطبية' : 'Sign in to manage your medical appointments.') 
                      : (isAr ? 'ابدأ رحلة رعاية صحتك معنا اليوم' : 'Start your health journey with us today.')}
                  </p>
                </div>

                {/* Switcher Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 border border-gray-200 relative">
                  <button 
                    onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all z-10 ${isLogin ? 'text-white shadow-md bg-primary font-extrabold' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {isAr ? 'تسجيل الدخول' : 'Sign In'}
                  </button>
                  <button 
                    onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all z-10 ${!isLogin ? 'text-white shadow-md bg-primary font-extrabold' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {isAr ? 'حساب جديد' : 'Register'}
                  </button>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 mb-5 bg-red-50 border border-red-100 text-red-500 text-xs font-semibold rounded-xl flex items-center gap-2.5 text-start"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{errorMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  {!isLogin && (
                    <div className="space-y-1.5 text-start">
                      <label className="text-xs font-bold text-gray-600 block">{isAr ? 'الاسم بالكامل' : 'Full Name'}</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute start-4 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="w-full ps-11 pe-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400"
                          placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g., John Doe'}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 text-start">
                    <label className="text-xs font-bold text-gray-600 block">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute start-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full ps-11 pe-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400"
                        placeholder="you@example.com"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-start">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-600 block">{isAr ? 'كلمة المرور' : 'Password'}</label>
                      {isLogin && (
                        <a href={`/${locale}/forgot-password`} className="text-xs font-bold text-primary hover:underline">{isAr ? 'نسيت كلمة المرور؟' : 'Forgot?'}</a>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute start-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full ps-11 pe-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400"
                        placeholder="••••••••"
                        dir="ltr"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.99] disabled:opacity-75 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isAr ? 'جاري التحميل...' : 'Loading...'}
                      </>
                    ) : (
                      <>
                        {isLogin ? (isAr ? 'تسجيل الدخول' : 'Sign In') : (isAr ? 'إنشاء حساب' : 'Create Account')}
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-500 font-medium">
                      {isAr ? 'أو سجل عبر' : 'Or continue with'}
                    </span>
                  </div>
                </div>

                {/* Social logins */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Google */}
                  <button 
                    onClick={() => handleOAuthLogin('google')}
                    disabled={socialLoading !== null}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-xs font-bold text-gray-750 disabled:opacity-50"
                  >
                    {socialLoading === 'google' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Google
                  </button>

                  {/* Facebook */}
                  <button 
                    onClick={() => handleOAuthLogin('facebook')}
                    disabled={socialLoading !== null}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-xs font-bold text-gray-750 disabled:opacity-50"
                  >
                    {socialLoading === 'facebook' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    Facebook
                  </button>
                </div>

                {/* Footer terms */}
                <p className="mt-8 text-center text-xs text-gray-500 font-medium">
                  {isAr ? 'بالاستمرار، فإنك توافق على' : 'By clicking continue, you agree to our'}{' '}
                  <a href="#" className="text-primary hover:underline">{isAr ? 'شروط الخدمة' : 'Terms of Service'}</a>{' '}
                  {isAr ? 'و' : 'and'}{' '}
                  <a href="#" className="text-primary hover:underline">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>.
                </p>
              </motion.div>
            </div>

            {/* Right Side: Marketing/Banner */}
            <div className="hidden md:block md:w-1/2 relative bg-gradient-to-br from-[#E6F0FA] to-[#F0F7FF] border-s border-gray-100 p-10 flex flex-col justify-between overflow-hidden">
              {/* Background gradient grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,112,205,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,112,205,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
              
              <div className="relative z-10 text-start">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <span className="font-extrabold text-primary tracking-wider">EMC</span>
                </div>
                <h2 className="text-3xl font-extrabold text-[#1A1A2E] mb-4 leading-tight">
                  {isAr ? 'رعاية صحية تليق بك وبأسرتك' : 'Premium Care for You and Your Family'}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {isAr
                    ? 'احصل على رعاية طبية متكاملة مع نخبة من أفضل الأطباء والاستشاريين في مصر الجديدة.'
                    : 'Experience world-class medical services with elite consultants and doctors in Heliopolis, Cairo.'}
                </p>
              </div>

              {/* Minimalist testimonial */}
              <div className="relative z-10 flex items-center gap-4 bg-white border border-primary/10 p-4 rounded-2xl shadow-sm">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 14}`} alt="user" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <div className="text-start">
                  <p className="text-[#1A1A2E] font-bold text-xs">
                    {isAr ? 'أكثر من +10,000 عميل يثق بنا' : 'Trusted by 10,000+ patients'}
                  </p>
                  <div className="flex text-amber-400 text-xs mt-0.5">★★★★★</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
