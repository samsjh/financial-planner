"use client";

import { useDashboardStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Skull,
  ShieldCheck,
  Wallet,
  Building2,
  PiggyBank,
} from "lucide-react";
import { MORTALITY_AGE, CONSERVATIVE_MORTALITY_AGE } from "@/lib/engine/constants";

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

function KpiCard({ title, value, subtitle, icon, trend, color }: KpiCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p
              className={`text-xl font-bold tracking-tight ${
                color ||
                (trend === "up"
                  ? "text-green-400"
                  : trend === "down"
                  ? "text-red-400"
                  : "text-foreground")
              }`}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-[10px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={`p-2 rounded-lg ${
              trend === "up"
                ? "bg-green-400/10 text-green-400"
                : trend === "down"
                ? "bg-red-400/10 text-red-400"
                : "bg-primary/10 text-primary"
            }`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function KpiCards() {
  const simulationResult = useDashboardStore((s) => s.simulationResult);
  const profile = useDashboardStore((s) => s.profile);

  if (!simulationResult) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Financial Freedom Age"
          value="—"
          subtitle="Run simulation"
          icon={<Target className="h-4 w-4" />}
        />
        <KpiCard
          title="Projected at Mortality"
          value="—"
          subtitle="Run simulation"
          icon={<Skull className="h-4 w-4" />}
        />
        <KpiCard
          title="Net Worth Today"
          value="—"
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          title="CPF Total"
          value="—"
          icon={<PiggyBank className="h-4 w-4" />}
        />
      </div>
    );
  }

  const first = simulationResult.snapshots[0];
  const mortalityAge = profile.conservativeMode
    ? CONSERVATIVE_MORTALITY_AGE
    : MORTALITY_AGE[profile.gender];

  const freedomAge = simulationResult.financialFreedomAge;
  const surplus = simulationResult.projectedShortfallSurplus;

  // Property sale proceeds
  const propSale = simulationResult.propertySaleProceeds;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Financial Freedom Age */}
      <KpiCard
        title="Financial Freedom Age"
        value={freedomAge ? `Age ${freedomAge}` : "Not Reached"}
        subtitle={
          freedomAge
            ? `${freedomAge - profile.currentAge} years from now`
            : "Passive income never exceeds desired spend"
        }
        icon={<Target className="h-4 w-4" />}
        trend={freedomAge ? "up" : "down"}
      />

      {/* Projected at Mortality */}
      <KpiCard
        title={`Assets at ${mortalityAge}`}
        value={formatCurrency(surplus)}
        subtitle={
          surplus >= 0
            ? `Surplus at mortality (${profile.gender})`
            : `Shortfall — money runs out before ${mortalityAge}`
        }
        icon={surplus >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        trend={surplus >= 0 ? "up" : "down"}
      />

      {/* Net Worth Today */}
      <KpiCard
        title="Net Worth (Today)"
        value={formatCurrency(first?.netWorth || 0)}
        subtitle={`Liquid: ${formatCurrency(first?.liquidNetWorth || 0)}`}
        icon={<Wallet className="h-4 w-4" />}
      />

      {/* CPF Total */}
      <KpiCard
        title="CPF Total"
        value={formatCurrency(first?.cpfTotal || 0)}
        subtitle={`OA: ${formatCurrency(first?.cpfOa || 0)} | SA: ${formatCurrency(first?.cpfSa || 0)}`}
        icon={<PiggyBank className="h-4 w-4" />}
      />

      {/* Monthly Surplus / Deficit */}
      <KpiCard
        title="Monthly Surplus"
        value={formatCurrency(first?.monthlySurplusDeficit || 0)}
        subtitle="Current monthly cashflow"
        icon={
          (first?.monthlySurplusDeficit || 0) >= 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )
        }
        trend={(first?.monthlySurplusDeficit || 0) >= 0 ? "up" : "down"}
      />

      {/* Peak Net Worth */}
      <KpiCard
        title="Peak Net Worth"
        value={formatCurrency(
          Math.max(...simulationResult.snapshots.map((s) => s.netWorth))
        )}
        subtitle={`At age ${
          simulationResult.snapshots.reduce((max, s) =>
            s.netWorth > max.netWorth ? s : max
          ).age
        }`}
        icon={<TrendingUp className="h-4 w-4" />}
        color="text-blue-400"
      />

      {/* Tax Payable (Year 1) */}
      <KpiCard
        title="Tax Payable (This Year)"
        value={formatCurrency(first?.taxPayable || 0)}
        subtitle={`Effective rate: ${((first?.taxPayable || 0) / Math.max(1, first?.grossIncome || 1) * 100).toFixed(1)}%`}
        icon={<Building2 className="h-4 w-4" />}
      />

      {/* Property Sale Proceeds */}
      <KpiCard
        title="Property Net Proceeds"
        value={propSale ? formatCurrency(propSale.netCashProceeds) : "N/A"}
        subtitle={
          propSale
            ? `After CPF refund & accrued interest`
            : "No property data"
        }
        icon={<ShieldCheck className="h-4 w-4" />}
        color={propSale && propSale.netCashProceeds > 0 ? "text-green-400" : "text-red-400"}
      />
    </div>
  );
}
