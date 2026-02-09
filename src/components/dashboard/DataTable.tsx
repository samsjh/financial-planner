"use client";

import { useDashboardStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DataTable() {
  const simulationResult = useDashboardStore((s) => s.simulationResult);

  if (!simulationResult) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Run a simulation to see the data table
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Year-by-Year Projection</h3>
        <p className="text-xs text-muted-foreground">
          {simulationResult.snapshots.length} years projected
        </p>
      </div>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 px-2 font-medium">Age</th>
                <th className="py-2 px-2 font-medium">Year</th>
                <th className="py-2 px-2 font-medium">Phase</th>
                <th className="py-2 px-2 font-medium text-right">Income</th>
                <th className="py-2 px-2 font-medium text-right">Expenses</th>
                <th className="py-2 px-2 font-medium text-right">Tax</th>
                <th className="py-2 px-2 font-medium text-right">CPF Total</th>
                <th className="py-2 px-2 font-medium text-right">Liquid</th>
                <th className="py-2 px-2 font-medium text-right">Net Worth</th>
                <th className="py-2 px-2 font-medium text-right">Surplus/mo</th>
              </tr>
            </thead>
            <tbody>
              {simulationResult.snapshots.map((s) => (
                <tr
                  key={s.age}
                  className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                    s.isRetired ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="py-1.5 px-2 font-mono">{s.age}</td>
                  <td className="py-1.5 px-2 font-mono text-muted-foreground">
                    {s.year}
                  </td>
                  <td className="py-1.5 px-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        s.isRetired
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {s.isRetired ? "Retire" : "Work"}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">
                    {formatCurrency(s.totalIncome)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-red-400/80">
                    {formatCurrency(s.inflationAdjustedExpenses)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-orange-400/80">
                    {formatCurrency(s.taxPayable)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-green-400/80">
                    {formatCurrency(s.cpfTotal)}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-blue-400/80">
                    {formatCurrency(s.liquidAssets)}
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-mono font-medium ${
                      s.netWorth >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {formatCurrency(s.netWorth)}
                  </td>
                  <td
                    className={`py-1.5 px-2 text-right font-mono ${
                      s.monthlySurplusDeficit >= 0
                        ? "text-green-400/80"
                        : "text-red-400/80"
                    }`}
                  >
                    {formatCurrency(s.monthlySurplusDeficit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}
