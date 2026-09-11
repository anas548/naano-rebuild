import { CreditCard, TrendingUp, Wallet } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getCreatorEarnings } from "@/lib/earnings";
import { formatEuros, humanizeStatus } from "@/lib/pricing";
import { WithdrawForm } from "@/components/creator/withdraw-form";

function lastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short" }) };
  });
}

export default async function CreatorEarningsPage() {
  const user = await requireUser();

  const { completed, stageOf, totalEarned, inTransit, available, awaitingRelease, withdrawals } =
    await getCreatorEarnings(user.id);

  const paidCount = completed.length;
  const average = paidCount > 0 ? Math.round(totalEarned / paidCount) : 0;

  const months = lastSixMonths();
  const byMonth = new Map(months.map((m) => [m.key, 0]));
  for (const row of completed) {
    const when = row.earning?.releasedAt ?? row.updatedAt;
    const key = `${when.getFullYear()}-${when.getMonth()}`;
    if (byMonth.has(key)) byMonth.set(key, (byMonth.get(key) ?? 0) + row.creatorNetCents);
  }
  const peak = Math.max(...byMonth.values());
  const barHeight = (value: number) => (peak === 0 ? 100 : Math.max(6, (value / peak) * 100));

  const cards = [
    { icon: TrendingUp, label: "Total earned", value: totalEarned, caption: `${paidCount} paid collaborations · ${formatEuros(average)} average`, tone: true },
    { icon: Wallet, label: "In transit", value: inTransit, caption: "International transfers usually arrive within 1–7 days, depending on the destination and banking network." },
    { icon: CreditCard, label: "Available now", value: available, caption: "Ready to withdraw to your selected payout method." },
  ];

  // One combined feed, newest first: money coming in (completed
  // collaborations) and money going out (withdrawals).
  type ActivityRow =
    | { kind: "earning"; date: Date; id: string; label: string; status: string; amountCents: number }
    | { kind: "withdrawal"; date: Date; id: string; label: string; status: string; amountCents: number };

  const activity: ActivityRow[] = [
    ...completed.map((row): ActivityRow => ({
      kind: "earning",
      date: row.earning?.releasedAt ?? row.updatedAt,
      id: row.id,
      label: `${row.campaign.brand.name ?? "Brand"} · ${row.campaign.name}`,
      status: stageOf(row),
      amountCents: row.creatorNetCents,
    })),
    ...withdrawals.map((w): ActivityRow => ({
      kind: "withdrawal",
      date: w.createdAt,
      id: w.id,
      label: `Withdrawal to ${w.payoutMethod?.type === "BANK_TRANSFER" ? "bank account" : "Stripe"}`,
      status: w.status,
      amountCents: w.amountCents,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
            Earnings
          </h1>
          <p className="mt-1.5 text-[0.9375rem] text-ink/50">
            Track revenue from your paid collaborations and withdraw available
            funds.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#e6e8ef] bg-white px-4 py-2 text-[0.8125rem] font-medium text-ink/70">
          <span className="size-1.5 rounded-full bg-naano-violet" />
          Paid collaborations
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {cards.map(({ icon: Icon, label, value, caption, tone }) => (
          <div
            key={label}
            className={`rounded-xl border border-[#e6e8ef] p-6 ${tone ? "bg-gradient-to-br from-[#eef6ff] to-white" : "bg-white"}`}
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-ink/40" />
              <span className="text-[0.875rem] font-semibold text-ink/70">{label}</span>
            </div>
            <p className="mt-3 font-display text-[2rem] font-semibold text-ink">
              {formatEuros(value)}
            </p>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-ink/45">{caption}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
                Earnings over time
              </h2>
              <p className="mt-1 text-[0.8125rem] text-ink/50">
                Net collaboration earnings from the last six months.
              </p>
            </div>
            <span className="text-[0.8125rem] text-ink/50">
              {formatEuros(totalEarned)} over 6 months
            </span>
          </div>

          <div className="mt-8 flex h-56 items-end gap-4">
            {months.map((month) => {
              const value = byMonth.get(month.key) ?? 0;
              return (
                <div key={month.key} className="flex flex-1 flex-col items-center">
                  <span className="mb-2 text-[0.75rem] text-ink/45">
                    {formatEuros(value)}
                  </span>
                  <div
                    className="w-full rounded-t-lg border-b-2 border-naano-violet bg-[#f2f0ff]"
                    style={{ height: `${barHeight(value)}%` }}
                  />
                  <span className="mt-2 text-[0.75rem] text-ink/55">{month.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-[#e6e8ef] bg-white p-6">
          <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
            Withdraw earnings
          </h2>
          <p className="mt-1 text-[0.8125rem] text-ink/50">
            Choose where your available balance should be sent.
          </p>

          <WithdrawForm availableCents={available} />

          <p className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 text-[0.8125rem] text-ink/55">
            {awaitingRelease === 0
              ? "No earnings are currently waiting for release."
              : `${awaitingRelease} earning${awaitingRelease === 1 ? "" : "s"} waiting for release.`}
          </p>
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-[#e6e8ef] bg-white p-6">
        <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
          Recent activity
        </h2>
        <p className="mt-1 text-[0.8125rem] text-ink/50">
          Collaboration earnings, withdrawals and invoices in one place.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-6 border-b border-[#e6e8ef]">
          {[
            { label: "Earnings and withdrawals", count: null },
            { label: "Awaiting release", count: awaitingRelease },
            { label: "Invoices", count: 0 },
          ].map((tab, i) => (
            <span
              key={tab.label}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-[0.9375rem] ${
                i === 0
                  ? "border-naano-violet font-semibold text-naano-violet"
                  : "border-transparent text-ink/55"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[0.75rem] font-semibold text-ink/55">
                  {tab.count}
                </span>
              )}
            </span>
          ))}
        </div>

        {activity.length === 0 ? (
          <p className="py-12 text-center text-[0.875rem] text-ink/50">
            No earnings yet. Completed collaborations will appear here.
          </p>
        ) : (
          <ul className="mt-1">
            {activity.map((row) => (
              <li
                key={`${row.kind}-${row.id}`}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 py-4 last:border-b-0"
              >
                <span className="min-w-0">
                  <span className="block text-[0.875rem] font-semibold text-ink">
                    {row.label}
                  </span>
                  <span className="block text-[0.75rem] text-ink/45">
                    {row.date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-[0.75rem] font-semibold text-ink/60">
                    {humanizeStatus(row.status)}
                  </span>
                  <span
                    className={`text-[0.875rem] font-semibold ${row.kind === "withdrawal" ? "text-ink/70" : "text-ink"}`}
                  >
                    {row.kind === "withdrawal" ? "−" : ""}
                    {formatEuros(row.amountCents)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
