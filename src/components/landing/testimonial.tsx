export function Testimonial() {
  return (
    <section className="bg-[#fbfaf8] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="font-display text-lg tracking-[0.3em] text-ink/80">
          {"{ zmirov }"}
        </div>
        <div className="mt-1 text-[0.5rem] tracking-[0.35em] text-ink/45 uppercase">
          Communication
        </div>
        <div className="mx-auto mt-5 h-px w-14 bg-naano-blue/60" />

        <blockquote className="mt-10 font-display text-3xl leading-[1.25] font-semibold tracking-[-0.02em] text-ink sm:text-[2.75rem]">
          &ldquo;We manage €10M+ of influence budget every year. For{" "}
          <span className="text-ink/45">B2B, Naano simply makes our life</span>{" "}
          <span className="text-naano-blue/40">easier</span>&rdquo;
        </blockquote>

        <div className="mt-10 flex flex-col items-center">
          <div className="size-14 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-500" />
          <div className="mt-4 text-sm font-semibold text-ink">David Zmirov</div>
          <div className="text-sm text-ink/60">CEO, Zmirov Communication</div>
          <div className="text-sm text-ink/40">Influence agency</div>
        </div>
      </div>
    </section>
  );
}
