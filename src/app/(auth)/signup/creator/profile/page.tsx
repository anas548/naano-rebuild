import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AuthLayout } from "@/components/auth/auth-layout";
import { OnboardingPanel } from "@/components/auth/onboarding-panel";
import { LinkedInPausedNotice } from "@/components/auth/linkedin-paused-notice";
import { ProfileStepForm } from "@/components/auth/profile-step-form";
import { getOnboardingContext } from "@/lib/onboarding";

export const metadata: Metadata = { title: "Complete your creator card — Naano" };

export default async function ProfileStepPage() {
  const [{ profile, card }, industries] = await Promise.all([
    getOnboardingContext(),
    prisma.industry.findMany({ orderBy: { label: "asc" } }),
  ]);

  return (
    <AuthLayout
      panelTone="light"
      step="Step 3 of 4"
      back={{ href: "/signup/creator/linkedin", label: "Back" }}
      panel={<OnboardingPanel card={card} />}
    >
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Complete your creator card
      </h1>
      <div className="mt-5">
        <LinkedInPausedNotice />
      </div>
      <ProfileStepForm
        industries={industries}
        defaultCountry={profile.country ?? ""}
        defaultIndustryIds={profile.industries.map((i) => i.id)}
      />
    </AuthLayout>
  );
}
