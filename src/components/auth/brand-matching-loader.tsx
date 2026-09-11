"use client";

import { useEffect, useState } from "react";
import { completeBrandOnboardingAction } from "@/app/actions/brand-onboarding";

const STEPS = [
  "Reading your creator brief…",
  "Scanning creator profiles…",
  "Ranking by audience fit…",
];

/** Per scope: AI matching has no real logic behind it yet — this just holds
 *  on a believable loading beat, then hands off to the dashboard. */
export function BrandMatchingLoader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 650);

    const done = setTimeout(() => {
      completeBrandOnboardingAction();
    }, 2100);

    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, []);

  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <span className="relative flex size-14 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-naano-blue/20" />
        <span className="relative flex size-14 items-center justify-center rounded-full bg-naano-blue/10">
          <span className="size-3 rounded-full bg-naano-blue" />
        </span>
      </span>
      <p className="mt-5 text-[0.9375rem] font-medium text-ink/70">
        {STEPS[stepIndex]}
      </p>
    </div>
  );
}
