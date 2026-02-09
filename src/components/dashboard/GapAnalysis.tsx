"use client";

import { useDashboardStore } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
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
      {payload.length >= 2 && (
        <div className="border-t border-border mt-1 pt-1">
          <span className="text-muted-foreground">Gap: </span>
          <span
            className={`font-mono font-semibold ${
              payload[0].value >= payload[1].value
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {formatCurrency(payload[0].value - payload[1].value)}/mo
          </span>
        </div>
      )}
    </div>
  );
}

export default function GapAnalysis() {
  const simulationResult = useDashboardStore((s) => s.simulationResult);

  if (!simulationResult || simulationResult.gapAnalysis.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Run a simulation to see your Income Gap Analysis
      </div>
    );
  }

  const data = simulationResult.gapAnalysis.map((g) => ({
    age: g.age,
    passiveIncome: Math.round(g.projectedMonthlyPassiveIncome),
    desiredSpend: Math.round(g.desiredMonthlySpend),
    gap: Math.round(g.gap),
  }));

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">Retirement Income Gap</h3>
          <p className="text-xs text-muted-foreground">
            Passive Income vs. Desired Spending (Monthly)
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
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
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <ReferenceLine y={0} stroke="hsl(222, 30%, 25%)" />
          <Bar
            dataKey="passiveIncome"
            fill="hsl(160, 60%, 45%)"
            fillOpacity={0.8}
            radius={[2, 2, 0, 0]}
            name="Passive Income"
          />
          <Bar
            dataKey="desiredSpend"
            fill="hsl(340, 75%, 55%)"
            fillOpacity={0.6}
            radius={[2, 2, 0, 0]}
            name="Desired Spending"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
