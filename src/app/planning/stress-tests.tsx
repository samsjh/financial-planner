"use client";

import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/store";

export default function StressTestsPage() {
  const { setCurrentPhase } = useDashboardStore();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Stress Tests</h1>
        <p className="text-muted-foreground mb-8">Coming soon: Scenario testing and resilience analysis</p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentPhase("insurance")}>
            Back
          </Button>
          <Button onClick={() => setCurrentPhase("gaps")}>
            Next: Gap Analysis
          </Button>
        </div>
      </div>
    </div>
  );
}
