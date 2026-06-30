import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import JsonLd from '@/components/JsonLd';
import { ToastProvider } from '@/components/ui/Toast';
import '../globals.css';

// استخدام خط كايرو لدعمه الممتاز للغتين العربية والإنجليزية
const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const BASE_URL = 'https://emc-clinic.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const title = isAr
    ? 'عيادة مصر الطبية — أفضل عيادة في مصر الجديدة | EMC'
    : 'Egypt Medical Clinic — Best Clinic in Heliopolis | EMC';

  const description = isAr
    ? 'عيادة مصر الطبية في مصر الجديدة، القاهرة. احجز موعدك مع أفضل الأطباء في جميع التخصصات. خدمات طبية متميزة وأسعار مناسبة. اتصل الآن 01044437797'
    : 'Egypt Medical Clinic in Heliopolis, Cairo. Book your appointment with the best doctors across all specialties. Premium medical services at affordable prices. Call now 01044437797';

  return {
    title: {
      default: title,
      template: `%s | Egypt Medical Clinic — عيادة مصر الطبية`,
    },
    description,
    keywords: [
      'عيادة مصر الجديدة',
      'Egypt Medical Clinic Heliopolis',
      'أفضل عيادة في مصر الجديدة',
      'حجز موعد طبي مصر الجديدة',
      'EMC clinic Cairo',
      'عيادة مصر الطبية',
      'أطباء مصر الجديدة',
      'doctors Heliopolis Cairo',
      'عيادة القاهرة',
      'medical clinic Cairo',
    ],
    metadataBase: new URL(BASE_URL),
    manifest: '/manifest.json',
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ar: `${BASE_URL}/ar`,
        en: `${BASE_URL}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isAr ? 'ar_EG' : 'en_US',
      alternateLocale: isAr ? 'en_US' : 'ar_EG',
      url: `${BASE_URL}/${locale}`,
      siteName: 'Egypt Medical Clinic — عيادة مصر الطبية',
      title,
      description,
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Egypt Medical Clinic — عيادة مصر الطبية',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {},
    category: 'Medical',
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // جلب نصوص الترجمة الخاصة باللغة الحالية
  const messages = await getMessages();
  
  // تحديد اتجاه الصفحة بناءً على اللغة
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className={cairo.variable} suppressHydrationWarning>
      <body className={`${cairo.className} antialiased bg-[#F8F9FA] min-h-screen flex flex-col`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `
          }}
        />
        <JsonLd />
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            {/* لو عندك Navbar ضيفه هنا */}
            
            <main className="flex-grow">
              {children}
            </main>

            {/* لو عندك Footer ضيفه هنا */}
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}