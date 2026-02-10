"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store";
import InputSidebar from "@/components/dashboard/InputSidebar";
import WealthChart from "@/components/dashboard/WealthChart";
import GapAnalysis from "@/components/dashboard/GapAnalysis";
import CashflowChart from "@/components/dashboard/CashflowChart";
import CpfChart from "@/components/dashboard/CpfChart";
import NetWorthWaterfall from "@/components/dashboard/NetWorthWaterfall";
import KpiCards from "@/components/dashboard/KpiCards";
import DataTable from "@/components/dashboard/DataTable";
import AssumptionsPanel from "@/components/dashboard/AssumptionsPanel";
import PdfExport from "@/components/dashboard/PdfExport";
import { AssetManager, LiabilityManager } from "@/components/dashboard/AssetLiabilityManager";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const runSimulation = useDashboardStore((s) => s.runSimulation);
  const simulationResult = useDashboardStore((s) => s.simulationResult);
  const profile = useDashboardStore((s) => s.profile);

  // Run initial simulation on mount
  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ─── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:block w-[380px] flex-shrink-0">
        <InputSidebar />
      </aside>

      {/* ─── Mobile Sidebar Sheet ─────────────────────────────── */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-3 left-3 z-50 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[380px] p-0">
          <InputSidebar />
        </SheetContent>
      </Sheet>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  SG Wealth Planner
                </h1>
                <p className="text-xs text-muted-foreground">
                  Singapore Financial Planning Dashboard
                  {profile.name ? ` — ${profile.name}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <AssetManager />
              <LiabilityManager />
              <PdfExport />
              {profile.activeStressTest !== "none" && (
                <Badge variant="destructive" className="text-[10px]">
                  STRESS: {profile.activeStressTest.toUpperCase()}
                </Badge>
              )}
              {profile.useInflationAdjusted && (
                <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400">
                  INFLATION ADJ.
                </Badge>
              )}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* KPI Cards */}
          <KpiCards />

          {/* Charts */}
          <Tabs defaultValue="wealth" className="w-full">
            <TabsList className="bg-card border border-border w-full justify-start overflow-x-auto">
              <TabsTrigger value="wealth" className="text-xs">
                Wealth Flight Path
              </TabsTrigger>
              <TabsTrigger value="gap" className="text-xs">
                Income Gap
              </TabsTrigger>
              <TabsTrigger value="cashflow" className="text-xs">
                Cashflow
              </TabsTrigger>
              <TabsTrigger value="cpf" className="text-xs">
                CPF Projection
              </TabsTrigger>
              <TabsTrigger value="waterfall" className="text-xs">
                Net Worth
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs">
                Data Table
              </TabsTrigger>
              <TabsTrigger value="assumptions" className="text-xs">
                Assumptions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wealth">
              <Card className="bg-card border-border">
                <CardContent className="p-4 h-[450px]">
                  <WealthChart />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gap">
              <Card className="bg-card border-border">
                <CardContent className="p-4 h-[450px]">
                  <GapAnalysis />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cashflow">
              <Card className="bg-card border-border">
                <CardContent className="p-4 h-[450px]">
                  <CashflowChart />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cpf">
              <Card className="bg-card border-border">
                <CardContent className="p-4 h-[450px]">
                  <CpfChart />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="waterfall">
              <Card className="bg-card border-border">
                <CardContent className="p-4 h-[450px]">
                  <NetWorthWaterfall />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data">
              <Card className="bg-card border-border">
                <CardContent className="p-4 h-[450px]">
                  <DataTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assumptions">
              <AssumptionsPanel />
            </TabsContent>
          </Tabs>

          {/* Bottom: Two charts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 h-[350px]">
                <CpfChart />
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4 h-[350px]">
                <GapAnalysis />
              </CardContent>
            </Card>
          </div>

          {/* Property Sale Proceeds Section */}
          {simulationResult?.propertySaleProceeds && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">
                  Property Sale Proceeds Calculator
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Net cash proceeds upon property sale (accounting for CPF
                  Accrued Interest refund at 2.5% compounding)
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    {
                      label: "Market Value",
                      value: simulationResult.propertySaleProceeds.marketValue,
                      color: "text-green-400",
                    },
                    {
                      label: "Outstanding Loan",
                      value:
                        -simulationResult.propertySaleProceeds.outstandingLoan,
                      color: "text-red-400",
                    },
                    {
                      label: "CPF Principal",
                      value:
                        -simulationResult.propertySaleProceeds.cpfPrincipalUsed,
                      color: "text-red-400",
                    },
                    {
                      label: "CPF Accrued Interest",
                      value:
                        -simulationResult.propertySaleProceeds
                          .cpfAccruedInterest,
                      color: "text-red-400",
                    },
                    {
                      label: "Net Cash Proceeds",
                      value:
                        simulationResult.propertySaleProceeds.netCashProceeds,
                      color:
                        simulationResult.propertySaleProceeds.netCashProceeds >=
                        0
                          ? "text-green-400"
                          : "text-red-400",
                    },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.label}
                      </p>
                      <p className={`text-sm font-bold font-mono ${item.color}`}>
                        $
                        {Math.abs(item.value).toLocaleString("en-SG", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-[10px] text-muted-foreground/50">
              SG Wealth Planner — For educational and planning purposes only.
              CPF rates as of 2026 ($8,000 ceiling). Consult a licensed
              financial advisor for personalized advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
