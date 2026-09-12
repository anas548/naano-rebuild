"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LayoutGrid, Link2, LogOut, Settings } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

// Matches the real menu. Only sign-out does anything yet.
const ITEMS = [
  { label: "Integrations", icon: Link2 },
  { label: "Settings", icon: Settings },
  { label: "Guided tour", icon: LayoutGrid },
];

/** The reference shows only an avatar in the top bar, so sign-out lives in a
 *  menu behind it rather than as its own button. */
export function AccountMenu({
  initial,
  avatarUrl,
}: {
  initial: string;
  avatarUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="relative block rounded-full"
      >
        <span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-[#dd005c] font-display text-[0.9375rem] font-semibold text-white">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={36} height={36} className="size-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-[#00b14e] ring-2 ring-white" />
      </button>

      <div
        hidden={!open}
        role="menu"
        className="absolute right-0 z-50 mt-3 w-60 rounded-xl border border-[#e6e8ef] bg-white p-2 shadow-[0_16px_40px_-12px_rgba(11,11,15,0.25)]"
      >
        {ITEMS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[0.875rem] text-ink/80 transition-colors hover:bg-neutral-50 hover:text-ink"
          >
            <Icon className="size-4 text-ink/50" />
            {label}
          </button>
        ))}

        <div className="my-1.5 h-px bg-neutral-100" />

        <form action={signOutAction}>
          <button
            type="submit"
            role="menuitem"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[0.875rem] text-ink/80 transition-colors hover:bg-neutral-50 hover:text-ink"
          >
            <LogOut className="size-4 text-ink/50" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
