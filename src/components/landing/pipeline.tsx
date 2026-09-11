import { Check } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Find creators your buyers trust",
    visual: (
      <div className="flex justify-center gap-1.5">
        {[
          { name: "Eric", fit: "92%", g: "from-amber-200 to-amber-500" },
          { name: "Robin", fit: "88%", g: "from-neutral-400 to-neutral-700" },
          { name: "Aya", fit: "84%", g: "from-rose-200 to-rose-400" },
        ].map((p) => (
          <div key={p.name} className="w-[62px] rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5">
            <div className={`h-12 w-full rounded-lg bg-gradient-to-br ${p.g}`} />
            <div className="mt-1.5 text-center text-[0.625rem] font-semibold text-ink">{p.name}</div>
            <div className="text-center text-[0.5rem] text-ink/50">
              Fit <span className="font-semibold text-ink/70">{p.fit}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "02",
    title: "Build a campaign brief in minutes",
    visual: (
      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <span className="text-[0.6875rem] font-semibold text-ink">Campaign brief</span>
          <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[0.5rem] font-semibold text-naano-blue">AI</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {["Objectives and key messages", "Creator guidelines", "Tracking links ready"].map((t) => (
            <div key={t} className="flex items-start gap-1.5 text-[0.625rem] text-ink/65">
              <Check className="mt-0.5 size-2.5 shrink-0 text-naano-blue" />
              {t}
            </div>
          ))}
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full w-2/3 rounded-full bg-ink/80" />
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "Manage every collaboration",
    visual: (
      <div className="space-y-1.5">
        {[
          { name: "Raphael", status: "Draft ready", tone: "bg-neutral-100 text-ink/70" },
          { name: "Thomas", status: "Scheduled", tone: "bg-sky-50 text-naano-blue" },
          { name: "Nada", status: "Live", tone: "bg-emerald-50 text-emerald-600" },
        ].map((r) => (
          <div key={r.name} className="flex items-center justify-between rounded-xl bg-white px-2.5 py-2 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500" />
              <span className="text-[0.6875rem] font-medium text-ink">{r.name}</span>
            </div>
            <span className={`rounded-md px-1.5 py-0.5 text-[0.5rem] font-semibold ${r.tone}`}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "04",
    title: "Track reach, clicks, and leads",
    visual: (
      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
        <div className="text-[0.5625rem] text-ink/50">Attributed pipeline</div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="font-display text-xl font-semibold text-ink">€48.2K</span>
          <span className="rounded-md bg-emerald-50 px-1 py-0.5 text-[0.5rem] font-semibold text-emerald-600">
            +24%
          </span>
        </div>
        <div className="mt-2 flex h-10 items-end gap-1">
          {[30, 45, 38, 60, 52, 78, 95].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${i > 4 ? "bg-naano-blue" : "bg-sky-200"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[0.5rem] text-ink/45">
          <span>124K views</span>
          <span>418 leads</span>
        </div>
      </div>
    ),
  },
  {
    n: "05",
    title: "Pay creators without the admin",
    visual: (
      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start gap-1.5">
          <Check className="mt-0.5 size-3 shrink-0 text-naano-blue" />
          <div>
            <div className="text-[0.6875rem] font-semibold text-ink">Payment scheduled</div>
            <div className="text-[0.5rem] text-ink/50">Handled by Naano</div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-neutral-50 px-2 py-1.5">
          <span className="text-[0.5rem] text-ink/55">Creator payout</span>
          <span className="text-[0.6875rem] font-semibold text-ink">€1,240</span>
        </div>
        <div className="mt-2 flex gap-1">
          {["Contract", "Invoice", "Payout"].map((t) => (
            <span key={t} className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[0.5rem] text-ink/60">
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
  },
];

export function Pipeline() {
  return (
    <section id="how-it-works" className="sky-fade py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.16em] text-ink/45 uppercase">
          <span className="size-1.5 rounded-full bg-naano-blue" />
          One platform, from brief to results
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-end">
          <h2 className="font-display text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-ink sm:text-[3.25rem]">
            Run creator campaigns from one place.
          </h2>
          <p className="text-base text-ink/60 lg:pb-2">
            Find the right voices, launch faster, and connect every post to
            measurable business results.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col">
              <span className="text-[0.6875rem] font-semibold text-ink/35">{s.n}</span>
              <div className="mt-3 flex min-h-[150px] flex-1 items-center rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
                <div className="w-full">{s.visual}</div>
              </div>
              <h3 className="mt-4 text-sm leading-snug font-semibold text-ink">
                {s.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
