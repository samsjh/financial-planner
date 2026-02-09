"use client";

import { useDashboardStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useCallback } from "react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PdfExport() {
  const simulationResult = useDashboardStore((s) => s.simulationResult);
  const profile = useDashboardStore((s) => s.profile);

  const handleExport = useCallback(() => {
    if (!simulationResult) return;

    // Build CSV data
    const headers = [
      "Year",
      "Age",
      "Phase",
      "Total Income",
      "Expenses",
      "Tax",
      "CPF OA",
      "CPF SA",
      "CPF MA",
      "CPF Total",
      "Liquid Assets",
      "Fixed Assets",
      "Liabilities",
      "Net Worth",
      "Monthly Surplus",
    ];

    const rows = simulationResult.snapshots.map((s) => [
      s.year,
      s.age,
      s.isRetired ? "Retirement" : "Accumulation",
      formatCurrency(s.totalIncome),
      formatCurrency(s.inflationAdjustedExpenses),
      formatCurrency(s.taxPayable),
      formatCurrency(s.cpfOa),
      formatCurrency(s.cpfSa),
      formatCurrency(s.cpfMa),
      formatCurrency(s.cpfTotal),
      formatCurrency(s.liquidAssets),
      formatCurrency(s.fixedAssets),
      formatCurrency(s.totalLiabilities),
      formatCurrency(s.netWorth),
      formatCurrency(s.monthlySurplusDeficit),
    ]);

    // KPI Summary
    const summary = [
      "",
      "=== SINGAPORE WEALTH MANAGEMENT REPORT ===",
      `Client: ${profile.name || "N/A"}`,
      `Gender: ${profile.gender} | Current Age: ${profile.currentAge}`,
      `Retirement Age: ${profile.desiredRetirementAge} | Mortality: ${simulationResult.mortalityAge}`,
      `Financial Freedom Age: ${simulationResult.financialFreedomAge || "Not Reached"}`,
      `Projected Surplus/Shortfall at Mortality: ${formatCurrency(simulationResult.projectedShortfallSurplus)}`,
      `Inflation Adjusted: ${profile.useInflationAdjusted ? "Yes" : "No"}`,
      `Stress Test: ${profile.activeStressTest}`,
      "",
    ];

    const csvContent = [
      ...summary,
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `wealth-report-${profile.name || "client"}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [simulationResult, profile]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!simulationResult}
      className="text-xs"
    >
      <FileDown className="h-3.5 w-3.5 mr-1.5" />
      Export Report
    </Button>
  );
}
