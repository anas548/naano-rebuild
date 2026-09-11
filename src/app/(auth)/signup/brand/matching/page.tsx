import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandMatchingLoader } from "@/components/auth/brand-matching-loader";
import { getBrandOnboardingContext } from "@/lib/brand-onboarding";

export const metadata: Metadata = { title: "AI Matching — Naano" };

export default async function BrandMatchingStepPage() {
  const { brand } = await getBrandOnboardingContext();
  if (brand.onboardingCompleted) redirect("/brand");
  if (!brand.websiteUrl) redirect("/signup/brand/website");
  if (brand.icps.length === 0) redirect("/signup/brand/icp");

  return (
    <AuthLayout
      step="Step 3 of 3"
      progress={{ current: 3, total: 3 }}
      back={{ href: "/signup/brand/icp", label: "Back" }}
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
        Hey {brand.name}, let&apos;s find the right creators for you.
      </h1>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/55">
        Naano is matching your brief against the marketplace.
      </p>

      <BrandMatchingLoader />
    </AuthLayout>
  );
}
