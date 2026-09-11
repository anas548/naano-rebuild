"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  LayoutGrid,
  MessageCircle,
  Store,
  TrendingUp,
  UsersRound,
  Wallet,
} from "lucide-react";
import { NaanoLogo } from "@/components/naano-logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/brand", label: "Overview", icon: LayoutGrid },
  { href: "/brand/creators", label: "Creators", icon: Store },
  { href: "/brand/campaigns", label: "Campaigns", icon: Layers },
  { href: "/brand/collaborations", label: "Collaborations", icon: UsersRound },
  { href: "/brand/results", label: "Results", icon: TrendingUp },
  { href: "/brand/messages", label: "Messages", icon: MessageCircle },
  { href: "/brand/billing", label: "Billing", icon: Wallet },
];

export function BrandSidebar({
  brandName,
  unreadMessages = 0,
}: {
  brandName: string | null;
  unreadMessages?: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[285px] shrink-0 border-r border-[#e6e8ef] bg-white lg:block">
      <div className="px-7 py-7">
        <Link href="/brand" aria-label="Naano">
          <NaanoLogo markClassName="xl:h-[1.6rem] xl:w-[2.15rem]" />
        </Link>
      </div>

      {brandName && (
        <div className="mx-4 mb-5 flex items-center gap-2.5 rounded-xl border border-[#e6e8ef] px-3 py-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-[0.8125rem] font-semibold text-ink/60">
            {brandName.charAt(0).toUpperCase()}
          </span>
          <span className="truncate text-[0.875rem] font-semibold text-ink">
            {brandName}
          </span>
        </div>
      )}

      <nav className="px-3 pb-8">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/brand" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "mb-1.5 flex items-center gap-3 rounded-full px-3 py-2.5 transition-colors",
                active
                  ? "border border-[#cdb8fc] bg-[#faf8ff]"
                  : "border border-transparent hover:bg-neutral-50",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  active ? "bg-[#ecf1ff]" : "",
                )}
              >
                <Icon
                  className={cn(
                    "size-[1.15rem]",
                    active ? "text-naano-violet" : "text-[#7a8190]",
                  )}
                />
              </span>
              <span
                className={cn(
                  "flex-1 text-[0.9375rem] font-semibold",
                  active ? "text-naano-violet" : "text-[#4d576b]",
                )}
              >
                {label}
              </span>
              {href === "/brand/messages" && unreadMessages > 0 && (
                <span
                  aria-label={`${unreadMessages} unread message${unreadMessages === 1 ? "" : "s"}`}
                  className="flex min-w-[1.25rem] items-center justify-center rounded-full bg-naano-violet px-1.5 py-0.5 text-[0.6875rem] font-semibold text-white"
                >
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
