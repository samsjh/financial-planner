"use client";

import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/store";

export default function InsurancePage() {
  const { setCurrentPhase } = useDashboardStore();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Insurance Assessment</h1>
        <p className="text-muted-foreground mb-8">Coming soon: Insurance gap analysis and policy tracker</p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentPhase("milestones")}>
            Back
          </Button>
          <Button onClick={() => setCurrentPhase("stress-tests")}>
            Next: Stress Tests
          </Button>
        </div>
      </div>
    </div>
  );
}
