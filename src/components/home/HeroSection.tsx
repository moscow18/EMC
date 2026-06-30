'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Stethoscope, Video, MapPin, User, ChevronDown } from 'lucide-react';

const backgroundImages = [
  '/clinic_reception.png',
  '/clinic_consultation.png',
  '/clinic_examination.png'
];

export default function HeroSection() {
  const t = useTranslations('Hero');
  const locale = useLocale();
  
  const [activeTab, setActiveTab] = useState<'clinic' | 'online'>('clinic');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Search state
  const [specialty, setSpecialty] = useState('');
  const [area, setArea] = useState('');
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (specialty) queryParams.append('specialty', specialty);
    if (area) queryParams.append('area', area);
    if (doctorName) queryParams.append('name', doctorName);
    
    window.location.href = `/${locale}/doctors?${queryParams.toString()}`;
  };

  return (
    <section className="relative pt-16 overflow-hidden min-h-[550px] flex items-center">
      {/* Dynamic Clinic Slideshow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        ))}
        {/* Overlay - Dark premium gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/70 to-slate-950/85" />
      </div>

      <div className="w-full relative z-10 pb-20 pt-12 sm:pt-16 lg:pt-24">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 end-0 w-[500px] h-[500px] rounded-full bg-[#0062FF]/15 blur-[150px]" />
          <div className="absolute bottom-0 start-0 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-white leading-tight mb-4 tracking-tight">
              {t('title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed font-medium">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Upgraded Search Box Matching Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-4xl mx-auto"
          >
            {/* Sliding Pill Tabs Aligned to the Right */}
            <div className="flex justify-end w-full mb-3">
              <div className="flex gap-1 p-1 bg-[#1E1B2E]/80 backdrop-blur-md border border-white/5 rounded-full shadow-lg shadow-black/20">
                <button
                  onClick={() => setActiveTab('clinic')}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                    activeTab === 'clinic' 
                      ? 'bg-[#0070CD] text-white shadow-md shadow-[#0070CD]/25' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{t('tab_clinic')}</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('online')}
                  className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                    activeTab === 'online' 
                      ? 'bg-[#0070CD] text-white shadow-md shadow-[#0070CD]/25' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{t('tab_online')}</span>
                </button>
              </div>
            </div>

            {/* Capsule Fields Card */}
            <div className="bg-white rounded-[50px] p-2 border border-gray-200/80 shadow-2xl flex flex-col md:flex-row items-center gap-2 md:gap-0 w-full text-start">
              {/* Specialty Field */}
              <div className="flex flex-col flex-1 w-full px-6 py-2 hover:bg-gray-50/50 rounded-full transition-all">
                <span className="text-[11px] font-bold text-gray-400 mb-0.5 text-start">
                  {t('field_specialty')}
                </span>
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 flex-grow">
                    <Stethoscope className="w-4 h-4 text-[#0070CD] shrink-0" />
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-[#0070CD] font-extrabold text-[14px] cursor-pointer appearance-none"
                    >
                      <option value="" className="text-gray-800">{t('field_specialty_placeholder')}</option>
                      <option value="cardiology" className="text-gray-800">Cardiology / قلب</option>
                      <option value="dentistry" className="text-gray-800">Dentistry / أسنان</option>
                      <option value="dermatology" className="text-gray-800">Dermatology / جلدية</option>
                      <option value="pediatrics" className="text-gray-800">Pediatrics / أطفال</option>
                      <option value="orthopedics" className="text-gray-800">Orthopedics / عظام</option>
                      <option value="ent" className="text-gray-800">ENT / أنف وأذن</option>
                      <option value="gynecology" className="text-gray-800">Gynecology / نساء وتوليد</option>
                      <option value="internal" className="text-gray-800">Internal Medicine / باطنة</option>
                      <option value="urology" className="text-gray-800">Urology / مسالك بولية</option>
                      <option value="gastro" className="text-gray-800">Gastroenterology / جهاز هضمي</option>
                      <option value="chest" className="text-gray-800">Pulmonology / صدري</option>
                      <option value="neurology" className="text-gray-800">Neurology / مخ وأعصاب</option>
                    </select>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />
                </div>
              </div>

              {/* Area Field */}
              <div className="flex flex-col flex-1 w-full px-6 py-2 hover:bg-gray-50/50 rounded-full md:border-x md:border-gray-200/80 md:rounded-[40px] md:mx-2 md:px-8 transition-all">
                <span className="text-[11px] font-bold text-gray-400 mb-0.5 text-start">
                  {t('field_area')}
                </span>
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2 flex-grow">
                    <MapPin className="w-4 h-4 text-[#0070CD] shrink-0" />
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-[#0070CD] font-extrabold text-[14px] cursor-pointer appearance-none"
                    >
                      <option value="" className="text-gray-800">{t('field_area_placeholder')}</option>
                      <option value="heliopolis" className="text-gray-800">Heliopolis / مصر الجديدة</option>
                      <option value="nasr-city" className="text-gray-800">Nasr City / مدينة نصر</option>
                      <option value="maadi" className="text-gray-800">Maadi / المعادي</option>
                      <option value="dokki" className="text-gray-800">Dokki / الدقي</option>
                      <option value="new-cairo" className="text-gray-800">New Cairo / التجمع الخامس</option>
                      <option value="zamalek" className="text-gray-800">Zamalek / الزمالك</option>
                    </select>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />
                </div>
              </div>

              {/* Doctor Name Field */}
              <div className="flex flex-col flex-1 w-full px-6 py-2 hover:bg-gray-50/50 rounded-full transition-all">
                <span className="text-[11px] font-bold text-gray-400 mb-0.5 text-start">
                  {t('field_doctor')}
                </span>
                <div className="flex items-center gap-2 w-full">
                  <User className="w-4 h-4 text-[#0070CD] shrink-0" />
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder={t('field_doctor_placeholder')}
                    className="bg-transparent border-none outline-none w-full text-[#0070CD] placeholder-[#0070CD]/60 font-extrabold text-[14px]"
                  />
                </div>
              </div>

              {/* Search Button */}
              <button 
                onClick={handleSearch} 
                className="w-full md:w-auto h-12 md:h-14 px-8 bg-[#0070CD] hover:bg-[#005FB0] text-white font-extrabold rounded-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0070CD]/25 active:scale-95 hover:scale-[1.02] cursor-pointer"
              >
                <Search className="w-4.5 h-4.5" />
                <span>{t('search')}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
