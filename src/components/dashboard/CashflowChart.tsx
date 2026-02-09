"use client";

import { useDashboardStore } from "@/lib/store";
import {
  LineChart,
  Line,
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
    </div>
  );
}

export default function CashflowChart() {
  const simulationResult = useDashboardStore((s) => s.simulationResult);
  const profile = useDashboardStore((s) => s.profile);

  if (!simulationResult) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Run a simulation to see Cashflow Projection
      </div>
    );
  }

  const data = simulationResult.snapshots.map((s) => ({
    age: s.age,
    income: Math.round(s.totalIncome),
    expenses: Math.round(s.inflationAdjustedExpenses),
    tax: Math.round(s.taxPayable),
    surplus: Math.round(s.monthlySurplusDeficit * 12),
  }));

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">Annual Cashflow</h3>
          <p className="text-xs text-muted-foreground">
            Income vs. Expenses vs. Tax
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
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

          <ReferenceLine
            x={profile.desiredRetirementAge}
            stroke="hsl(340, 75%, 55%)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />

          <Line
            type="monotone"
            dataKey="income"
            stroke="hsl(160, 60%, 45%)"
            strokeWidth={2}
            dot={false}
            name="Total Income"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="hsl(340, 75%, 55%)"
            strokeWidth={2}
            dot={false}
            name="Total Expenses"
          />
          <Line
            type="monotone"
            dataKey="tax"
            stroke="hsl(30, 80%, 55%)"
            strokeWidth={1.5}
            dot={false}
            name="Tax"
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
