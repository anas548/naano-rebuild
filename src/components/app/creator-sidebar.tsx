"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IdCard,
  Layers,
  LayoutGrid,
  MessageCircle,
  Percent,
  Store,
  TrendingUp,
  UsersRound,
  Wallet,
} from "lucide-react";
import { NaanoLogo } from "@/components/naano-logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/creator", label: "Overview", icon: LayoutGrid },
  { href: "/creator/card", label: "My card", icon: IdCard },
  { href: "/creator/opportunities", label: "Opportunities", icon: Store },
  { href: "/creator/collaborations", label: "Collaborations", icon: Layers },
  { href: "/creator/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/creator/community", label: "Community", icon: UsersRound },
  { href: "/creator/earnings", label: "Earnings", icon: Wallet },
  { href: "/creator/affiliate", label: "Affiliate program", icon: Percent },
  { href: "/creator/messages", label: "Messages", icon: MessageCircle },
];

export function CreatorSidebar({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[285px] shrink-0 border-r border-[#e6e8ef] bg-white lg:block">
      <div className="px-7 py-7">
        <Link href="/creator" aria-label="Naano">
          <NaanoLogo markClassName="xl:h-[1.6rem] xl:w-[2.15rem]" />
        </Link>
      </div>

      <nav className="px-3 pb-8">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/creator" ? pathname === href : pathname.startsWith(href);

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
              {href === "/creator/messages" && unreadMessages > 0 && (
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
