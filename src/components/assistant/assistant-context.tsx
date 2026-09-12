"use client";

import { createContext, useContext, useState } from "react";
import type { OpportunityPick } from "@/lib/assistant";

type OpportunityRanking = { picks: OpportunityPick[]; summary: string } | null;

type AssistantContextValue = {
  opportunityRanking: OpportunityRanking;
  setOpportunityRanking: (ranking: OpportunityRanking) => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

/**
 * Bridges the globally-mounted assistant bar and the Opportunities page,
 * which are siblings under the root layout rather than parent/child. When
 * the assistant answers a ranking question on /creator/opportunities, the
 * bar writes the result here; the Opportunities page reads it to highlight
 * and reorder the matching cards. Nothing is persisted — a fresh page load
 * starts with no ranking.
 */
export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [opportunityRanking, setOpportunityRanking] = useState<OpportunityRanking>(null);
  return (
    <AssistantContext.Provider value={{ opportunityRanking, setOpportunityRanking }}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistantContext() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistantContext must be used within AssistantProvider");
  return ctx;
}
