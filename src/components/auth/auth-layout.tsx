import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { NaanoLogo } from "@/components/naano-logo";
import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  children: React.ReactNode;
  /** Content for the right-hand panel. */
  panel: React.ReactNode;
  /** The brand-blue panel is the default; the creator flow uses a light one. */
  panelTone?: "blue" | "light";
  back?: { href: string; label: string };
  step?: string;
};

export function AuthLayout({
  children,
  panel,
  panelTone = "blue",
  back,
  step,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center bg-[#fcfcfc] px-6 py-12 sm:px-10">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link href="/" aria-label="Naano home">
            <NaanoLogo
              showWordmark={false}
              className="text-ink"
              markClassName="xl:h-[1.6rem] xl:w-[2.15rem]"
            />
          </Link>
          <button
            type="button"
            className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink/70 transition-colors hover:text-ink"
          >
            <Globe className="size-3.5" />
            EN
          </button>
        </div>

        <div className="mx-auto mt-10 w-full max-w-md">
          {back && (
            <Link
              href={back.href}
              className="mb-6 inline-flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-ink"
            >
              <ArrowLeft className="size-4" />
              {back.label}
            </Link>
          )}
          {step && (
            <p className="mb-3 text-[0.6875rem] font-semibold tracking-[0.12em] text-naano-blue uppercase">
              {step}
            </p>
          )}
          {children}
        </div>
      </div>

      <div
        className={cn(
          "relative hidden items-center overflow-hidden lg:flex",
          panelTone === "blue" ? "bg-naano-blue" : "bg-[#eef1fd]",
        )}
      >
        <div className="mx-auto w-full max-w-[540px] px-5 py-16">{panel}</div>
      </div>
    </div>
  );
}
