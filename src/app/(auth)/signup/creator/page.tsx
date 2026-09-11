import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ProviderButton } from "@/components/auth/provider-button";
import { MarketplaceCardPreview } from "@/components/auth/marketplace-card-preview";
import { GoogleIcon, LinkedInIcon } from "@/components/landing/icons";

export const metadata: Metadata = {
  title: "Join Naano as a creator — Naano",
};

export default function CreatorSignUpPage() {
  return (
    <AuthLayout
      panelTone="light"
      step="Step 1 of 4"
      back={{ href: "/signup", label: "Back to sign-up options" }}
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

      <div className="mt-7 space-y-3">
        <ProviderButton
          icon={<LinkedInIcon className="size-5" />}
          label="Sign up with LinkedIn"
        />
        <ProviderButton
          icon={<GoogleIcon className="size-5" />}
          label="Sign up with Google"
        />
        <ProviderButton
          icon={<Mail className="size-5 text-ink/70" />}
          label="Sign up with email"
        />
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
