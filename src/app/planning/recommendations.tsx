"use client";

import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/lib/store";

export default function RecommendationsPage() {
  const { setCurrentPhase } = useDashboardStore();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Recommendations</h1>
        <p className="text-muted-foreground mb-8">Coming soon: Prioritized action plan and PDF export</p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setCurrentPhase("gaps")}>
            Back
          </Button>
          <Button onClick={() => setCurrentPhase("intake")}>
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}
