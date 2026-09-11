import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { OnboardingPanel } from "@/components/auth/onboarding-panel";
import { ProfessionalStepForm } from "@/components/auth/professional-step-form";
import { getOnboardingContext } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Professional information — Naano",
};

export default async function ProfessionalStepPage() {
  const { card } = await getOnboardingContext();

  return (
    <AuthLayout
      panelTone="light"
      step="Optional"
      panel={<OnboardingPanel card={card} />}
    >
      <h1 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-ink">
        Complete your professional information now?
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/55">
        This step is optional now. You can complete it later from your profile,
        before applying to paid campaigns, accepting bookings, invoicing or
        withdrawing your earnings.
      </p>

      <div className="mt-6 space-y-4 rounded-xl border border-neutral-200 bg-[#fafafa] p-5">
        <p className="text-[0.875rem] leading-relaxed text-ink/70">
          <span className="font-semibold text-ink">
            France and European Union:
          </span>{" "}
          a registered professional activity is required to invoice companies
          and withdraw your earnings.
        </p>
        <p className="text-[0.875rem] leading-relaxed text-ink/70">
          <span className="font-semibold text-ink">
            United States and outside the European Union:
          </span>{" "}
          a registered business is not mandatory. You can continue as an
          individual and add professional information if you have it.
        </p>
      </div>

      <ProfessionalStepForm />
    </AuthLayout>
  );
}
