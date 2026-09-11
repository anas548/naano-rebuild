import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ProviderButton } from "@/components/auth/provider-button";
import { GoogleIcon, LinkedInIcon } from "@/components/landing/icons";

export const metadata: Metadata = {
  title: "Join Naano as a brand — Naano",
};

export default function BrandSignUpPage() {
  return (
    <AuthLayout
      back={{ href: "/signup", label: "Back to sign-up options" }}
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
        Join Naano
      </h1>
      <p className="mt-2 font-display text-[1.0625rem] font-semibold text-naano-blue">
        Creators. Brands. Results.
      </p>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/55">
        The #1 platform to run LinkedIn creator campaigns that drive real
        business.
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
