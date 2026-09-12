import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { OnboardingPanel } from "@/components/auth/onboarding-panel";
import { PriceStepForm } from "@/components/auth/price-step-form";
import { getOnboardingContext } from "@/lib/onboarding";

export const metadata: Metadata = { title: "Set your price — Naano" };

export default async function PriceStepPage() {
  const { profile, card } = await getOnboardingContext();

  return (
    <AuthLayout
      panelTone="light"
      step="Step 4 of 4"
      panel={<OnboardingPanel card={card} />}
    >
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Complete your creator card
      </h1>
      <Link
        href="/signup/creator/profile"
        className="mt-5 inline-flex items-center gap-2 text-[0.875rem] text-ink/70 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Edit my industries
      </Link>
      <PriceStepForm
        defaultPrice={
          profile.pricePerPostCents ? String(profile.pricePerPostCents / 100) : ""
        }
      />
    </AuthLayout>
  );
}
