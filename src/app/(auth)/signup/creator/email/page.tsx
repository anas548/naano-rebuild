import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { MarketplaceCardPreview } from "@/components/auth/marketplace-card-preview";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Join Naano as a creator — Naano",
};

export default function CreatorEmailSignUpPage() {
  return (
    <AuthLayout
      panelTone="light"
      step="Step 1 of 4"
      back={{ href: "/signup/creator", label: "Back to sign-up options" }}
      panel={
        <div>
          <div className="text-center">
            <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-naano-blue uppercase">
              Your marketplace card
            </p>
            <h2 className="mt-3 font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-ink">
              Build a card brands can trust.
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/55">
              It updates live with your profile, analytics, positioning and
              price.
            </p>
          </div>
          <div className="mt-8">
            <MarketplaceCardPreview />
          </div>
        </div>
      }
    >
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Join Naano
      </h1>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/55">
        Get paid to create LinkedIn content for B2B brands you actually use.
      </p>

      <div className="mt-7">
        <SignUpForm role="CREATOR" emailLabel="Email" />
      </div>

      <p className="mt-7 text-center text-[0.875rem] text-ink/55">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-naano-blue">
          Sign in here
        </Link>
      </p>
    </AuthLayout>
  );
}
