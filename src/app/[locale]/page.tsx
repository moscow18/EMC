import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import SpecialtiesGrid from '@/components/home/SpecialtiesGrid';
import DoctorsSection from '@/components/home/DoctorsSection';
import ServiceBanners from '@/components/home/ServiceBanners';
import TopOffersSection from '@/components/home/TopOffersSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import StatsSection from '@/components/home/StatsSection';
import ReviewsSection from '@/components/home/ReviewsSection';
import AppDownloadSection from '@/components/home/AppDownloadSection';
import ContactSection from '@/components/home/ContactSection';
import FloatingChatbot from '@/components/home/FloatingChatbot';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function HomePage() {
  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main className="min-h-screen bg-white" role="main" aria-label="Egypt Medical Clinic — عيادة مصر الطبية">
        <HeroSection />
        <SpecialtiesGrid />
        <DoctorsSection />
        <ServiceBanners />
        <TopOffersSection />
        <WhyChooseUs />
        <StatsSection />
        <ReviewsSection />
        <AppDownloadSection />
        <ContactSection />
      </main>
      <Footer />
      <FloatingChatbot />
    </>
  );
}
