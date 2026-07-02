'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Shield, ArrowLeft } from 'lucide-react';
import '../globals.css';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-gray-150 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <Image src="/emc-logo.jpg" alt="EMC Logo" width={48} height={48} className="rounded-xl object-contain border border-gray-100" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">سياسة الخصوصية</h1>
              <p className="text-xs text-gray-400">آخر تحديث: يوليو 2026</p>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline">
            <span>الرئيسية</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm leading-relaxed text-gray-600">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>مقدمة عامة</span>
            </h2>
            <p>
              مرحباً بكم في عيادة مصر الطبية (EMC). نحن ملتزمون تماماً بحماية خصوصية بياناتكم الشخصية والطبية. توضح هذه السياسة كيفية جمع بياناتكم، واستخدامها، وحمايتها عند زيارة موقعنا الإلكتروني أو استخدام خدمات حجز المواعيد لدينا.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. البيانات التي نجمعها</h2>
            <p>عند استخدام موقعنا الإلكتروني لحجز موعد طبي، قد نطلب منك تزويدنا بالبيانات التالية:</p>
            <ul className="list-disc list-inside pr-4 space-y-1">
              <li>الاسم بالكامل.</li>
              <li>رقم الهاتف (للتواصل وتأكيد الحجز).</li>
              <li>البريد الإلكتروني (لإرسال إشعارات التأكيد والإلغاء).</li>
              <li>اسم الطبيب والتخصص المطلوب.</li>
              <li>أي ملاحظات إضافية ترغب في إضافتها للطبيب.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. تسجيل الدخول عبر Google OAuth</h2>
            <p>
              عندما تختار تسجيل الدخول أو التسجيل في موقعنا باستخدام حساب Google، فإننا نصل فقط إلى معلومات الملف الشخصي الأساسية والمسموح بها من قبلكم (الاسم، البريد الإلكتروني، وصورة الملف الشخصي).
            </p>
            <p className="font-semibold text-gray-800">كيف نستخدم بيانات Google؟</p>
            <ul className="list-disc list-inside pr-4 space-y-1">
              <li>لتسهيل عملية تسجيل الدخول وتجنب إنشاء كلمة مرور جديدة.</li>
              <li>لربط حسابك بجدول مواعيد الحجوزات الطبية الخاصة بك في العيادة.</li>
              <li>لن نقوم أبداً بمشاركة بيانات حساب Google الخاص بك مع أي طرف ثالث لأغراض تسويقية أو تجارية.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. كيف نستخدم بياناتك</h2>
            <p>نستخدم البيانات التي نجمعها للأغراض التالية:</p>
            <ul className="list-disc list-inside pr-4 space-y-1">
              <li>تأكيد وتنظيم مواعيد الحجوزات الطبية الخاصة بك في العيادة.</li>
              <li>إرسال رسائل بريد إلكتروني تلقائية لتأكيد الموعد أو إلغائه بناءً على طلبك.</li>
              <li>التواصل معك هاتفياً في حال حدوث أي تعديل طارئ في مواعيد الطبيب.</li>
              <li>تحسين جودة الخدمات الطبية المقدمة في العيادة.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">4. حماية وأمن البيانات</h2>
            <p>
              نحن نطبق معايير أمان صارمة لحماية بياناتك من الوصول غير المصرح به، أو التغيير، أو الإفصاح. يتم تخزين جميع البيانات بأمان عبر تشفير قواعد البيانات السحابية الموثوقة.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">5. ملفات تعريف الارتباط (Cookies)</h2>
            <p>
              نستخدم ملفات تعريف الارتباط لتحسين تجربة تصفحك للموقع، ولحفظ جلسة تسجيل الدخول الخاصة بك بشكل آمن أثناء استخدام لوحة التحكم.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">6. التواصل معنا</h2>
            <p>
              إذا كان لديك أي استفسار أو مخاوف بشأن سياسة الخصوصية الخاصة بنا، يمكنك التواصل معنا عبر البريد الإلكتروني المخصص للدعم: 
              <span className="font-bold text-primary mr-1">emc.egypt12@gmail.com</span> أو هاتفياً على رقم <span className="font-bold text-primary">01044437797</span>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          <p>© 2026 عيادة مصر الطبية EMC. جميع الحقوق محفوظة.</p>
        </div>

      </div>
    </div>
  );
}
