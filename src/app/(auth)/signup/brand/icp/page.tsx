import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandIcpForm } from "@/components/auth/brand-icp-form";
import { getBrandOnboardingContext } from "@/lib/brand-onboarding";

export const metadata: Metadata = { title: "Value prop & ICP — Naano" };

export default async function BrandIcpStepPage() {
  const { brand } = await getBrandOnboardingContext();
  if (brand.onboardingCompleted) redirect("/brand");
  if (!brand.websiteUrl) redirect("/signup/brand/website");

  return (
    <AuthLayout
      step="Step 2 of 3"
      progress={{ current: 2, total: 3 }}
      back={{ href: "/signup/brand/website", label: "Back" }}
      panel={
        <div className="max-w-[370px]">
          <h2 className="font-display text-4xl leading-tight font-semibold tracking-[-0.02em] text-white xl:text-[2.75rem]">
            Creators. Brands. Results.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/85">
            Run LinkedIn creator campaigns that drive real business - discover
            creators, track performance, pay in one click.
          </p>
          <p className="mt-8 text-[0.9375rem] text-white/70">
            Built for B2B marketing teams
          </p>
        </div>
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[0.9375rem] font-semibold text-ink/60">
          {brand.name?.charAt(0).toUpperCase() ?? "?"}
        </span>
        <div>
          <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-ink">
            Value prop &amp; ICP
          </h1>
          <p className="text-[0.875rem] text-ink/55">{brand.name}</p>
        </div>
      </div>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/55">
        Review these details once. Naano turns them into a brief for your
        creators.
      </p>

      <BrandIcpForm
        brandName={brand.name ?? ""}
        defaultValueProposition={brand.valueProposition ?? ""}
        defaultIcps={
          brand.icps.length === 3
            ? brand.icps.map((icp) => ({ title: icp.title, description: icp.description }))
            : [
                { title: "", description: "" },
                { title: "", description: "" },
                { title: "", description: "" },
              ]
        }
      />
    </AuthLayout>
  );
}
