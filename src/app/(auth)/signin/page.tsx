import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ProviderButton } from "@/components/auth/provider-button";
import { SignInForm } from "@/components/auth/sign-in-form";
import { GoogleIcon, LinkedInIcon } from "@/components/landing/icons";

export const metadata: Metadata = {
  title: "Sign in — Naano",
};

export default function SignInPage() {
  return (
    <AuthLayout
      panel={
        <div className="max-w-[370px]">
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-[-0.02em] text-white xl:text-[2.75rem]">
            Welcome back.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            Sign in to manage your campaigns, creators and payouts, all in one
            place.
          </p>
        </div>
      }
    >
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Welcome back
      </h1>
      <p className="mt-1.5 text-[0.9375rem] text-ink/55">
        Sign in to your account
      </p>

      <div className="mt-7 space-y-3">
        <ProviderButton
          icon={<LinkedInIcon className="size-5" />}
          label="Continue with LinkedIn"
        />
        <ProviderButton
          icon={<GoogleIcon className="size-5" />}
          label="Continue with Google"
        />
      </div>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-neutral-200" />
        <span className="text-[0.6875rem] font-medium tracking-[0.08em] text-ink/40 uppercase">
          Or continue with email
        </span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <SignInForm />

      <p className="mt-7 text-center text-[0.875rem] text-ink/55">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-naano-blue">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
