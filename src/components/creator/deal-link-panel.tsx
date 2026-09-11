"use client";

import { useState } from "react";
import { Briefcase, Check, Send, Share2 } from "lucide-react";

const USES = [
  {
    icon: Briefcase,
    title: "Add it as a LinkedIn experience",
    body: "Keep your card visible on your profile so brands can discover and book you.",
  },
  {
    icon: Send,
    title: "Send it when a brand contacts you",
    body: "When you receive a collaboration request, share your card so the deal runs through Naano.",
  },
];

export function DealLinkPanel({ cardUrl }: { cardUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#dbe7f7] bg-gradient-to-br from-[#f2f8ff] to-[#eef4ff] p-7">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink/50 uppercase">
            <span className="size-1.5 rounded-full bg-[#7cc3f5]" />
            Your card is your Deal Link
          </p>
          <h2 className="mt-4 max-w-[34rem] font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-ink">
            Put it on LinkedIn. Earn when a brand joins through it.
          </h2>
          <p className="mt-3 max-w-[32rem] text-[0.875rem] leading-relaxed text-ink/55">
            Your public card presents your profile and keeps you selected when a
            brand creates its account.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {USES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-white bg-white/70 p-4"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-[#e8edff]">
                  <Icon className="size-4 text-naano-violet" />
                </span>
                <h3 className="mt-3 text-[0.875rem] font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-1 text-[0.75rem] leading-relaxed text-ink/50">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={copy}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
          >
            {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
            {copied ? "Link copied" : "Copy or share my Deal Link"}
          </button>
        </div>

        <div className="shrink-0 rounded-xl bg-white/80 px-8 py-6 lg:w-56">
          <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-ink/45 uppercase">
            Your share
          </p>
          <p className="mt-1.5 font-display text-[2rem] font-semibold text-ink">
            25%
          </p>
          <div className="my-5 h-px bg-neutral-200" />
          <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-ink/45 uppercase">
            Reward period
          </p>
          <p className="mt-1.5 font-display text-[1.375rem] font-semibold text-ink">
            3 months
          </p>
        </div>
      </div>
    </div>
  );
}
