"use client";

import { useDashboardStore } from "@/lib/store";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-2">Age {label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WealthChart() {
  const simulationResult = useDashboardStore((s) => s.simulationResult);
  const profile = useDashboardStore((s) => s.profile);

  if (!simulationResult) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Run a simulation to see your Wealth Flight Path
      </div>
    );
  }

  const data = simulationResult.snapshots.map((s) => ({
    age: s.age,
    liquidAssets: Math.round(s.liquidAssets),
    cpfTotal: Math.round(s.cpfTotal),
    fixedAssets: Math.round(s.fixedAssets),
    totalLiabilities: Math.round(-s.totalLiabilities),
    netWorth: Math.round(profile.useInflationAdjusted ? s.netWorthPV : s.netWorth),
  }));

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">Wealth Flight Path</h3>
          <p className="text-xs text-muted-foreground">
            Stacked asset projection
            {profile.useInflationAdjusted ? " (Inflation-Adjusted PV)" : " (Nominal)"}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradLiquid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradCpf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradFixed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(30, 80%, 55%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(30, 80%, 55%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(222, 30%, 18%)"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 11, fill: "hsl(215, 20%, 55%)" }}
            axisLine={{ stroke: "hsl(222, 30%, 18%)" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11, fill: "hsl(215, 20%, 55%)" }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
          />

          {/* Retirement Reference Line */}
          <ReferenceLine
            x={profile.desiredRetirementAge}
            stroke="hsl(340, 75%, 55%)"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{
              value: "Retirement",
              position: "top",
              fill: "hsl(340, 75%, 55%)",
              fontSize: 11,
              fontWeight: 600,
            }}
          />

          <Area
            type="monotone"
            dataKey="fixedAssets"
            stackId="1"
            stroke="hsl(30, 80%, 55%)"
            fill="url(#gradFixed)"
            strokeWidth={1.5}
            name="Fixed Assets"
          />
          <Area
            type="monotone"
            dataKey="cpfTotal"
            stackId="1"
            stroke="hsl(160, 60%, 45%)"
            fill="url(#gradCpf)"
            strokeWidth={1.5}
            name="CPF Total"
          />
          <Area
            type="monotone"
            dataKey="liquidAssets"
            stackId="1"
            stroke="hsl(217, 91%, 60%)"
            fill="url(#gradLiquid)"
            strokeWidth={1.5}
            name="Liquid Assets"
          />
          <Area
            type="monotone"
            dataKey="totalLiabilities"
            stackId="1"
            stroke="hsl(0, 63%, 55%)"
            fill="hsl(0, 63%, 55%)"
            fillOpacity={0.15}
            strokeWidth={1.5}
            name="Liabilities"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
