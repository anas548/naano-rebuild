export function TabPlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="font-display text-[1.875rem] font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h1>
      <div className="mt-6 rounded-xl border border-dashed border-[#d7dbe5] bg-white px-6 py-16 text-center">
        <p className="text-[0.9375rem] text-ink/50">{note}</p>
      </div>
    </div>
  );
}
