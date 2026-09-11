import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Create your account — Naano",
};

const ROLES = [
  {
    href: "/signup/creator",
    title: "I'm a creator",
    body: "Get paid to create LinkedIn content for B2B brands you actually use.",
  },
  {
    href: "/signup/brand",
    title: "I'm a brand",
    body: "Find creators, launch campaigns, and trace real pipeline back to each post.",
  },
];

export default function SignUpRolePage() {
  return (
    <AuthLayout
      panel={
        <div className="max-w-[370px]">
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-[-0.02em] text-white xl:text-[2.75rem]">
            One platform. Two sides.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            Creators get paid to post. B2B brands get real pipeline. Pick where
            you fit and we&apos;ll set the rest up in a couple of minutes.
          </p>
        </div>
      }
    >
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
        Create your account
      </h1>
      <p className="mt-1.5 text-[0.9375rem] text-ink/55">
        First, who are you here as?
      </p>

      <div className="mt-8 space-y-4">
        {ROLES.map((role) => (
          <Link
            key={role.href}
            href={role.href}
            className="block rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(11,11,15,0.04)] transition-all hover:border-naano-blue/40 hover:shadow-[0_8px_24px_-12px_rgba(11,11,15,0.25)]"
          >
            <h2 className="font-display text-base font-semibold text-ink">
              {role.title}
            </h2>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink/55">
              {role.body}
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-[0.875rem] text-ink/55">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-naano-blue">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
