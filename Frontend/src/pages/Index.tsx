import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Evidence } from "@/components/Evidence";
import { Support } from "@/components/Support";
import { Solution } from "@/components/Solution";
import { Features } from "@/components/Features";
import { WhyItWorks } from "@/components/WhyItWorks";
import { HowItWorks } from "@/components/HowItWorks";
import { RealResults } from "@/components/RealResults";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import FloatingEffects from "@/components/FloatingEffects";

const Index = () => {
  return (
    <main className="min-h-screen relative">
      <FloatingEffects intensity="full" />
      <Navigation />
      <Hero />
      <Evidence />
      <Support />
      <Solution />
      <Features />
      <WhyItWorks />
      <HowItWorks />
      <RealResults />
      <Pricing />
      <FAQ />
      <CTA />
    </main>
  );
};

export default Index;
