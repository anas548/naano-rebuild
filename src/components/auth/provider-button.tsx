"use client";

import Link from "next/link";

const BASE =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.9375rem] font-semibold text-ink shadow-[0_1px_2px_rgba(11,11,15,0.04)] transition-colors hover:bg-neutral-50";

/** OAuth is out of scope for stub auth, so those buttons are inert. Only the
 *  email route goes anywhere. */
export function ProviderButton({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
}) {
  if (href) {
    return (
      <Link href={href} className={BASE}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={BASE}>
      {icon}
      {label}
    </button>
  );
}
