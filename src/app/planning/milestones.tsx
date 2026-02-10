"use client";

import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/store";

export default function MilestonesPage() {
  const { setCurrentPhase } = useDashboardStore();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Life Milestones</h1>
        <p className="text-muted-foreground mb-8">Coming soon: Timeline and event management</p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentPhase("intake")}>
            Back to Intake
          </Button>
          <Button onClick={() => setCurrentPhase("insurance")}>
            Next: Insurance
          </Button>
        </div>
      </div>
    </div>
  );
}
