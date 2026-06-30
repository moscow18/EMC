'use client';

import { use, useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, Clock, MapPin, Calendar, Check, ChevronLeft, ChevronRight, AlertCircle, User, Phone, Mail, MessageSquare, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { doctors } from '@/data/doctors';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidEgyptianPhone, isValidEmail } from '@/lib/validation';
import { useRateLimit } from '@/hooks/useRateLimit';
import { useToast } from '@/components/ui/Toast';

interface DoctorDetails {
  about: { ar: string; en: string };
  exp: { ar: string[]; en: string[] };
  edu: { ar: string[]; en: string[] };
}

const specialtyDetails: Record<string, DoctorDetails> = {
  ent: {
    about: {
      ar: "استشاري أول جراحات الأذن والأنف والحنجرة، متخصص في مناظير الجيوب الأنفية، وجراحات الحنجرة والأحبال الصوتية، وعلاج مشاكل السمع والاتزان، وتعديل الحاجز الأنفي بالمنظار.",
      en: "Senior Consultant in ENT surgery, specializing in sinus endoscopy, laryngeal and vocal cord surgery, and treating hearing and balance disorders with nasal septoplasty."
    },
    exp: {
      ar: [
        "رئيس قسم الأنف والأذن والحنجرة بمستشفى عين شمس (سابقاً)",
        "عضو الجمعية المصرية لجراحي الأنف والأذن والحنجرة",
        "مستشار طبي في العديد من المستشفيات الكبرى بالقاهرة"
      ],
      en: [
        "Former Head of ENT Department at Ain Shams Hospital",
        "Member of the Egyptian Society of Otorhinolaryngology",
        "Medical Consultant at several leading Cairo hospitals"
      ]
    },
    edu: {
      ar: [
        "دكتوراه الأنف والأذن والحنجرة - جامعة عين شمس",
        "زمالة كلية الجراحين الملكية - إنجلترا",
        "ماجستير طب وجراحة الأذن والأنف والحنجرة - جامعة القاهرة"
      ],
      en: [
        "PhD in Otorhinolaryngology - Ain Shams University",
        "Fellowship of the Royal College of Surgeons (FRCS) - England",
        "Master's Degree in Otolaryngology - Cairo University"
      ]
    }
  },
  gynecology: {
    about: {
      ar: "استشارية أمراض النساء والتوليد وتأخر الإنجاب، متخصصة في متابعة الحمل الحرج، وجراحات المناظير النسائية، وعلاج تكيس المبايض، وعمليات الولادة القيصرية بدون ألم.",
      en: "Consultant of Obstetrics & Gynecology, specializing in high-risk pregnancy monitoring, gynecological endoscopy, PCOS treatment, and painless Caesarean sections."
    },
    exp: {
      ar: [
        "استشارية توليد بمستشفى الجلاء التعليمي",
        "عضو الجمعية الأوروبية لعلم التكاثر البشري والأجنة (ESHRE)",
        "مؤسس وحدة رعاية الأمومة والطفولة في عيادات إيجيبت ميديكال"
      ],
      en: [
        "Consultant OB/GYN at Al-Galaa Teaching Hospital",
        "Member of the European Society of Human Reproduction and Embryology (ESHRE)",
        "Founder of the Maternity Care Unit at Egypt Medical Clinics"
      ]
    },
    edu: {
      ar: [
        "ماجستير أمراض النساء والتوليد - جامعة القاهرة",
        "دبلوم المناظير النسائية المتقدمة - جامعة كيل، ألمانيا",
        "بكالوريوس الطب والجراحة - قصر العيني"
      ],
      en: [
        "Master's Degree in Obstetrics & Gynecology - Cairo University",
        "Advanced Diploma in Gynecological Endoscopy - Kiel University, Germany",
        "Bachelor of Medicine and Surgery - Kasr Al-Ainy"
      ]
    }
  },
  urology: {
    about: {
      ar: "استشاري أول جراحة المسالك البولية وأمراض الذكورة والعقم، متخصص في تفتيت الحصوات بالليزر، وعلاج تضخم البروستاتا بالمناظير، وعلاج العقم والضعف الجنسي.",
      en: "Senior Consultant in Urology, Andrology & Infertility, specializing in laser lithotripsy for stones, endoscopic prostate surgery, and male infertility treatment."
    },
    exp: {
      ar: [
        "أستاذ جراحة المسالك البولية المساعد بكلية الطب",
        "عضو الجمعية الأمريكية والمسالك البولية (AUA)",
        "رئيس وحدة المسالك البولية وجراحات اليوم الواحد بالعيادة"
      ],
      en: [
        "Associate Professor of Urology at Faculty of Medicine",
        "Member of the American Urological Association (AUA)",
        "Head of Urology and Daycare Surgery Unit at the clinic"
      ]
    },
    edu: {
      ar: [
        "دكتوراه جراحة المسالك البولية - جامعة القاهرة",
        "زمالة جراحات مناظير المسالك - جامعة بوردو، فرنسا",
        "بكالوريوس الطب قصر العيني"
      ],
      en: [
        "PhD in Urological Surgery - Cairo University",
        "Fellowship in Endourology - Bordeaux University, France",
        "Bachelor of Medicine - Kasr Al-Ainy"
      ]
    }
  },
  internal: {
    about: {
      ar: "أخصائي الأمراض الباطنية العامة وأمراض الكلى، يركز على تشخيص وعلاج الأمراض المزمنة مثل السكري وضغط الدم والاعتلال الكلوي وتقديم برامج وقائية متكاملة.",
      en: "Specialist in Internal Medicine & Nephrology, focusing on diagnosing and treating chronic diseases like diabetes, hypertension, renal disorders, and preventative care."
    },
    exp: {
      ar: [
        "أخصائي أمراض الكلى والباطنة بمستشفى الدمرداش الجامعي",
        "عضو الجمعية المصرية لأمراض الكلى وزراعتها",
        "مشرف العيادات العامة في إيجيبت ميديكال"
      ],
      en: [
        "Nephrology & Internal Medicine Specialist at Demerdash University Hospital",
        "Member of the Egyptian Society of Nephrology and Transplantation",
        "Supervisor of General Medical Services at Egypt Medical"
      ]
    },
    edu: {
      ar: [
        "ماجستير الباطنة العامة وأمراض الكلى - جامعة عين شمس",
        "الزمالة المصرية للأمراض الباطنية",
        "بكالوريوس الطب قصر العيني"
      ],
      en: [
        "Master's in Internal Medicine & Nephrology - Ain Shams University",
        "Egyptian Board Fellowship in Internal Medicine",
        "Bachelor of Medicine - Kasr Al-Ainy"
      ]
    }
  },
  cardiology: {
    about: {
      ar: "استشاري أمراض القلب والأوعية الدموية، متخصص في تصوير القلب والموجات الصوتية (الإيكو)، رسم القلب بالمجهود، ومتابعة حالات قصور الشرايين التاجية وضعف القلب.",
      en: "Consultant of Cardiology and Vascular Medicine, specializing in echocardiography, stress ECG, coronary artery disease management, and heart failure therapy."
    },
    exp: {
      ar: [
        "استشاري القلب بمعهد القلب القومي بمصر",
        "عضو الجمعية الأوروبية لأمراض القلب (ESC)",
        "عضو الجمعية المصرية لأمراض القلب"
      ],
      en: [
        "Consultant Cardiologist at the National Heart Institute of Egypt",
        "Fellow of the European Society of Cardiology (ESC)",
        "Member of the Egyptian Society of Cardiology"
      ]
    },
    edu: {
      ar: [
        "دكتوراه أمراض القلب والأوعية الدموية - جامعة القاهرة",
        "ماجستير طب القلب والأوعية الدموية",
        "بكالوريوس الطب والجراحة العامة"
      ],
      en: [
        "PhD in Cardiology & Vascular Diseases - Cairo University",
        "Master's Degree in Cardiovascular Medicine",
        "Bachelor of Medicine and Surgery"
      ]
    }
  }
};

function getSpecialtyDetails(category: string): DoctorDetails {
  const custom = specialtyDetails[category];
  if (custom) return custom;
  
  // Fallback for general categories
  return {
    about: {
      ar: `استشاري متخصص يمتلك مسيرة مهنية متميزة في عيادات إيجيبت ميديكال، ملتزم بتقديم رعاية صحية متقدمة وتشخيص دقيق باستخدام أحدث الأجهزة العلاجية.`,
      en: `Specialized Consultant with an outstanding career at Egypt Medical Clinics, dedicated to delivering advanced healthcare and accurate diagnosis utilizing modern therapeutic protocols.`
    },
    exp: {
      ar: [
        "استشاري متميز بالعديد من المستشفيات الجامعية والتعليمية بمصر",
        "عضو الجمعية الطبية التخصصية للرعاية والبحث العلمي",
        "حضور ومشاركة في العديد من المؤتمرات والندوات الطبية المحلية والدولية"
      ],
      en: [
        "Distinguished consultant at major university and teaching hospitals in Egypt",
        "Member of the Medical Specialty Society for Research & Clinical Care",
        "Presenter and participant in domestic and international medical conferences"
      ]
    },
    edu: {
      ar: [
        "شهادة الدكتوراه في التخصص الطبي الدقيق من الجامعات المصرية العريقة",
        "شهادات الزمالة وعضوية الكليات الملكية الدولية",
        "ترخيص طبي موثق لممارسة الاستشارات الطبية والجراحية"
      ],
      en: [
        "Doctorate degree (MD/PhD) in the medical specialty from accredited universities",
        "Fellowship degrees and memberships in international Royal Colleges",
        "Certified clinical license for medical and surgical consultancy"
      ]
    }
  };
}

// Generate next 7 days starting from today, checking that the clinic isn't closed (Fridays are empty slots)
function getNext7Days(locale: string, doctorSchedule?: Record<string, string[]>) {
  const days = [];
  const daysOfWeekEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysOfWeekAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsAr = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayIndex = d.getDay(); // 0 is Sunday, 5 is Friday, etc.
    const dayNameEn = daysOfWeekEn[dayIndex];
    
    const dayName = locale === 'ar' ? daysOfWeekAr[dayIndex] : daysOfWeekEn[dayIndex];
    const monthName = locale === 'ar' ? monthsAr[d.getMonth()] : monthsEn[d.getMonth()];
    
    // ISO date for Supabase
    const isoDate = d.toISOString().split('T')[0];
    
    // Formatting date string for booking confirmation
    const formattedDate = locale === 'ar' 
      ? `${dayName}، ${d.getDate()} ${monthName} ${d.getFullYear()}`
      : `${dayName}, ${monthsEn[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;

    let slots: string[] = [];
    let isClosed = false;

    if (doctorSchedule && Object.keys(doctorSchedule).length > 0) {
      slots = doctorSchedule[dayNameEn] || [];
      isClosed = slots.length === 0;
    } else {
      isClosed = dayIndex === 5; // Friday is closed by default
      slots = isClosed ? [] : ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '07:00 PM', '08:30 PM'];
    }

    days.push({
      id: `day-${i}`,
      dayName,
      dayNum: d.getDate(),
      monthName,
      formattedDate,
      isoDate,
      isClosed,
      slots
    });
  }
  return days;
}

import { supabase } from '@/lib/supabase';
export default function DoctorProfilePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const id = resolvedParams.id;
  const { showToast } = useToast();

  const t = useTranslations('Doctors');
  const tSpec = useTranslations('Specialties');
  
  // States
  const [doctor, setDoctor] = useState<any>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [bookingDays, setBookingDays] = useState<any[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'select' | 'form' | 'sending' | 'success'>('select');
  const [showError, setShowError] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [bookingResult, setBookingResult] = useState<{ appointmentId: string; message: string } | null>(null);
  const { canSubmit, remainingSeconds, checkAndRecord } = useRateLimit('booking');
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([]);

  const loadBookedAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', id)
        .neq('status', 'cancelled');
      if (data && !error) {
        setBookedAppointments(data);
      }
    } catch (err) {
      console.error('Error fetching booked appointments:', err);
    }
  };

  useEffect(() => {
    loadBookedAppointments();
  }, [id]);

  useEffect(() => {
    async function loadDoctor() {
      setLoadingDoctor(true);
      
      // 1. Check static doctors first
      const staticDoc = doctors.find(doc => doc.id === id);
      if (staticDoc) {
        setDoctor(staticDoc);
        setLoadingDoctor(false);
        return;
      }

      // 2. Query Supabase
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', id)
          .single();

        if (data && !error) {
          setDoctor({
            id: data.id,
            department_id: data.department_id,
            nameKey: data.name,
            specialtyKey: data.specialty,
            locationKey: locale === 'en' ? 'Heliopolis, Cairo' : 'مصر الجديدة، القاهرة',
            rating: data.rating || 4.8,
            reviews: 120,
            fees: data.consultation_fee || 300,
            waitTime: 15,
            category: data.specialty.toLowerCase().includes('نساء') || data.specialty.toLowerCase().includes('gynecology') ? 'gynecology' :
                      data.specialty.toLowerCase().includes('مسالك') || data.specialty.toLowerCase().includes('urology') ? 'urology' :
                      data.specialty.toLowerCase().includes('عظام') || data.specialty.toLowerCase().includes('ortho') ? 'orthopedics' : 'ent',
            bookingType: 'firstCome',
            image: data.image_url || ((data.name_ar || '').includes('منى') || (data.name_ar || '').includes('سارة') || (data.name_ar || '').includes('فاطمة') || (data.name_ar || '').includes('نادية') || (data.name_ar || '').includes('نادين') ? '/doctor_female.png' : '/doctor_male.png'),
            isFromDb: true,
            name: data.name,
            nameAr: data.name_ar,
            specialty: data.specialty
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDoctor(false);
      }
    }
    loadDoctor();
  }, [id, locale]);

  useEffect(() => {
    setBookingDays(getNext7Days(locale, doctor?.schedule));
  }, [locale, doctor]);

  useEffect(() => {
    async function prefillUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setPatientForm(prev => ({
          ...prev,
          name: session.user.user_metadata?.full_name || prev.name || '',
          email: session.user.email || prev.email || '',
        }));
      }
    }
    prefillUser();
  }, []);

  if (loadingDoctor) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] text-gray-700 p-6 pt-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p>{locale === 'en' ? 'Loading Doctor Profile...' : 'جاري تحميل ملف الطبيب...'}</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!doctor) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] text-gray-800 p-6 pt-32">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {locale === 'en' ? 'Doctor Not Found' : 'الطبيب غير موجود'}
          </h1>
          <p className="text-gray-400 mb-8 max-w-sm text-center">
            {locale === 'en' 
              ? 'The doctor profile you are trying to access does not exist or has been moved.' 
              : 'الملف الشخصي للطبيب الذي تحاول الوصول إليه غير موجود أو تم نقله.'}
          </p>
          <Link href={`/${locale}/doctors`} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors">
            {locale === 'en' ? 'Back to Directory' : 'العودة لدليل الأطباء'}
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const docDetails = doctor.isFromDb ? {
    about: {
      ar: doctor.description || "استشاري متميز في عيادة مصر الطبية.",
      en: doctor.description || "Distinguished consultant at Egypt Medical Clinic."
    },
    exp: {
      ar: [
        locale === 'ar' ? `استشاري ${doctor.specialty} في عيادتنا` : `Consultant of ${doctor.specialty} at our clinic`,
        locale === 'ar' ? `عضو الجمعية الطبية التخصصية` : `Member of the specialty medical association`
      ],
      en: [
        `Consultant of ${doctor.specialty} at our clinic`,
        `Member of the specialty medical association`
      ]
    },
    edu: {
      ar: [
        doctor.education || (locale === 'ar' ? "شهادة طبية معتمدة في التخصص" : "Accredited medical degree in specialty")
      ],
      en: [
        doctor.education || "Accredited medical degree in specialty"
      ]
    }
  } : getSpecialtyDetails(doctor.category);
  const currentDay = bookingDays[selectedDayIndex];

  const doctorName = doctor.isFromDb
    ? (locale === 'ar' ? (doctor.nameAr || doctor.name) : doctor.name)
    : t(doctor.nameKey);

  const doctorSpecialty = doctor.isFromDb
    ? doctor.specialty
    : t(doctor.specialtyKey);

  const cleanDoctorName = doctor.isFromDb
    ? doctor.name
    : t(doctor.nameKey).replace('Dr. ', '');

  const handleContinueToForm = () => {
    if (!selectedSlot) {
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
      return;
    }
    setBookingStep('form');
  };

  const validatePatientForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!patientForm.name.trim()) {
      errs.name = locale === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }

    if (!patientForm.phone.trim()) {
      errs.phone = locale === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone is required';
    } else if (!isValidEgyptianPhone(patientForm.phone)) {
      errs.phone = locale === 'ar' ? 'رقم الهاتف غير صحيح (مثال: 01xxxxxxxxx)' : 'Invalid phone (e.g., 01xxxxxxxxx)';
    }

    if (patientForm.email && !isValidEmail(patientForm.email)) {
      errs.email = locale === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBooking = async () => {
    if (!validatePatientForm()) return;
    if (!checkAndRecord()) return;

    setBookingStep('sending');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientForm.name,
          phone: patientForm.phone,
          email: patientForm.email || undefined,
          doctor_name: doctorName,
          doctor_id: doctor.id,
          department_id: doctor.department_id,
          department: tSpec(doctor.category),
          appointment_date: currentDay?.isoDate,
          appointment_time: selectedSlot,
          message: patientForm.message || undefined,
          locale,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      setBookingResult({
        appointmentId: data.appointmentId,
        message: data.message,
      });
      setBookingStep('success');
      loadBookedAppointments();
    } catch (err: any) {
      console.error('Booking error:', err);
      setBookingStep('form');
      showToast(
        locale === 'ar' ? `حدث خطأ: ${err.message}` : `Error: ${err.message}`,
        'error'
      );
    }
  };

  const resetBooking = () => {
    setBookingStep('select');
    setSelectedSlot(null);
    setPatientForm({ name: '', phone: '', email: '', message: '' });
    setFormErrors({});
    setBookingResult(null);
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border ${
      formErrors[field]
        ? 'border-red-400 bg-red-50 focus:border-red-500'
        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary'
    } text-gray-800 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-primary/10`;

  return (
    <>
      <Navbar />
      
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#F0F7FF] via-[#E6F0FA] to-[#F5F9FF] pt-32 pb-0 relative overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[#0070CD]/5 blur-[80px] pointer-events-none z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-end justify-between">
          
          <div className="text-[#1A1A2E] pb-16 w-full md:w-2/3 text-start">
            <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full mb-3 shadow-sm">
              {tSpec(doctor.category)}
            </div>
            <h1 className="text-3xl md:text-5xl font-outfit font-bold mb-3 tracking-tight">
              {doctorName}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-medium max-w-xl leading-relaxed">
              {doctorSpecialty}
            </p>
          </div>
          
          <div className="w-full md:w-1/3 flex justify-center md:justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={doctor.image} 
              alt={doctorName} 
              className="w-72 h-72 md:w-[320px] md:h-[320px] object-cover object-top rounded-t-3xl border-b-4 border-primary drop-shadow-[0_0_30px_rgba(0,112,205,0.15)]"
              style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
            />
          </div>
          
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#F8F9FA] text-[#1A1A2E] min-h-screen pb-20 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-light to-primary"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative flex flex-col lg:flex-row gap-12">
          
          {/* Left Details */}
          <div className="w-full lg:w-2/3 space-y-12 text-start">
            
            {/* About */}
            <section>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-4 border-b-2 border-primary inline-block pb-1 tracking-wide">
                {locale === 'en' ? `About Dr. ${cleanDoctorName}` : `عن الدكتور`}
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {locale === 'en' ? docDetails.about.en : docDetails.about.ar}
              </p>
            </section>
            
            {/* Experience & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-xl font-bold text-[#1A1A2E] mb-4 border-b-2 border-primary inline-block pb-1 tracking-wide">
                  {locale === 'en' ? 'Professional Experience' : 'الخبرة المهنية'}
                </h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2.5 text-sm sm:text-base marker:text-primary">
                  {(locale === 'en' ? docDetails.exp.en : docDetails.exp.ar).map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-bold text-[#1A1A2E] mb-4 border-b-2 border-primary inline-block pb-1 tracking-wide">
                  {locale === 'en' ? 'Education & Certifications' : 'التعليم والشهادات'}
                </h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2.5 text-sm sm:text-base marker:text-primary">
                  {(locale === 'en' ? docDetails.edu.en : docDetails.edu.ar).map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Quick Details */}
            <section className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                  {locale === 'en' ? 'Consultation Fee' : 'قيمة الكشف'}
                </p>
                <p className="text-xl font-extrabold text-primary">{doctor.fees} {t('egp')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                  {locale === 'en' ? 'Waiting Time' : 'مدة الانتظار'}
                </p>
                <p className="text-xl font-extrabold text-[#1A1A2E]">{doctor.waitTime} {locale === 'en' ? 'Mins' : 'دقيقة'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                  {locale === 'en' ? 'Rating' : 'التقييم'}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-[#FFB300] fill-[#FFB300]" />
                  <span className="text-xl font-extrabold text-[#1A1A2E]">{doctor.rating}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                  {locale === 'en' ? 'Booking' : 'نظام الحجز'}
                </p>
                <p className="text-sm font-bold text-[#1A1A2E] mt-1.5">
                  {doctor.bookingType === 'firstCome' ? t('firstCome') : t('byAppointment')}
                </p>
              </div>
            </section>

            {/* Patient Reviews */}
            <section>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-6 border-b-2 border-primary inline-block pb-1 tracking-wide">
                {locale === 'en' ? 'Patient Reviews' : 'آراء المرضى'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    ar_r: 'دكتور ممتاز جداً ومهتم بكل التفاصيل. الكشف بدأ في الموعد والعيادة مجهزة على أعلى مستوى.', 
                    en_r: 'Excellent doctor, highly professional and detailed. The consultation started exactly on time.', 
                    ar_n: 'أحمد م. (مريض موثق)', 
                    en_n: 'Ahmed M. (Verified Patient)' 
                  },
                  { 
                    ar_r: 'أفضل معاملة طبية تلقيتها. الدكتور متعاون جداً ويشرح الحالة بوضوح تام وراحة بال.', 
                    en_r: 'Highly knowledgeable. Explained my condition clearly and reassuringly.', 
                    ar_n: 'سارة أ. (مريض موثق)', 
                    en_n: 'Sarah A. (Verified Patient)' 
                  },
                  { 
                    ar_r: 'الخدمة ممتازة والانتظار لم يتعدى ١٠ دقائق. أنصح بالعيادة وبشدة لجميع أفراد الأسرة.', 
                    en_r: 'Super clean clinic and very professional reception staff. Waiting time was minimal.', 
                    ar_n: 'يوسف إ. (مريض موثق)', 
                    en_n: 'Youssef I. (Verified Patient)' 
                  }
                ].map((rev, i) => (
                  <div key={i} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:border-primary/20 transition-all text-start">
                    <div className="flex gap-1 mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      &quot;{locale === 'en' ? rev.en_r : rev.ar_r}&quot;
                    </p>
                    <p className="text-gray-400 text-xs font-bold">
                      - {locale === 'en' ? rev.en_n : rev.ar_n}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            
          </div>

          {/* Right Sidebar - Booking Widget */}
          <div className="w-full lg:w-1/3 relative lg:-top-24">
            <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-xl shadow-gray-200/40 sticky top-24">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-6 text-center">
                {locale === 'en' ? 'Book Appointment' : 'احجز موعد كشف'}
              </h3>

              {/* ──── Step 1: Select Date & Time ──── */}
              {bookingStep === 'select' && (
                <>
                  {/* Calendar Grid Header */}
                  {bookingDays.length > 0 && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
                        <button 
                          onClick={() => {
                            setSelectedDayIndex((prev) => Math.max(0, prev - 1));
                            setSelectedSlot(null);
                          }}
                          disabled={selectedDayIndex === 0}
                          className="p-1 hover:bg-gray-100 rounded-full text-gray-700 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          aria-label={locale === 'ar' ? 'اليوم السابق' : 'Previous day'}
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700 rtl:rotate-180" />
                        </button>
                        <span className="text-sm font-bold text-gray-800">
                          {bookingDays[selectedDayIndex].dayName} - {bookingDays[selectedDayIndex].dayNum} {bookingDays[selectedDayIndex].monthName}
                        </span>
                        <button 
                          onClick={() => {
                            setSelectedDayIndex((prev) => Math.min(bookingDays.length - 1, prev + 1));
                            setSelectedSlot(null);
                          }}
                          disabled={selectedDayIndex === bookingDays.length - 1}
                          className="p-1 hover:bg-gray-100 rounded-full text-gray-700 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          aria-label={locale === 'ar' ? 'اليوم التالي' : 'Next day'}
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700 rtl:rotate-180" />
                        </button>
                      </div>

                      {/* Horizontal Scroll Days List */}
                      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                        {bookingDays.map((day, idx) => (
                          <button
                            key={day.id}
                            onClick={() => {
                              setSelectedDayIndex(idx);
                              setSelectedSlot(null);
                            }}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl min-w-[64px] border transition-all duration-200 cursor-pointer ${
                              selectedDayIndex === idx
                                ? 'bg-primary border-primary text-white shadow-md shadow-primary/30'
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100/80'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{day.dayName.substring(0, 3)}</span>
                            <span className="text-base font-extrabold mt-0.5">{day.dayNum}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Slots */}
                  <div className="mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-start">
                      {locale === 'en' ? 'Available Time Slots' : 'مواعيد الحجز المتاحة'}
                    </p>
                    {currentDay?.isClosed ? (
                      <div className="py-8 bg-red-50 border border-red-100 rounded-2xl text-center text-red-500 text-sm font-medium">
                        {locale === 'en' 
                          ? 'Clinic closed on this day (Friday)' 
                          : 'العيادة مغلقة في هذا اليوم (الجمعة)'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {currentDay?.slots.map((slot: string) => {
                          const isBooked = bookedAppointments.some(
                            (appt: any) => appt.appointment_date === currentDay?.isoDate && appt.appointment_time === slot
                          );
                          return (
                            <button
                              key={slot}
                              disabled={isBooked}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-2.5 rounded-xl text-[12px] font-bold transition-all border ${
                                isBooked
                                  ? 'bg-gray-100 border-gray-150 text-gray-300 cursor-not-allowed line-through opacity-65'
                                  : selectedSlot === slot
                                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 font-extrabold scale-[1.03]'
                                  : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-primary/5 hover:border-primary/20'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Error warning */}
                  <AnimatePresence>
                    {showError && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-semibold text-center mb-4 flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{locale === 'en' ? 'Please select a time slot first!' : 'يرجى اختيار ميعاد حجز أولاً!'}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Continue Button */}
                  <button 
                    onClick={handleContinueToForm}
                    disabled={currentDay?.isClosed}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {locale === 'en' ? 'Continue — Enter Your Details' : 'متابعة — أدخل بياناتك'}
                  </button>
                </>
              )}

              {/* ──── Step 2: Patient Info Form ──── */}
              {(bookingStep === 'form' || bookingStep === 'sending') && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Selected summary */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-5 text-xs text-start">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">{locale === 'en' ? 'Date' : 'التاريخ'}</span>
                      <span className="text-primary font-bold">{currentDay?.formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{locale === 'en' ? 'Time' : 'الوقت'}</span>
                      <span className="text-primary font-bold">{selectedSlot}</span>
                    </div>
                  </div>

                  {/* Rate limit warning */}
                  {!canSubmit && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-600 mb-4">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        {locale === 'ar'
                          ? `لقد أرسلت عدة طلبات. انتظر ${remainingSeconds} ثانية.`
                          : `Too many requests. Wait ${remainingSeconds}s.`}
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Name */}
                    <div>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder={locale === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
                          value={patientForm.name}
                          onChange={e => { setPatientForm(prev => ({ ...prev, name: e.target.value })); setFormErrors(prev => ({ ...prev, name: '' })); }}
                          className={`${inputClass('name')} ps-10`}
                          id="booking-name"
                        />
                      </div>
                      {formErrors.name && <p className="text-red-500 text-[11px] mt-1 font-medium">{formErrors.name}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          placeholder={locale === 'ar' ? 'رقم الهاتف * (01xxxxxxxxx)' : 'Phone * (01xxxxxxxxx)'}
                          value={patientForm.phone}
                          onChange={e => { setPatientForm(prev => ({ ...prev, phone: e.target.value })); setFormErrors(prev => ({ ...prev, phone: '' })); }}
                          className={`${inputClass('phone')} ps-10`}
                          id="booking-phone"
                          dir="ltr"
                        />
                      </div>
                      {formErrors.phone && <p className="text-red-500 text-[11px] mt-1 font-medium">{formErrors.phone}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute start-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder={locale === 'ar' ? 'البريد الإلكتروني (لاستلام التأكيد)' : 'Email (for confirmation)'}
                          value={patientForm.email}
                          onChange={e => { setPatientForm(prev => ({ ...prev, email: e.target.value })); setFormErrors(prev => ({ ...prev, email: '' })); }}
                          className={`${inputClass('email')} ps-10`}
                          id="booking-email"
                          dir="ltr"
                        />
                      </div>
                      {formErrors.email && <p className="text-red-500 text-[11px] mt-1 font-medium">{formErrors.email}</p>}
                    </div>

                    {/* Message */}
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-gray-400 absolute start-3 top-3" />
                      <textarea
                        rows={2}
                        placeholder={locale === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional notes (optional)'}
                        value={patientForm.message}
                        onChange={e => setPatientForm(prev => ({ ...prev, message: e.target.value }))}
                        className={`${inputClass('message')} ps-10 resize-none`}
                        id="booking-message"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => setBookingStep('select')}
                      disabled={bookingStep === 'sending'}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm border border-gray-200 transition-colors disabled:opacity-50"
                    >
                      {locale === 'en' ? 'Back' : 'رجوع'}
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={bookingStep === 'sending' || !canSubmit}
                      className="flex-[2] py-3 bg-primary hover:bg-primary-dark text-white font-extrabold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {bookingStep === 'sending' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {locale === 'en' ? 'Booking...' : 'جارِ الحجز...'}
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          {locale === 'en' ? 'Confirm Booking' : 'تأكيد الحجز'}
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-gray-400 text-[10px] mt-4">
                    {locale === 'en'
                      ? 'A confirmation email will be sent to verify your booking.'
                      : 'سيتم إرسال بريد تأكيد للتحقق من حجزك.'}
                  </p>
                </motion.div>
              )}

              {/* ──── Step 3: Success (shown inline in sidebar) ──── */}
              {bookingStep === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                    <Check className="w-8 h-8 text-white stroke-[3]" />
                  </div>

                  <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-2">
                    {locale === 'en' ? 'Booking Received! 🎉' : 'تم استلام حجزك! 🎉'}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {patientForm.email
                      ? (locale === 'en'
                          ? `A confirmation email has been sent to ${patientForm.email}. Please check your inbox to confirm or cancel.`
                          : `تم إرسال بريد تأكيد إلى ${patientForm.email}. يرجى فحص بريدك للتأكيد أو الإلغاء.`)
                      : (locale === 'en'
                          ? 'Your appointment has been registered. We will contact you by phone to confirm.'
                          : 'تم تسجيل موعدك. سنتواصل معك هاتفيًا للتأكيد.')}
                  </p>

                  {/* Ticket details */}
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-start text-xs sm:text-sm space-y-2.5 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{locale === 'en' ? 'Doctor:' : 'الطبيب:'}</span>
                      <span className="font-bold text-gray-800">{t(doctor.nameKey)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{locale === 'en' ? 'Patient:' : 'المريض:'}</span>
                      <span className="font-bold text-gray-800">{patientForm.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{locale === 'en' ? 'Date:' : 'التاريخ:'}</span>
                      <span className="font-bold text-primary">{currentDay?.formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{locale === 'en' ? 'Time:' : 'الوقت:'}</span>
                      <span className="font-bold text-primary">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{locale === 'en' ? 'Fee:' : 'الكشف:'}</span>
                      <span className="font-bold text-gray-800">{doctor.fees} {t('egp')}</span>
                    </div>
                    {patientForm.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{locale === 'en' ? 'Status:' : 'الحالة:'}</span>
                        <span className="font-bold text-amber-600">{locale === 'en' ? 'Pending Confirmation' : 'في انتظار التأكيد'}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={resetBooking}
                      className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl"
                    >
                      {locale === 'en' ? 'Book Another Appointment' : 'حجز موعد آخر'}
                    </button>
                    <Link
                      href={`/${locale}/doctors`}
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm border border-gray-200 transition-colors text-center"
                    >
                      {locale === 'en' ? 'Back to Doctors' : 'العودة لدليل الأطباء'}
                    </Link>
                  </div>
                </motion.div>
              )}

              {bookingStep === 'select' && (
                <p className="text-center text-gray-400 text-[11px] mt-4">
                  {locale === 'en' ? 'In-person or Video Consultations Available' : 'متاح كشف في العيادة أو استشارة بالفيديو'}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
