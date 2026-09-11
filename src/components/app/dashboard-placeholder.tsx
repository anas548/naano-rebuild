import { NaanoLogo } from "@/components/naano-logo";
import { signOutAction } from "@/app/actions/auth";

export function DashboardPlaceholder({
  firstName,
  role,
  next,
}: {
  firstName: string;
  role: string;
  next: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fcfcfc]">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 sm:px-10">
        <NaanoLogo markClassName="xl:h-[1.6rem] xl:w-[2.15rem]" />
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-[0.8125rem] font-medium text-ink/70 transition-colors hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-naano-blue uppercase">
            {role} workspace
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.02em] text-ink">
            You&apos;re signed in, {firstName}.
          </h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/55">
            {next}
          </p>
        </div>
      </main>
    </div>
  );
}
