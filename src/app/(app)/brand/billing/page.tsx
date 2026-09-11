import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatEuros, humanizeStatus } from "@/lib/pricing";
import { TopUpForm } from "@/components/brand/top-up-form";
import { cn } from "@/lib/utils";

const TABS = [
  { slug: "all", label: "All", type: null },
  { slug: "top-ups", label: "Top-ups", type: "TOP_UP" as const },
  { slug: "bookings", label: "Bookings", type: "BOOKING" as const },
];

export default async function BillingPage({
  searchParams,
}: PageProps<"/brand/billing">) {
  const user = await requireUser();
  const { tab: tabParam } = await searchParams;
  const tab = TABS.find((t) => t.slug === tabParam) ?? TABS[0];

  const brand = await prisma.brand.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true, balanceCents: true },
  });

  const invoices = await prisma.invoice.findMany({
    where: { brandId: brand.id, ...(tab.type ? { type: tab.type } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
        Billing
      </h1>
      <p className="mt-1.5 text-[0.9375rem] text-ink/50">
        Manage your budget, plan and invoices.
      </p>

      <div className="mt-6 rounded-2xl border border-[#e6e8ef] bg-white p-6">
        <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink/45 uppercase">
          Available balance
        </p>
        <p className="mt-2 font-display text-[2.25rem] font-semibold text-ink">
          {formatEuros(brand.balanceCents)}
        </p>
        <p className="mt-1 text-[0.875rem] text-ink/50">
          Ready to spend across your campaigns.
        </p>
        <div className="mt-5">
          <TopUpForm />
        </div>
        <p className="mt-3 text-[0.75rem] text-ink/40">
          Demo money — top-ups are instant, there is no real payment processor.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#e6e8ef] bg-white">
        <div className="flex items-center justify-between border-b border-[#e6e8ef] px-6 py-4">
          <h2 className="font-display text-[1.0625rem] font-semibold text-ink">
            Invoices
          </h2>
          <div className="flex gap-5">
            {TABS.map((t) => (
              <Link
                key={t.slug}
                href={t.slug === "all" ? "?" : `?tab=${t.slug}`}
                className={cn(
                  "text-[0.875rem] font-medium transition-colors",
                  t.slug === tab.slug ? "text-naano-violet" : "text-ink/50 hover:text-ink",
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {invoices.length === 0 ? (
          <p className="px-6 py-14 text-center text-[0.875rem] text-ink/50">
            No invoices or entries yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left">
              <thead>
                <tr className="border-b border-[#e6e8ef]">
                  {["Reference", "Date", "Type", "Amount", "Status"].map((c) => (
                    <th key={c} className="px-6 py-3 text-[0.8125rem] font-semibold text-ink/70">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-neutral-100 last:border-b-0">
                    <td className="px-6 py-4 text-[0.8125rem] font-medium text-ink/70">
                      {invoice.reference}
                    </td>
                    <td className="px-6 py-4 text-[0.875rem] text-ink/50">
                      {invoice.createdAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-[0.875rem] text-ink/70">
                      {invoice.type === "TOP_UP" ? "Top-up" : "Booking"}
                    </td>
                    <td className="px-6 py-4 text-[0.875rem] font-semibold text-ink">
                      {invoice.type === "TOP_UP" ? "+" : "-"}
                      {formatEuros(invoice.amountCents)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "rounded-md px-2.5 py-1 text-[0.75rem] font-semibold",
                          invoice.status === "PAID"
                            ? "bg-[#e2faef] text-[#00834a]"
                            : invoice.status === "FAILED"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {humanizeStatus(invoice.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
