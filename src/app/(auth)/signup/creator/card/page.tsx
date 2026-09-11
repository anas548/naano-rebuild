import type { Metadata } from "next";
import Link from "next/link";
import { CreatorCard } from "@/components/creator/creator-card";
import { getOnboardingContext } from "@/lib/onboarding";

export const metadata: Metadata = { title: "Your Marketplace card — Naano" };

export default async function CardRevealPage() {
  const { card } = await getOnboardingContext();

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#eef1fd] px-5 py-14">
      <h1 className="text-center font-display text-[2rem] font-semibold tracking-[-0.02em] text-ink">
        Here is your Marketplace card
      </h1>
      <p className="mx-auto mt-3 max-w-[30rem] text-center text-[0.9375rem] leading-relaxed text-ink/55">
        Tap it to flip it over. You will be able to customize it in the profile
        coming next.
      </p>

      <div className="mt-8 w-full max-w-[460px]">
        <CreatorCard tone="blue" data={card} />
      </div>

      <Link
        href="/creator"
        className="mt-10 w-full max-w-[460px] rounded-xl bg-naano-blue py-3.5 text-center text-[0.9375rem] font-semibold text-white transition-colors hover:bg-naano-blue/90"
      >
        Continue to my profile
      </Link>
    </main>
  );
}
