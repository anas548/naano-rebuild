"use client";

import { useActionState, useState } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { updateCreatorCardAction } from "@/app/actions/creator";
import { CreatorCard, type CreatorCardData } from "@/components/creator/creator-card";
import { DealLinkPanel } from "@/components/creator/deal-link-panel";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

const MAX_INDUSTRIES = 3;

export function CardEditor({
  card,
  industries,
  selectedIndustryIds,
  pricePerPostEuros,
  cardUrl,
}: {
  card: CreatorCardData;
  industries: { id: string; label: string }[];
  selectedIndustryIds: string[];
  pricePerPostEuros: string;
  cardUrl: string;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [state, formAction, pending] = useActionState(
    updateCreatorCardAction,
    null,
  );
  const [selected, setSelected] = useState<string[]>(selectedIndustryIds);
  const [headline, setHeadline] = useState(card.headline ?? "");
  const [country, setCountry] = useState(card.countryCode ?? "");
  const [price, setPrice] = useState(pricePerPostEuros);

  function toggleIndustry(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((i) => i !== id)
        : current.length >= MAX_INDUSTRIES
          ? current
          : [...current, id],
    );
  }

  // The preview reflects unsaved edits, so the card updates as you type.
  const previewData: CreatorCardData = {
    ...card,
    headline: headline || null,
    countryCode: country || null,
    industries: industries
      .filter((i) => selected.includes(i.id))
      .map((i) => i.label),
    pricePerPostCents: Math.round((Number(price) || 0) * 100) || null,
  };

  const listed = selected.length > 0 && Number(price) > 0;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-naano-violet uppercase">
            Your creator storefront
          </p>
          <h1 className="mt-3 font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-ink">
            Your Naano card, ready to travel.
          </h1>
          <p className="mt-2 max-w-[34rem] text-[0.875rem] leading-relaxed text-ink/55">
            Share clear proof of your positioning, audience and offers. Every
            improvement makes the card more useful to brands.
          </p>
        </div>

        <div className="flex shrink-0 items-center rounded-full border border-[#e6e8ef] bg-white p-1">
          {(["edit", "preview"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={mode === value}
              className={cn(
                "rounded-full px-4 py-1.5 text-[0.8125rem] font-semibold capitalize transition-colors",
                mode === value ? "bg-neutral-100 text-ink" : "text-ink/55",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <DealLinkPanel cardUrl={cardUrl} />
      </div>

      {mode === "preview" ? (
        <div className="mt-10 flex justify-center">
          <CreatorCard showShare data={previewData} className="max-w-[495px]" />
        </div>
      ) : (
        <form action={formAction} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <div className="space-y-6">
            {!listed && (
              <p className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-[0.8125rem] text-amber-800">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                Pick at least one industry and set a price above zero to be
                listed in the brand marketplace.
              </p>
            )}
            {state?.error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-[0.8125rem] text-red-700">
                {state.error}
              </p>
            )}
            {state?.saved && (
              <p className="flex items-center gap-2 rounded-xl bg-[#e2faef] px-4 py-3 text-[0.8125rem] text-[#00834a]">
                <CircleCheck className="size-4" />
                Card saved.
              </p>
            )}

            <div>
              <label htmlFor="headline" className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/60 uppercase">
                Headline
              </label>
              <textarea
                id="headline"
                name="headline"
                rows={2}
                maxLength={160}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Python Developer | AI Engineer"
                className="mt-2 w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-naano-violet"
              />
              <p className="mt-1 text-[0.75rem] text-ink/40">
                {headline.length}/160
              </p>
            </div>

            <div>
              <label htmlFor="country" className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/60 uppercase">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[0.9375rem] text-ink outline-none focus:border-naano-violet"
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/60 uppercase">
                Your industries
              </span>
              <p className="mt-1 text-[0.75rem] text-ink/45">
                Pick up to {MAX_INDUSTRIES} so relevant brands can find your card.
              </p>
              {selected.map((id) => (
                <input key={id} type="hidden" name="industryIds" value={id} />
              ))}
              <div className="mt-3 flex flex-wrap gap-2">
                {industries.map((industry) => {
                  const on = selected.includes(industry.id);
                  const full = selected.length >= MAX_INDUSTRIES && !on;
                  return (
                    <button
                      key={industry.id}
                      type="button"
                      onClick={() => toggleIndustry(industry.id)}
                      disabled={full}
                      aria-pressed={on}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-colors",
                        on
                          ? "border-naano-violet bg-naano-violet text-white"
                          : full
                            ? "border-neutral-200 bg-white text-ink/25"
                            : "border-neutral-200 bg-white text-ink/70 hover:border-neutral-300",
                      )}
                    >
                      {industry.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="pricePerPost" className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink/60 uppercase">
                Your net price per post
              </label>
              <div className="relative mt-2 max-w-[14rem]">
                <span className="absolute inset-y-0 left-4 flex items-center text-[0.9375rem] text-ink/50">
                  €
                </span>
                <input
                  id="pricePerPost"
                  name="pricePerPost"
                  type="number"
                  min={0}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white py-3 pr-4 pl-8 text-[0.9375rem] text-ink outline-none focus:border-naano-violet"
                />
              </div>
              <p className="mt-1.5 text-[0.75rem] text-ink/45">
                This is what you receive. Naano adds its margin on top for the
                brand.
              </p>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-naano-violet px-6 py-3 text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save card"}
            </button>
          </div>

          <div className="lg:sticky lg:top-6">
            <CreatorCard showShare data={previewData} />
          </div>
        </form>
      )}
    </>
  );
}
