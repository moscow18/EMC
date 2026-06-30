'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useScrollAnimation } from '@/hooks/useAnimations';
import { useRateLimit } from '@/hooks/useRateLimit';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { isValidEgyptianPhone, isValidEmail, sanitizeFormData } from '@/lib/validation';

export default function ContactSection() {
  const t = useTranslations('Contact');
  const locale = useLocale();
  const { ref, isVisible } = useScrollAnimation();
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success'>('idle');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { canSubmit, remainingSeconds, checkAndRecord } = useRateLimit('contact');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = locale === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = locale === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
    }

    if (formData.phone && !isValidEgyptianPhone(formData.phone)) {
      newErrors.phone = locale === 'ar' ? 'رقم الهاتف غير صحيح (مثال: 01xxxxxxxxx)' : 'Invalid phone number (e.g., 01xxxxxxxxx)';
    }

    if (!formData.message.trim()) {
      newErrors.message = locale === 'ar' ? 'الرسالة مطلوبة' : 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!checkAndRecord()) return;

    setFormState('sending');

    const sanitized = sanitizeFormData(formData);

    const { error } = await supabase
      .from('contacts')
      .insert({
        name: sanitized.name,
        email: sanitized.email,
        phone: sanitized.phone,
        subject: sanitized.subject,
        message: sanitized.message,
      });

    if (error) {
      console.error(error);
      setFormState('idle');
      alert(locale === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again');
    } else {
      setFormState('success');
      setErrors({});
    }
  };

  const contactInfo = [
    { icon: MapPin, label: t('address'), value: t('addressValue'), color: '#EF4444', href: 'https://www.google.com/maps/search/?api=1&query=30.0863833,31.3323063' },
    { icon: Phone, label: t('phone'), value: '01044437797 - 0224521848', color: '#0070CD', href: 'tel:+201044437797' },
    { icon: Mail, label: t('email'), value: 'emc.egypt12@gmail.com', color: '#8B5CF6', href: 'mailto:emc.egypt12@gmail.com' },
    { icon: Clock, label: t('workingHours'), value: t('workingHoursValue'), color: '#10B981' },
  ];

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border ${
      errors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-[#0070CD] focus:ring-[#0070CD]/10'
    } focus:ring-2 outline-none text-sm transition-all`;

  return (
    <section id="contact" ref={ref} className="section-padding bg-[#F4F6F7]" aria-label={locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((info, idx) => {
              const Icon = info.icon;
              const content = (
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#0070CD]/20 hover:shadow-md transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${info.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: info.color }} />
                  </div>
                  <div>
                    <p className="text-[12px] text-gray-400 font-medium mb-0.5">{info.label}</p>
                    <p className="text-[14px] text-[#1A1A2E] font-semibold">{info.value}</p>
                  </div>
                </div>
              );
              return info.href ? (
                <a key={idx} href={info.href} target="_blank" rel="noopener noreferrer" className="block" aria-label={info.label}>{content}</a>
              ) : (
                <div key={idx}>{content}</div>
              );
            })}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            {formState === 'success' ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#10B981]" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">{t('successTitle')}</h3>
                <p className="text-gray-500 mb-6">{t('successMessage')}</p>
                <button
                  onClick={() => { setFormState('idle'); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="vez-btn-primary"
                  aria-label={t('sendAnother')}
                >
                  {t('sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-4" noValidate>
                {/* Rate limit warning */}
                {!canSubmit && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>
                      {locale === 'ar'
                        ? `لقد أرسلت عدة رسائل. يرجى الانتظار ${remainingSeconds} ثانية.`
                        : `Too many submissions. Please wait ${remainingSeconds} seconds.`}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder={t('namePlaceholder')}
                      value={formData.name}
                      onChange={e => { setFormData(prev => ({ ...prev, name: e.target.value })); setErrors(prev => ({ ...prev, name: '' })); }}
                      className={inputClass('name')}
                      aria-label={t('namePlaceholder')}
                      id="contact-name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={formData.email}
                      onChange={e => { setFormData(prev => ({ ...prev, email: e.target.value })); setErrors(prev => ({ ...prev, email: '' })); }}
                      className={inputClass('email')}
                      aria-label={t('emailPlaceholder')}
                      id="contact-email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      value={formData.phone}
                      onChange={e => { setFormData(prev => ({ ...prev, phone: e.target.value })); setErrors(prev => ({ ...prev, phone: '' })); }}
                      className={inputClass('phone')}
                      aria-label={t('phonePlaceholder')}
                      id="contact-phone"
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder={t('subjectPlaceholder')}
                      value={formData.subject}
                      onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className={inputClass('subject')}
                      aria-label={t('subjectPlaceholder')}
                      id="contact-subject"
                    />
                  </div>
                </div>
                <div>
                  <textarea
                    required
                    rows={4}
                    placeholder={t('messagePlaceholder')}
                    value={formData.message}
                    onChange={e => { setFormData(prev => ({ ...prev, message: e.target.value })); setErrors(prev => ({ ...prev, message: '' })); }}
                    className={`${inputClass('message')} resize-none`}
                    aria-label={t('messagePlaceholder')}
                    id="contact-message"
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1 font-medium">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={formState === 'sending' || !canSubmit}
                  className="vez-btn-primary w-full sm:w-auto disabled:opacity-70"
                  aria-label={formState === 'sending' ? t('sending') : t('submit')}
                  id="contact-submit"
                >
                  <Send className="w-4 h-4" />
                  {formState === 'sending' ? t('sending') : t('submit')}
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Large Embedded Google Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 rounded-[32px] overflow-hidden border border-gray-100 shadow-xl h-96 relative bg-white p-2"
        >
          <iframe
            title="EMC Clinic Google Map Location"
            src="https://maps.google.com/maps?q=30.0863833,31.3323063&z=15&output=embed"
            className="w-full h-full rounded-[24px]"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}
