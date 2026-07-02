'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileText, ArrowLeft } from 'lucide-react';
import '../globals.css';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-gray-150 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <div className="flex items-center gap-3">
            <Image src="/emc-logo.jpg" alt="EMC Logo" width={48} height={48} className="rounded-xl object-contain border border-gray-100" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">شروط وأحكام الخدمة</h1>
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
              <FileText className="w-4 h-4 text-primary" />
              <span>شروط الاستخدام</span>
            </h2>
            <p>
              مرحباً بكم في الموقع الإلكتروني لعيادة مصر الطبية (EMC). يرجى قراءة هذه الشروط بتمعن قبل استخدام الموقع لحجز المواعيد أو تصفح معلومات الأطباء. دخولك واستخدامك للموقع يعني موافقتك الكاملة والالتزام بهذه الشروط.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">1. شروط حجز المواعيد</h2>
            <ul className="list-disc list-inside pr-4 space-y-1">
              <li>يجب على المستخدم إدخال بيانات صحيحة ودقيقة (الاسم، ورقم الهاتف، والبريد الإلكتروني) لإتمام عملية الحجز.</li>
              <li>العيادة غير مسؤولة عن فشل عملية الحجز أو عدم إرسال إشعارات التأكيد في حال إدخال بيانات خاطئة أو غير مكتملة.</li>
              <li>الحجز عبر الموقع يعتبر طلباً مبدئياً للموعد؛ ويتم إرسال بريد إلكتروني تلقائي لتأكيد الموعد أو إمكانية إلغائه.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">2. سياسة التأكيد والإلغاء</h2>
            <ul className="list-disc list-inside pr-4 space-y-1">
              <li>يتلقى المريض رابطاً عبر البريد الإلكتروني يحتوي على خيار "تأكيد الحجز" أو "إلغاء الحجز".</li>
              <li>نحن نقدر إعلامنا بإلغاء الحجز في وقت مبكر (قبل 24 ساعة على الأقل من الموعد المحدد) ليتسنى لمرضى آخرين الاستفادة من الموعد.</li>
              <li>تحتفظ العيادة بالحق في تعديل أو إلغاء الحجز لأسباب طارئة تتعلق بجدول الطبيب مع إعلام المريض هاتفياً في أسرع وقت.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">3. إخلاء المسؤولية الطبية</h2>
            <p>
              المعلومات المنشورة على هذا الموقع (مثل التخصصات، مقالات النصائح الطبية، السير الذاتية للأطباء) هي لأغراض إرشادية وتثقيفية فقط. لا تعتبر هذه المعلومات استشارة طبية مهنية أو تشخيصاً للحالة. يجب دائماً زيارة الطبيب المختص في العيادة لتلقي التشخيص والعلاج الطبي السليم.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">4. السلوك المقبول والاستخدام المصرح به</h2>
            <p>
              يوافق المستخدم على عدم استخدام الموقع لأي أغراض غير قانونية، أو إرسال بيانات وهمية، أو محاولة تعطيل خوادم الموقع وقاعدة البيانات الخاصة بالعيادة.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">5. حقوق الملكية الفكرية</h2>
            <p>
              جميع المحتويات المنشورة على هذا الموقع (مثل النصوص، الشعارات، الصور، الكود البرمجي، الواجهات) هي ملك لعيادة مصر الطبية ومحمية بموجب قوانين الملكية الفكرية. لا يجوز نسخ أو استخدام أي محتوى دون إذن كتابي مسبق من إدارة العيادة.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-900">6. تعديل الشروط والأحكام</h2>
            <p>
              نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. وتصبح التعديلات سارية المفعول فور نشرها على هذه الصفحة. يرجى مراجعة هذه الصفحة بانتظام للاطلاع على أي تحديثات.
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
