import { getLocale } from 'next-intl/server';

export default async function JsonLd() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['MedicalClinic', 'LocalBusiness'],
    '@id': 'https://emc-clinic.com',
    name: isAr ? 'عيادة مصر الطبية — EMC' : 'Egypt Medical Clinic — EMC',
    alternateName: isAr ? 'Egypt Medical Clinic' : 'عيادة مصر الطبية',
    description: isAr
      ? 'عيادة مصر الطبية في مصر الجديدة، القاهرة — أفضل الأطباء والتخصصات الطبية. احجز موعدك الآن.'
      : 'Egypt Medical Clinic in Heliopolis, Cairo — Top doctors and medical specialties. Book your appointment now.',
    url: `https://emc-clinic.com/${locale}`,
    logo: 'https://emc-clinic.com/emc-logo.jpg',
    image: 'https://emc-clinic.com/emc-logo.jpg',
    telephone: ['+201044437797', '+20224521848'],
    email: 'emc.egypt12@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: isAr ? 'مصر الجديدة' : 'Heliopolis',
      addressLocality: isAr ? 'القاهرة' : 'Cairo',
      addressRegion: isAr ? 'القاهرة' : 'Cairo',
      addressCountry: 'EG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.0869,
      longitude: 31.3225,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '09:00',
        closes: '22:00',
      },
    ],
    priceRange: '$$',
    currenciesAccepted: 'EGP',
    paymentAccepted: 'Cash, Credit Card',
    medicalSpecialty: [
      'Cardiology',
      'Dentistry',
      'Dermatology',
      'Pediatrics',
      'Orthopedics',
      'ENT',
      'Neurology',
      'Gynecology',
    ],
    availableService: {
      '@type': 'MedicalProcedure',
      name: isAr ? 'حجز موعد طبي' : 'Medical Appointment Booking',
    },
    areaServed: {
      '@type': 'City',
      name: isAr ? 'القاهرة' : 'Cairo',
    },
    sameAs: [],
    inLanguage: locale,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
