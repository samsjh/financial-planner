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
  Cell,
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

export default function NetWorthWaterfall() {
  const simulationResult = useDashboardStore((s) => s.simulationResult);

  if (!simulationResult) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Run a simulation to see Net Worth Breakdown
      </div>
    );
  }

  const first = simulationResult.snapshots[0];
  if (!first) return null;

  const data = [
    { name: "Liquid Assets", value: first.liquidAssets, fill: "hsl(217, 91%, 60%)" },
    { name: "Fixed Assets", value: first.fixedAssets, fill: "hsl(30, 80%, 55%)" },
    { name: "CPF Total", value: first.cpfTotal, fill: "hsl(160, 60%, 45%)" },
    { name: "Liabilities", value: -first.totalLiabilities, fill: "hsl(0, 63%, 55%)" },
    { name: "Net Worth", value: first.netWorth, fill: "hsl(280, 65%, 60%)" },
  ];

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">Net Worth Waterfall</h3>
          <p className="text-xs text-muted-foreground">
            Current asset & liability breakdown
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
            dataKey="name"
            tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }}
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
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              backgroundColor: "hsl(222, 47%, 8%)",
              border: "1px solid hsl(222, 30%, 18%)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
