"use client";

const BASE =
  "flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-[0.9375rem] font-semibold text-ink shadow-[0_1px_2px_rgba(11,11,15,0.04)] transition-colors hover:bg-neutral-50";

/** Auth is stubbed for now, so these are inert by design. */
export function ProviderButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button type="button" className={BASE}>
      {icon}
      {label}
    </button>
  );
}
