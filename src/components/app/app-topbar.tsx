import { Bell, CreditCard } from "lucide-react";
import { formatEuros } from "@/lib/pricing";
import { AccountMenu } from "@/components/app/account-menu";

/** The language switch and bell are presentational for now; only the wallet
 *  figure and the avatar reflect real state. */
export function AppTopbar({
  balanceCents,
  name,
}: {
  balanceCents: number;
  name: string;
}) {
  return (
    <header className="flex items-center justify-end gap-3 border-b border-[#e6e8ef] bg-white px-6 py-3.5 sm:px-8">
      <span className="flex items-center gap-2 rounded-lg border border-[#e6e8ef] px-3 py-1.5 text-[0.8125rem] font-semibold text-ink">
        <CreditCard className="size-4 text-ink/45" />
        {formatEuros(balanceCents)}
      </span>

      <div className="flex items-center rounded-lg border border-[#e6e8ef] p-0.5 text-[0.75rem] font-semibold">
        <span className="rounded-md bg-white px-2.5 py-1 text-ink shadow-sm">EN</span>
        <span className="px-2.5 py-1 text-ink/40">FR</span>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="rounded-lg p-2 text-ink/55 transition-colors hover:bg-neutral-50 hover:text-ink"
      >
        <Bell className="size-[1.15rem]" />
      </button>

      <AccountMenu initial={name.charAt(0).toUpperCase()} />
    </header>
  );
}
