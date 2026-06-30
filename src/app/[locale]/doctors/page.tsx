'use client';

import { Suspense, useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Search, ChevronDown, Star, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';
import { doctors as staticDoctors, filterTabs } from '@/data/doctors';
import { supabase } from '@/lib/supabase';

function DoctorsSearchAndGrid() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations('Doctors');
  const tHero = useTranslations('Hero');
  const tSpec = useTranslations('Specialties');

  // get initial query values
  const initSpecialty = searchParams.get('specialty') || '';
  const initArea = searchParams.get('area') || '';
  const initName = searchParams.get('name') || '';

  const [searchTerm, setSearchTerm] = useState(initName);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initSpecialty);
  const [selectedArea, setSelectedArea] = useState(initArea);
  
  // Database Doctors State
  const [dbDoctors, setDbDoctors] = useState<any[]>([]);

  useEffect(() => {
    async function loadDbDoctors() {
      try {
        const { data } = await supabase.from('doctors').select('*');
        if (data) {
          setDbDoctors(data);
        }
      } catch (err) {
        console.error('Error fetching doctors from database:', err);
      }
    }
    loadDbDoctors();
  }, []);

  // Sync state with URL search params
  useEffect(() => {
    setSelectedSpecialty(searchParams.get('specialty') || '');
    setSelectedArea(searchParams.get('area') || '');
    setSearchTerm(searchParams.get('name') || '');
  }, [searchParams]);

  // Combine static and dynamic doctors
  const mappedDbDoctors = dbDoctors.map(doc => {
    // Map database doctor fields to expected schema
    return {
      id: doc.id,
      nameKey: doc.name, 
      specialtyKey: doc.specialty,
      locationKey: locale === 'en' ? 'Heliopolis, Cairo' : 'مصر الجديدة، القاهرة',
      rating: doc.rating || 4.8,
      reviews: 120,
      fees: doc.consultation_fee || 300,
      waitTime: 15,
      category: doc.specialty.toLowerCase().includes('نساء') || doc.specialty.toLowerCase().includes('gynecology') ? 'gynecology' :
                doc.specialty.toLowerCase().includes('مسالك') || doc.specialty.toLowerCase().includes('urology') ? 'urology' :
                doc.specialty.toLowerCase().includes('عظام') || doc.specialty.toLowerCase().includes('ortho') ? 'orthopedics' : 'ent',
      bookingType: 'firstCome',
      image: doc.image_url || ((doc.name_ar || '').includes('منى') || (doc.name_ar || '').includes('سارة') || (doc.name_ar || '').includes('فاطمة') || (doc.name_ar || '').includes('نادية') || (doc.name_ar || '').includes('نادين') ? '/doctor_female.png' : '/doctor_male.png'),
      isFromDb: true,
      name: doc.name,
      nameAr: doc.name_ar,
      specialty: doc.specialty
    };
  });

  const allDoctors = [...staticDoctors, ...mappedDbDoctors];

  // Helper getters for names and specialty values
  const getDoctorName = (doc: any) => {
    if (doc.isFromDb) {
      return locale === 'ar' ? (doc.nameAr || doc.name) : doc.name;
    }
    return t(doc.nameKey);
  };

  const getDoctorSpecialty = (doc: any) => {
    if (doc.isFromDb) {
      return doc.specialty;
    }
    return t(doc.specialtyKey);
  };

  const getDoctorLocation = (doc: any) => {
    if (doc.isFromDb) {
      return doc.locationKey;
    }
    return t(doc.locationKey);
  };

  // filter doctors
  const filteredDoctors = allDoctors.filter(doc => {
    const displayName = getDoctorName(doc).toLowerCase();
    const displaySpecialty = getDoctorSpecialty(doc).toLowerCase();
    
    // search text match
    const nameMatch = searchTerm
      ? displayName.includes(searchTerm.toLowerCase()) || 
        displaySpecialty.includes(searchTerm.toLowerCase())
      : true;
      
    // specialty match
    const specialtyMatch = selectedSpecialty
      ? doc.category === selectedSpecialty
      : true;
      
    // area match
    const areaMatch = selectedArea
      ? selectedArea === 'heliopolis' // Heliopolis clinic
      : true;

    return nameMatch && specialtyMatch && areaMatch;
  });

  return (
    <>
      <div className="bg-gradient-to-r from-primary to-[#0059a3] pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[100px] z-0 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-white/80 text-sm font-bold tracking-widest uppercase mb-2">
            EMC <span className="font-normal capitalize tracking-normal ms-2 opacity-70">Egyptian Medical Clinic</span>
          </h2>
          <h1 className="text-4xl md:text-5xl font-outfit font-bold text-white">
            {t('title')}
          </h1>
          <p className="text-gray-300 text-sm md:text-base mt-2 max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-45 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={locale === 'en' ? 'Search doctor name or title' : 'ابحث باسم الطبيب أو المسمى الوظيفي'} 
                className="w-full ps-10 pe-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary focus:bg-white transition-all text-base sm:text-sm" 
              />
              <Search className="w-4 h-4 text-gray-400 absolute start-4 top-1/2 -translate-y-1/2" />
            </div>
            
            {/* Dropdowns */}
            <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
              {/* Specialty Select */}
              <div className="relative w-full md:w-auto flex-1 md:flex-initial">
                <select 
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full md:w-auto ps-4 pe-10 py-2.5 bg-white border border-gray-200 rounded-full appearance-none text-base sm:text-sm text-gray-700 cursor-pointer focus:outline-none focus:border-primary"
                >
                  <option value="">{tHero('field_specialty_placeholder')}</option>
                  {filterTabs.filter(tab => tab.id !== 'all').map(tab => (
                    <option key={tab.id} value={tab.id}>
                      {tSpec(tab.key)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Area Select */}
              <div className="relative w-full md:w-auto flex-1 md:flex-initial">
                <select 
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full md:w-auto ps-4 pe-10 py-2.5 bg-white border border-gray-200 rounded-full appearance-none text-base sm:text-sm text-gray-700 cursor-pointer focus:outline-none focus:border-primary"
                >
                  <option value="">{tHero('field_area_placeholder')}</option>
                  <option value="heliopolis">{locale === 'en' ? 'Heliopolis' : 'مصر الجديدة'}</option>
                  <option value="nasr-city">{locale === 'en' ? 'Nasr City' : 'مدينة نصر'}</option>
                  <option value="maadi">{locale === 'en' ? 'Maadi' : 'المعادي'}</option>
                  <option value="dokki">{locale === 'en' ? 'Dokki' : 'الدقي'}</option>
                  <option value="new-cairo">{locale === 'en' ? 'New Cairo' : 'التجمع الخامس'}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="bg-gray-50/50 py-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col sm:flex-row gap-6 hover:-translate-y-1 transition-transform duration-300">
                
                {/* Image */}
                <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden shrink-0 relative bg-gradient-to-br from-purple-100 to-indigo-50 border border-gray-100">
                   <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl z-10 pointer-events-none"></div>
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={doc.image} alt={getDoctorName(doc)} className="absolute inset-0 w-full h-full object-cover object-top rounded-xl" loading="lazy" />
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col text-start">
                  <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">{getDoctorName(doc)}</h3>
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-3 w-fit">
                    {tSpec(doc.category)}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-xs sm:text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#FFB300] fill-[#FFB300]" />
                      <span className="font-bold text-[#1A1A2E]">{doc.rating}</span>
                      <span>{t('reviews', { count: doc.reviews })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{t('waitTime', { time: doc.waitTime })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{getDoctorLocation(doc)}</span>
                    </div>
                  </div>

                  <div className="text-[#1A1A2E] font-bold text-sm mb-6 mt-1">
                    {t('fees')}: {doc.fees} {t('egp')}
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    <Link href={`/${locale}/doctors/${doc.id}`} className="flex-1 text-center py-2.5 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors text-sm">
                      {locale === 'en' ? 'View Profile' : 'الملف الشخصي'}
                    </Link>
                    <Link href={`/${locale}/doctors/${doc.id}`} className="flex-1 text-center py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-md shadow-primary/30 transition-colors text-sm">
                      {t('book')}
                    </Link>
                  </div>
                </div>
                
              </div>
            ))}

            {filteredDoctors.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-16 bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <p className="text-gray-400 font-medium text-lg mb-2">
                  {locale === 'en' ? 'No doctors found matching your search criteria.' : 'لم يتم العثور على أطباء يطابقون خيارات البحث.'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('');
                    setSelectedArea('');
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  {locale === 'en' ? 'Reset Filters' : 'إعادة ضبط التصفية'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function DoctorsPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="min-h-screen pt-32 text-center text-gray-500">Loading Doctors Directory...</div>}>
        <DoctorsSearchAndGrid />
      </Suspense>
      <Footer />
    </>
  );
}
