"use client";

import { useActionState, useState } from "react";
import { Sparkles } from "lucide-react";
import { saveIcpStepAction } from "@/app/actions/brand-onboarding";
import { FieldError, SubmitButton } from "@/components/auth/field";

type IcpField = { title: string; description: string };

export function BrandIcpForm({
  brandName,
  defaultValueProposition,
  defaultIcps,
}: {
  brandName: string;
  defaultValueProposition: string;
  defaultIcps: IcpField[];
}) {
  const [state, formAction, pending] = useActionState(saveIcpStepAction, null);
  const [valueProposition, setValueProposition] = useState(defaultValueProposition);
  const [icps, setIcps] = useState<IcpField[]>(defaultIcps);

  function updateIcp(index: number, field: keyof IcpField, value: string) {
    setIcps((prev) =>
      prev.map((icp, i) => (i === index ? { ...icp, [field]: value } : icp)),
    );
  }

  return (
    <form action={formAction} className="mt-7 space-y-6">
      <div>
        <label
          htmlFor="valueProposition"
          className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/60 uppercase"
        >
          Value proposition
        </label>
        <p className="mt-1 text-[0.8125rem] text-ink/50">
          What the company does, for whom, how — 4 to 6 sentences. Edit if needed.
        </p>
        <textarea
          id="valueProposition"
          name="valueProposition"
          rows={5}
          value={valueProposition}
          onChange={(e) => setValueProposition(e.target.value)}
          className="mt-2.5 w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.875rem] leading-relaxed text-ink outline-none transition-colors focus:border-naano-blue"
        />
      </div>

      <div>
        <span className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/60 uppercase">
          3 ideal customers (ICP)
        </span>
        <p className="mt-1 text-[0.8125rem] text-ink/50">
          The audiences your creators need to understand.
        </p>
        <div className="mt-3 space-y-3">
          {icps.map((icp, index) => (
            <div
              key={index}
              className="rounded-xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-naano-blue text-[0.75rem] font-semibold text-white">
                  {index + 1}
                </span>
                <input
                  name="icpTitle"
                  value={icp.title}
                  onChange={(e) => updateIcp(index, "title", e.target.value)}
                  placeholder="ICP name"
                  className="w-full text-[0.9375rem] font-semibold text-ink outline-none placeholder:text-ink/35"
                />
              </div>
              <textarea
                name="icpDescription"
                rows={2}
                value={icp.description}
                onChange={(e) => updateIcp(index, "description", e.target.value)}
                placeholder="Who they are and what they need"
                className="mt-2 w-full resize-none pl-[2.125rem] text-[0.8125rem] leading-relaxed text-ink/60 outline-none placeholder:text-ink/35"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7f7] bg-[#f6f9ff] p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.1em] text-ink/50 uppercase">
            Starter creator brief
          </p>
          <span className="rounded-full bg-[#e2faef] px-2.5 py-1 text-[0.6875rem] font-semibold text-[#00834a]">
            Ready
          </span>
        </div>
        <p className="mt-1 font-display text-[1rem] font-semibold text-ink">
          What your creators will receive
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
              Product
            </p>
            <p className="mt-1 line-clamp-5 text-[0.8125rem] leading-relaxed text-ink/70">
              {valueProposition || "—"}
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/45 uppercase">
              Audience
            </p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed font-medium text-ink/70">
              {icps.map((i) => i.title).filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 text-[0.75rem] leading-relaxed text-ink/50">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-naano-blue" />
          Every creator you invite to {brandName || "your"} campaigns will receive
          this brief. You can edit it later from Campaigns.
        </p>
      </div>

      <FieldError message={state?.error} />
      <SubmitButton pending={pending}>Continue to AI Matching</SubmitButton>
    </form>
  );
}
