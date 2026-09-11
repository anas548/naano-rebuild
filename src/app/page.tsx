import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Testimonial } from "@/components/landing/testimonial";
import { Marketplace } from "@/components/landing/marketplace";
import { Pipeline } from "@/components/landing/pipeline";
import { CaseStudy } from "@/components/landing/case-study";
import { Results } from "@/components/landing/results";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Testimonial />
        <Marketplace />
        <Pipeline />
        <CaseStudy />
        <Results />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
