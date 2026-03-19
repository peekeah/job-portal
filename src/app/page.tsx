import FAQSection from '@/components/faqs';
import FeaturesSection from '@/components/features';
import FooterSection from '@/components/footer';
import HeroSection from '@/components/hero';
import { Navbar } from '@/components/nav';
import PricingSection from '@/components/pricing';
import { TestimonialSection } from '@/components/testimonials';

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <TestimonialSection />
      <FooterSection />
    </div>
  );
}
