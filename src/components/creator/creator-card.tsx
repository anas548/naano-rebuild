import { Calendar, Share2 } from "lucide-react";
import { NaanoLogo } from "@/components/naano-logo";
import { LinkedInIcon } from "@/components/landing/icons";
import { formatEuros } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export type CreatorCardData = {
  name: string;
  headline: string | null;
  industries: string[];
  followerCount: number;
  estImpressions: number | null;
  pricePerPostCents: number | null;
  hasPostData: boolean;
};

/** The creator's marketplace card. The signup preview renders the blue,
 *  empty version of the same card the dashboard shows in violet. */
export function CreatorCard({
  data,
  tone = "violet",
  showShare = false,
  className,
}: {
  data: CreatorCardData;
  tone?: "violet" | "blue";
  showShare?: boolean;
  className?: string;
}) {
  const { name, headline, industries, followerCount, pricePerPostCents } = data;
  // The signup preview has no real person behind it yet.
  const hasIdentity = name !== "Your name";

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[1.5rem] bg-white shadow-[0_24px_60px_-20px_rgba(11,11,15,0.25)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex min-h-[7.75rem] items-center justify-center overflow-hidden px-5 pb-8",
          tone === "violet"
            ? "bg-gradient-to-br from-[#5218dc] to-[#6d3cf5]"
            : "bg-gradient-to-br from-naano-blue to-[#4f7bf5]",
        )}
      >
        <span className="absolute -top-10 -right-10 size-32 rounded-full bg-white/[0.07]" />
        <span className="absolute top-5 left-5 flex size-11 items-center justify-center rounded-xl bg-white/95 shadow-sm">
          <LinkedInIcon className="size-6" />
        </span>
        <NaanoLogo
          className="text-white"
          wordmarkClassName="text-white"
          markClassName="h-[1.15rem] w-[1.5rem] xl:h-[1.15rem] xl:w-[1.5rem]"
        />
        {showShare && (
          <span className="absolute top-5 right-5 flex size-11 items-center justify-center rounded-xl bg-white/95 shadow-sm">
            <Share2 className="size-5 text-ink/70" />
          </span>
        )}
      </div>

      <div className="relative -mt-[2.65rem] px-7 text-center">
        <div
          className={cn(
            "mx-auto flex size-[5.3rem] items-center justify-center rounded-full ring-[5px] ring-white",
            hasIdentity ? "bg-[#dd005c]" : "bg-neutral-100",
          )}
        >
          <span
            className={cn(
              "font-display text-[2rem] font-semibold",
              hasIdentity ? "text-white" : "text-ink/25",
            )}
          >
            {name.trim().charAt(0).toUpperCase() || "Y"}
          </span>
        </div>

        <h3 className="mt-4 font-display text-[1.625rem] font-semibold tracking-tight text-ink">
          {name}
        </h3>
        {industries.length > 0 && (
          <p className="mt-1 text-[0.9375rem] text-ink/55">
            {industries.join(" · ")}
          </p>
        )}
        <p className="mt-3 text-[0.875rem] text-ink/50">
          {headline ?? "Your LinkedIn headline and topics will appear here."}
        </p>

        {!data.hasPostData && (
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-50 px-3 py-1.5 text-[0.75rem] text-ink/50 ring-1 ring-black/5">
            <Calendar className="size-3.5" />
            No post data available
          </span>
        )}

        <div className="mt-5 mb-5 flex items-center gap-4">
          <span className="text-[0.8125rem] text-ink/45">Data</span>
          <span className="h-1.5 flex-1 rounded-full bg-neutral-100" />
          <span className="text-[0.8125rem] text-ink/45">Pending</span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-neutral-100 border-t border-neutral-100">
        {[
          { value: followerCount > 0 ? followerCount.toLocaleString() : "0", label: "Followers" },
          { value: data.estImpressions ? data.estImpressions.toLocaleString() : "—", label: "Est. impressions" },
          {
            value: pricePerPostCents ? formatEuros(pricePerPostCents) : "—",
            label: pricePerPostCents ? "Chosen cost" : "Cost / post",
          },
        ].map((stat) => (
          <div key={stat.label} className="px-2 py-6 text-center">
            <div className="font-display text-xl leading-none font-bold text-ink/80">
              {stat.value}
            </div>
            <div className="mt-2.5 text-[0.75rem] whitespace-nowrap text-ink/45">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
