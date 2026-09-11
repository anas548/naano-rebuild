import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandWebsiteForm } from "@/components/auth/brand-website-form";
import { getBrandOnboardingContext } from "@/lib/brand-onboarding";

export const metadata: Metadata = { title: "Your website — Naano" };

export default async function BrandWebsiteStepPage() {
  const { brand } = await getBrandOnboardingContext();
  if (brand.onboardingCompleted) redirect("/brand");

  return (
    <AuthLayout
      step="Step 1 of 3"
      progress={{ current: 1, total: 3 }}
      panel={
        <div className="max-w-[370px]">
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-[-0.02em] text-white xl:text-[2.75rem]">
            Creators. Brands. Results.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            Run LinkedIn creator campaigns that drive real business - discover
            creators, track performance, pay in one click.
          </p>
          <p className="mt-8 text-[0.9375rem] text-white/70">
            Built for B2B marketing teams
          </p>
        </div>
      }
    >
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Your website
      </h1>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/55">
        We&apos;ll read your site to understand the product and your 3 main
        ICPs. This usually takes 20–40 seconds.
      </p>

      <BrandWebsiteForm defaultWebsite={brand.websiteUrl ?? ""} />
    </AuthLayout>
  );
}
