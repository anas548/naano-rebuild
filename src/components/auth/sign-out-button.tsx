import { signOutAction } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-[0.8125rem] font-medium text-ink/70 transition-colors hover:text-ink"
      >
        Sign out
      </button>
    </form>
  );
}
