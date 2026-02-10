"use client";

import { useDashboardStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WealthChart from "@/components/dashboard/WealthChart";

function formatCurrency(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return "$0";
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export default function KpiPanel() {
  const { profile, simulationResult } = useDashboardStore();

  if (!simulationResult) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">Enter your details to see live projections</p>
      </div>
    );
  }

  const retirementAge = profile.desiredRetirementAge;
  const currentAge = profile.currentAge;
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  // Get snapshot at current age and at retirement
  const currentSnapshot = simulationResult.snapshots[0];
  const retirementSnapshot = simulationResult.snapshots.find((s) => s.age >= retirementAge) || simulationResult.snapshots[simulationResult.snapshots.length - 1];

  const cpfAtRetirement = retirementSnapshot?.cpfTotal || 0;
  const netWorthNow = currentSnapshot?.netWorth || 0;
  const monthlyNetCashflow = currentSnapshot?.monthlySurplusDeficit || 0;

  return (
    <div className="h-full flex flex-col overflow-auto p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-sm">Live Projections</h3>
        <p className="text-xs text-muted-foreground">Updates as you edit</p>
      </div>

      {/* KPI Cards */}
      <div className="space-y-3">
        <Card className="bg-background border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Years to Retirement</p>
            <p className="text-2xl font-bold">{yearsToRetirement}</p>
            <p className="text-xs text-muted-foreground mt-1">Target: Age {retirementAge}</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Estimated CPF at {retirementAge}</p>
            <p className="text-2xl font-bold">{formatCurrency(cpfAtRetirement)}</p>
            <p className="text-xs text-muted-foreground mt-1">All pockets combined</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Current Net Worth</p>
            <p className="text-2xl font-bold">{formatCurrency(netWorthNow)}</p>
            <p className="text-xs text-muted-foreground mt-1">Assets minus liabilities</p>
          </CardContent>
        </Card>

        <Card className={`bg-background border-border ${monthlyNetCashflow >= 0 ? "border-green-600/30" : "border-red-600/30"}`}>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">Monthly Cashflow</p>
            <p className={`text-2xl font-bold ${monthlyNetCashflow >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(monthlyNetCashflow)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{monthlyNetCashflow >= 0 ? "Saving" : "Deficit"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-background border-border flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Wealth Flight Path</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="w-full h-full">
            <WealthChart compact />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
