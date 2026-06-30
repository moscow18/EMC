'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Brute-force Lockout States
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    const checkLockout = () => {
      const until = localStorage.getItem('emc_admin_lockout_until');
      if (until) {
        const diff = Math.ceil((Number(until) - Date.now()) / 1000);
        if (diff > 0) {
          setLockoutSeconds(diff);
        } else {
          localStorage.removeItem('emc_admin_lockout_until');
          setLockoutSeconds(0);
        }
      }
    };

    checkLockout();
    const interval = setInterval(() => {
      checkLockout();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setLoading(true);
    setError('');

    // Owner credentials bypass for receptionist panel access
    const savedOwnerPass = localStorage.getItem('emc_owner_password') || 'EMC_Owner_2026!#';
    if (cleanEmail === 'emc.egypt12@gmail.com' && cleanPassword === savedOwnerPass) {
      localStorage.removeItem('emc_admin_failed_attempts');
      localStorage.removeItem('emc_admin_lockout_until');
      localStorage.setItem('emc_admin_session', JSON.stringify({ email: cleanEmail, name: 'Clinic Owner', role: 'owner' }));
      router.push('/admin');
      return;
    }

    // 1. Verify locally registered receptionists first
    const localStaff = localStorage.getItem('emc_receptionists');
    if (localStaff) {
      const staffArray = JSON.parse(localStaff);
      const matched = staffArray.find((r: any) => r.email.toLowerCase() === cleanEmail && r.password === cleanPassword && r.is_active);
      if (matched) {
        // Clear failed attempts on success
        localStorage.removeItem('emc_admin_failed_attempts');
        localStorage.removeItem('emc_admin_lockout_until');
        
        localStorage.setItem('emc_admin_session', JSON.stringify({ email: matched.email, name: matched.name, role: 'receptionist' }));
        router.push('/admin');
        return;
      }
    }

    // 2. Fallback to Supabase Auth login
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        // Record failed attempt
        const currentAttempts = Number(localStorage.getItem('emc_admin_failed_attempts') || 0) + 1;
        localStorage.setItem('emc_admin_failed_attempts', String(currentAttempts));
        
        if (currentAttempts >= 3) {
          const until = Date.now() + 180 * 1000; // 3 minutes lockout
          localStorage.setItem('emc_admin_lockout_until', String(until));
          localStorage.setItem('emc_admin_failed_attempts', '0');
          setLockoutSeconds(180);
          setError('Too many failed attempts. Account has been locked for 3 minutes.');
        } else {
          setError(`Invalid credentials. ${3 - currentAttempts} attempts remaining.`);
        }
        setLoading(false);
      } else {
        localStorage.removeItem('emc_admin_failed_attempts');
        localStorage.removeItem('emc_admin_lockout_until');
        router.push('/admin');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <Image src="/emc-logo.jpg" alt="EMC Logo" width={64} height={64} className="rounded-2xl object-contain mx-auto mb-4 border border-gray-100 shadow-sm" />
          <h1 className="font-outfit text-3xl font-bold text-gray-900">EMC Portal</h1>
          <p className="text-gray-500 mt-1">Sign in to access secure workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          {lockoutSeconds > 0 ? (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Too many failed attempts. Locked for {lockoutSeconds} seconds.</span>
            </div>
          ) : error ? (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold">
              {error}
            </div>
          ) : null}

          <div className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                required type="email" placeholder="Email" disabled={lockoutSeconds > 0}
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-primary outline-none transition-all text-sm disabled:opacity-50 text-start"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                required type={showPassword ? 'text' : 'password'} placeholder="Password" disabled={lockoutSeconds > 0}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-primary outline-none transition-all text-sm disabled:opacity-50 text-start"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={lockoutSeconds > 0}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-right mt-1.5">
              <a href="/admin/forgot-password" className="text-xs text-primary font-semibold hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          <button type="submit" disabled={loading || lockoutSeconds > 0}
            className="mt-6 w-full flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition-all duration-300 shadow-md shadow-primary/25 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
