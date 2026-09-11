import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { OnboardingPanel } from "@/components/auth/onboarding-panel";
import { LinkedInStepForm } from "@/components/auth/linkedin-step-form";
import { getOnboardingContext } from "@/lib/onboarding";

export const metadata: Metadata = { title: "Add your LinkedIn profile — Naano" };

export default async function LinkedInStepPage() {
  const { profile, card } = await getOnboardingContext();

  return (
    <AuthLayout
      panelTone="light"
      step="Step 2 of 4"
      back={{ href: "/creator", label: "Back to my account" }}
      panel={<OnboardingPanel card={card} />}
    >
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Add your public LinkedIn profile
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/55">
        No extension is needed. We&apos;ll retrieve only the minimum public
        information required to create your Basic card.
      </p>
      <LinkedInStepForm defaultUrl={profile.linkedinUrl ?? ""} />
    </AuthLayout>
  );
}
