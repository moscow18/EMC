'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { playNotificationSound } from '@/lib/audio';
import { User, Shield, Volume2, Save, Play, RefreshCw, KeyRound, AlertCircle, CheckCircle, Globe } from 'lucide-react';

interface StaffUser {
  email: string;
  name: string;
  role: 'receptionist' | 'owner' | 'admin';
  phone?: string;
  id?: string;
}

export default function AdminProfilePage() {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Audio Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [soundType, setSoundType] = useState('double_beep');

  // Language setting state
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      // Load language preference
      const storedLang = localStorage.getItem('emc_admin_lang') as 'ar' | 'en';
      if (storedLang) setLang(storedLang);

      // 1. Check local session first
      const localSessionStr = localStorage.getItem('emc_admin_session');
      if (localSessionStr) {
        const localSession = JSON.parse(localSessionStr);
        if (localSession.role === 'receptionist') {
          const staffArray = JSON.parse(localStorage.getItem('emc_receptionists') || '[]');
          const currentStaff = staffArray.find((r: any) => r.email.toLowerCase() === localSession.email.toLowerCase());
          if (currentStaff) {
            setUser({
              id: currentStaff.id,
              name: currentStaff.name,
              email: currentStaff.email,
              phone: currentStaff.phone || '',
              role: 'receptionist',
            });
            setName(currentStaff.name);
            setEmail(currentStaff.email);
            setPhone(currentStaff.phone || '');
            setPassword(currentStaff.password || '');
          }
        } else if (localSession.role === 'owner') {
          setUser({
            name: 'Clinic Owner',
            email: localSession.email,
            role: 'owner',
          });
          setName('Clinic Owner');
          setEmail(localSession.email);
          const savedOwnerPass = localStorage.getItem('emc_owner_password') || 'EMC_Owner_2026!#';
          setPassword(savedOwnerPass);
        }
      } else {
        // 2. Supabase Auth fallback
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser({
            name: 'System Admin',
            email: session.user.email || '',
            role: 'admin',
          });
          setName('System Admin');
          setEmail(session.user.email || '');
          setPassword(''); 
        }
      }

      // Load sound preferences
      const storedSoundEnabled = localStorage.getItem('emc_notifications_sound_enabled');
      setSoundEnabled(storedSoundEnabled === null ? true : storedSoundEnabled === 'true');
      
      const storedVolume = localStorage.getItem('emc_notifications_volume');
      setVolume(storedVolume ? Number(storedVolume) : 0.5);

      const storedSoundType = localStorage.getItem('emc_notification_sound');
      setSoundType(storedSoundType || 'double_beep');

      setLoading(false);
    }

    loadProfile();
  }, []);

  const t = {
    ar: {
      profileTitle: 'الاستقبال - الملف الشخصي',
      profileSub: 'تعديل بيانات الدخول والاتصال للحساب الحالي',
      nameLabel: 'الاسم بالكامل',
      emailLabel: 'البريد الإلكتروني',
      phoneLabel: 'رقم الموبايل',
      passLabel: 'كلمة المرور الحالية',
      passLabelAdmin: 'كلمة المرور الجديدة (اتركها فارغة للتخطي)',
      saveBtn: 'حفظ التعديلات',
      audioTitle: 'إعدادات النغمات والإشعارات',
      audioSub: 'تخصيص صوت الإشعارات الفورية عند حجز جديد',
      enableSound: 'تفعيل التنبيه الصوتي',
      enableSoundSub: 'تشغيل نغمة رنين عند وصول رسالة أو حجز جديد',
      chimeLabel: 'نغمة رنين الإشعارات',
      volumeLabel: 'مستوى الصوت',
      testSoundBtn: 'إختبار النغمة',
      saveAudioBtn: 'حفظ الصوت',
      successProfile: 'تم تحديث بيانات الملف الشخصي بنجاح!',
      successPass: 'تم تحديث كلمة مرور المالك بنجاح!',
      successAdmin: 'تم تحديث بيانات المسؤول في قاعدة البيانات!',
      successAudio: 'تم حفظ إعدادات الصوت بنجاح!',
      errorSave: 'حدث خطأ أثناء حفظ التغييرات.',
      langTitle: 'إعدادات اللغة',
      langSub: 'اختر لغة واجهة مستخدم بوابة الاستقبال بالكامل',
      selectLang: 'لغة عرض البوابة',
      arabic: 'العربية (Arabic)',
      english: 'English (الإنجليزية)',
    },
    en: {
      profileTitle: 'Receptionist Profile',
      profileSub: 'Modify login credentials and contact info for the current user',
      nameLabel: 'Full Name',
      emailLabel: 'Email Address',
      phoneLabel: 'Mobile Number',
      passLabel: 'Current Password',
      passLabelAdmin: 'New Password (leave empty to skip)',
      saveBtn: 'Save Changes',
      audioTitle: 'Chime & Notifications Settings',
      audioSub: 'Customize sound chime played on new bookings/messages',
      enableSound: 'Enable Audio Alerts',
      enableSoundSub: 'Play chime ringtone upon new message or booking',
      chimeLabel: 'Ringtone Sound',
      volumeLabel: 'Volume Level',
      testSoundBtn: 'Test Sound',
      saveAudioBtn: 'Save Sound',
      successProfile: 'Profile details updated successfully!',
      successPass: 'Owner password updated successfully!',
      successAdmin: 'Admin details updated in database!',
      successAudio: 'Sound settings saved successfully!',
      errorSave: 'Error saving changes.',
      langTitle: 'Language Preferences',
      langSub: 'Select reception display language interface',
      selectLang: 'Display Language',
      arabic: 'العربية (Arabic)',
      english: 'English (English)',
    }
  }[lang];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (user.role === 'receptionist') {
        const staffArray = JSON.parse(localStorage.getItem('emc_receptionists') || '[]');
        const updated = staffArray.map((r: any) => {
          if (r.id === user.id) {
            return { ...r, name, email, phone, password };
          }
          return r;
        });
        localStorage.setItem('emc_receptionists', JSON.stringify(updated));
        
        // Update session storage
        localStorage.setItem(
          'emc_admin_session',
          JSON.stringify({ email, name, role: 'receptionist' })
        );
        setUser(p => p ? { ...p, name, email, phone } : null);
        setSuccessMsg(t.successProfile);
      } else if (user.role === 'owner') {
        // Update owner password in local storage
        localStorage.setItem('emc_owner_password', password);
        setSuccessMsg(t.successPass);
      } else if (user.role === 'admin') {
        // Supabase Auth update
        const updates: { email?: string; password?: string } = {};
        if (email !== user.email) updates.email = email;
        if (password) updates.password = password;

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase.auth.updateUser(updates);
          if (error) throw error;
          setUser(p => p ? { ...p, email } : null);
          setSuccessMsg(t.successAdmin);
        } else {
          setSuccessMsg(lang === 'ar' ? 'لم يتم إجراء أي تغييرات للبيانات.' : 'No changes detected.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || t.errorSave);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSoundSettings = () => {
    localStorage.setItem('emc_notifications_sound_enabled', String(soundEnabled));
    localStorage.setItem('emc_notifications_volume', String(volume));
    localStorage.setItem('emc_notification_sound', soundType);
    
    // Play test chime to confirm
    if (soundEnabled) {
      playNotificationSound(soundType, volume);
    }

    setSuccessMsg(t.successAudio);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLanguageChange = (newLang: 'ar' | 'en') => {
    setLang(newLang);
    localStorage.setItem('emc_admin_lang', newLang);
  };

  const testSound = () => {
    playNotificationSound(soundType, volume);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500 text-sm font-bold">{lang === 'ar' ? 'جاري تحميل البيانات...' : 'Loading config...'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-250 text-red-800 rounded-2xl flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-650" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-outfit text-lg font-bold text-gray-900">{t.profileTitle}</h3>
              <p className="text-xs text-gray-400">{t.profileSub}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {user?.role === 'receptionist' && (
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{t.nameLabel}</label>
                <input
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 focus:border-primary focus:bg-white outline-none rounded-xl text-sm transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">{t.emailLabel}</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                disabled={user?.role === 'owner'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-250 focus:border-primary focus:bg-white outline-none rounded-xl text-sm transition-all disabled:opacity-60"
                dir="ltr"
              />
            </div>

            {user?.role === 'receptionist' && (
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{t.phoneLabel}</label>
                <input
                  type="text" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-250 focus:border-primary focus:bg-white outline-none rounded-xl text-sm transition-all"
                  dir="ltr"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">
                {user?.role === 'admin' ? t.passLabelAdmin : t.passLabel}
              </label>
              <input
                type="password"
                required={user?.role !== 'admin'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-250 focus:border-primary focus:bg-white outline-none rounded-xl text-sm transition-all"
                dir="ltr"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={saving}
                className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{t.saveBtn}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side Cards (Language & Audio) */}
        <div className="space-y-8">
          
          {/* Language Selection Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-outfit text-lg font-bold text-gray-900">{t.langTitle}</h3>
                <p className="text-xs text-gray-400">{t.langSub}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">{t.selectLang}</label>
                <select
                  value={lang}
                  onChange={e => handleLanguageChange(e.target.value as 'ar' | 'en')}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-teal-500 focus:bg-white outline-none rounded-xl text-sm font-bold transition-all text-start"
                >
                  <option value="ar">{t.arabic}</option>
                  <option value="en">{t.english}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audio / Notification Sound Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-outfit text-lg font-bold text-gray-900">{t.audioTitle}</h3>
                <p className="text-xs text-gray-400">{t.audioSub}</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-sm font-bold text-gray-800 block">{t.enableSound}</span>
                  <span className="text-[10px] text-gray-400">{t.enableSoundSub}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={e => setSoundEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                </label>
              </div>

              {/* Sound Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">{t.chimeLabel}</label>
                <select
                  disabled={!soundEnabled}
                  value={soundType}
                  onChange={e => setSoundType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-secondary focus:bg-white outline-none rounded-xl text-sm transition-all disabled:opacity-50 text-start"
                >
                  <option value="double_beep">ثنائية سريعة (Double Beep)</option>
                  <option value="soft_chime">رنين هادئ وجميل (Soft Chime)</option>
                  <option value="alert_bell">جرس تنبيه قوي (Alert Bell)</option>
                  <option value="digital_ring">رنين رقمي كلاسيكي (Digital Ring)</option>
                </select>
              </div>

              {/* Volume slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
                  <span>{t.volumeLabel}</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  disabled={!soundEnabled}
                  value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary disabled:opacity-50"
                />
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={testSound}
                  disabled={!soundEnabled}
                  className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{t.testSoundBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSoundSettings}
                  className="py-3 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.saveAudioBtn}</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
