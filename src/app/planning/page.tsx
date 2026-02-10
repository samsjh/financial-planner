"use client";

import { useDashboardStore } from "@/lib/store";
import IntakePage from "./intake";
import MilestonesPage from "./milestones";
import InsurancePage from "./insurance";
import StressTestsPage from "./stress-tests";
import GapsPage from "./gaps";
import RecommendationsPage from "./recommendations";

export default function PlanningLayout() {
  const currentPhase = useDashboardStore((s) => s.planState.currentPhase);

  return (
    <div className="min-h-screen bg-background">
      {currentPhase === "intake" && <IntakePage />}
      {currentPhase === "milestones" && <MilestonesPage />}
      {currentPhase === "insurance" && <InsurancePage />}
      {currentPhase === "stress-tests" && <StressTestsPage />}
      {currentPhase === "gaps" && <GapsPage />}
      {currentPhase === "recommendations" && <RecommendationsPage />}
    </div>
  );
}
