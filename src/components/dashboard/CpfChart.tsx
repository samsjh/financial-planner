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

export default function CpfChart() {
  const simulationResult = useDashboardStore((s) => s.simulationResult);

  if (!simulationResult) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Run a simulation to see CPF Projection
      </div>
    );
  }

  const data = simulationResult.snapshots.map((s) => ({
    age: s.age,
    oa: Math.round(s.cpfOa),
    sa: Math.round(s.cpfSa),
    ma: Math.round(s.cpfMa),
  }));

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">CPF Projection</h3>
          <p className="text-xs text-muted-foreground">
            OA / SA / MA balances over time (2026 rules, $8k ceiling)
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradOa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.5} />
              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradSa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.5} />
              <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradMa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(280, 65%, 60%)" stopOpacity={0.5} />
              <stop offset="95%" stopColor="hsl(280, 65%, 60%)" stopOpacity={0.05} />
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
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Area
            type="monotone"
            dataKey="oa"
            stackId="1"
            stroke="hsl(217, 91%, 60%)"
            fill="url(#gradOa)"
            strokeWidth={1.5}
            name="Ordinary (OA)"
          />
          <Area
            type="monotone"
            dataKey="sa"
            stackId="1"
            stroke="hsl(160, 60%, 45%)"
            fill="url(#gradSa)"
            strokeWidth={1.5}
            name="Special (SA)"
          />
          <Area
            type="monotone"
            dataKey="ma"
            stackId="1"
            stroke="hsl(280, 65%, 60%)"
            fill="url(#gradMa)"
            strokeWidth={1.5}
            name="MediSave (MA)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
