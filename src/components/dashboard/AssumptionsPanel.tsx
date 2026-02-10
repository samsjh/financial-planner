"use client";

import {
  CPF_ALLOCATION_RATES,
  CPF_OA_INTEREST_RATE,
  CPF_SA_INTEREST_RATE,
  CPF_MA_INTEREST_RATE,
  CPF_RA_INTEREST_RATE,
  CPF_EXTRA_INTEREST_FIRST_60K,
  CPF_EXTRA_INTEREST_NEXT_30K,
  CPF_MONTHLY_SALARY_CEILING,
  CPF_RETIREMENT_SUMS,
  CPF_LIFE_PLANS,
  projectCpfRetirementSum,
  CPF_RETIREMENT_SUM_HISTORY,
  IRAS_TAX_BRACKETS,
  TOTAL_PERSONAL_RELIEFS_CAP,
  SRS_RELIEF_CAP,
  LIFE_INSURANCE_RELIEF_CAP,
  EARNED_INCOME_RELIEF_BELOW_55,
  EARNED_INCOME_RELIEF_55_TO_59,
  EARNED_INCOME_RELIEF_60_AND_ABOVE,
  DEFAULT_INFLATION_RATE,
  DEFAULT_MEDICAL_INFLATION_RATE,
  DEFAULT_EDUCATION_INFLATION_RATE,
  DEFAULT_PROPERTY_APPRECIATION,
  DEFAULT_EQUITY_RETURN,
  DEFAULT_CONSERVATIVE_RETURN,
  DEFAULT_PASSIVE_INCOME_YIELD,
  DEFAULT_CASH_YIELD,
  DEFAULT_FD_TBILL_YIELD,
  DEFAULT_ROBO_ADVISOR_RETURN,
  DEFAULT_SHIELD_PREMIUM_ESCALATION,
  LIA_BENCHMARKS,
  MORTALITY_AGE,
  CONSERVATIVE_MORTALITY_AGE,
  RETRENCHMENT_DURATION_MONTHS,
  MARKET_CRASH_LOSS_PERCENT,
  LATE_CI_EXPENSE_INCREASE_PERCENT,
} from "@/lib/engine/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info, DollarSign, Landmark, Heart, TrendingUp, AlertTriangle } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

function pct1(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function currency(v: number): string {
  return `$${v.toLocaleString("en-SG")}`;
}

// ─── Sub-Tables ──────────────────────────────────────────────────────────────

function CpfContributionTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 pr-2 font-medium">Age Band</th>
            <th className="text-right py-2 px-2 font-medium">Employee</th>
            <th className="text-right py-2 px-2 font-medium">Employer</th>
            <th className="text-right py-2 px-2 font-medium">Total</th>
            <th className="text-right py-2 px-2 font-medium">OA</th>
            <th className="text-right py-2 px-2 font-medium">SA</th>
            <th className="text-right py-2 pl-2 font-medium">MA</th>
          </tr>
        </thead>
        <tbody>
          {CPF_ALLOCATION_RATES.map((b) => (
            <tr key={b.label} className="border-b border-border/50 hover:bg-muted/30">
              <td className="py-1.5 pr-2 font-mono">{b.label}</td>
              <td className="py-1.5 px-2 text-right font-mono">{pct1(b.employeeRate)}</td>
              <td className="py-1.5 px-2 text-right font-mono">{pct1(b.employerRate)}</td>
              <td className="py-1.5 px-2 text-right font-mono font-semibold">{pct1(b.totalRate)}</td>
              <td className="py-1.5 px-2 text-right font-mono text-blue-400">{pct(b.oaAllocation)}</td>
              <td className="py-1.5 px-2 text-right font-mono text-amber-400">{pct(b.saAllocation)}</td>
              <td className="py-1.5 pl-2 text-right font-mono text-green-400">{pct(b.maAllocation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CpfInterestTable() {
  const rows = [
    { account: "Ordinary Account (OA)", rate: CPF_OA_INTEREST_RATE, color: "text-blue-400" },
    { account: "Special Account (SA)", rate: CPF_SA_INTEREST_RATE, color: "text-amber-400" },
    { account: "MediSave Account (MA)", rate: CPF_MA_INTEREST_RATE, color: "text-green-400" },
    { account: "Retirement Account (RA)", rate: CPF_RA_INTEREST_RATE, color: "text-purple-400" },
  ];
  return (
    <div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 pr-2 font-medium">Account</th>
            <th className="text-right py-2 font-medium">Floor Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.account} className="border-b border-border/50">
              <td className={`py-1.5 pr-2 ${r.color}`}>{r.account}</td>
              <td className="py-1.5 text-right font-mono font-semibold">{pct1(r.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 space-y-1.5 text-[11px] text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Extra interest:</span>{" "}
          +{pct1(CPF_EXTRA_INTEREST_FIRST_60K)} on first $60,000 combined balances
        </p>
        <p>
          +{pct1(CPF_EXTRA_INTEREST_NEXT_30K)} on next $30,000 (SA/MA/RA only, not OA)
        </p>
      </div>
    </div>
  );
}

function CpfRetirementSumsTable() {
  const currentYear = new Date().getFullYear();
  const projectionYears = [currentYear, currentYear + 10, currentYear + 25, currentYear + 50, currentYear + 100];

  return (
    <div className="space-y-4">
      {/* Current retirement sums (2026) */}
      <div>
        <h4 className="text-xs font-semibold mb-2">2026 Retirement Sum Targets</h4>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 pr-2 font-medium">Tier</th>
              <th className="text-right py-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(Object.entries(CPF_RETIREMENT_SUMS) as [string, number][]).map(([tier, amount]) => (
              <tr key={tier} className="border-b border-border/50">
                <td className="py-1.5 pr-2">
                  <Badge variant="outline" className="text-[10px]">
                    {tier}
                  </Badge>{" "}
                  <span className="text-muted-foreground">
                    {tier === "BRS" ? "Basic" : tier === "FRS" ? "Full" : "Enhanced"}
                  </span>
                </td>
                <td className="py-1.5 text-right font-mono font-semibold">{currency(amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Projection tables for each tier */}
      {(["BRS", "FRS", "ERS"] as const).map((tier) => (
        <div key={tier}>
          <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
            {tier === "BRS" ? "BRS (Basic)" : tier === "FRS" ? "FRS (Full)" : "ERS (Enhanced)"} — Straight-line Projection
          </h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-2 font-medium">Year</th>
                <th className="text-right py-2 font-medium">Projected Sum</th>
                <th className="text-right py-2 pl-2 font-medium">Change from 2026</th>
              </tr>
            </thead>
            <tbody>
              {projectionYears.map((year) => {
                const projected = projectCpfRetirementSum(tier, year);
                const current = CPF_RETIREMENT_SUMS[tier];
                const change = projected - current;
                const pctChange = current > 0 ? (change / current) * 100 : 0;
                return (
                  <tr key={year} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-1.5 pr-2 font-mono">{year}</td>
                    <td className="py-1.5 text-right font-mono font-semibold">{currency(projected)}</td>
                    <td className="py-1.5 pl-2 text-right font-mono text-muted-foreground">
                      {change >= 0 ? "+" : ""}{currency(change)} ({pctChange > 0 ? "+" : ""}{pctChange.toFixed(1)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      <p className="mt-3 text-[11px] text-muted-foreground">
        <strong>Projection Method:</strong> Linear extrapolation based on historical CPF Board increases 2006–2026.
        Rates: BRS ~{currency(Math.round((CPF_RETIREMENT_SUM_HISTORY.BRS[CPF_RETIREMENT_SUM_HISTORY.BRS.length - 1].amount - CPF_RETIREMENT_SUM_HISTORY.BRS[CPF_RETIREMENT_SUM_HISTORY.BRS.length - 2].amount) / (CPF_RETIREMENT_SUM_HISTORY.BRS[CPF_RETIREMENT_SUM_HISTORY.BRS.length - 1].year - CPF_RETIREMENT_SUM_HISTORY.BRS[CPF_RETIREMENT_SUM_HISTORY.BRS.length - 2].year)))}/year,
        FRS ~{currency(Math.round((CPF_RETIREMENT_SUM_HISTORY.FRS[CPF_RETIREMENT_SUM_HISTORY.FRS.length - 1].amount - CPF_RETIREMENT_SUM_HISTORY.FRS[CPF_RETIREMENT_SUM_HISTORY.FRS.length - 2].amount) / (CPF_RETIREMENT_SUM_HISTORY.FRS[CPF_RETIREMENT_SUM_HISTORY.FRS.length - 1].year - CPF_RETIREMENT_SUM_HISTORY.FRS[CPF_RETIREMENT_SUM_HISTORY.FRS.length - 2].year)))}/year.
      </p>
    </div>
  );
}

function CpfLifePlansTable() {
  return (
    <div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 pr-2 font-medium">Plan</th>
            <th className="text-right py-2 px-2 font-medium">Est. Payout / $100k RA</th>
            <th className="text-right py-2 font-medium">Escalation</th>
          </tr>
        </thead>
        <tbody>
          {(Object.entries(CPF_LIFE_PLANS) as [string, typeof CPF_LIFE_PLANS[keyof typeof CPF_LIFE_PLANS]][]).map(([key, plan]) => (
            <tr key={key} className="border-b border-border/50">
              <td className="py-1.5 pr-2">
                <span className="font-medium">{plan.label}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px]">{plan.description}</p>
              </td>
              <td className="py-1.5 px-2 text-right font-mono font-semibold">
                ~${Math.round(plan.payoutPerDollarRA * 100000)}/mo
              </td>
              <td className="py-1.5 text-right font-mono">
                {"annualEscalation" in plan ? pct1(plan.annualEscalation) + " p.a." : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TaxBracketsTable() {
  let prevBound = 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 pr-2 font-medium">Chargeable Income Band</th>
            <th className="text-right py-2 px-2 font-medium">Marginal Rate</th>
            <th className="text-right py-2 font-medium">Tax on Band</th>
          </tr>
        </thead>
        <tbody>
          {IRAS_TAX_BRACKETS.map((b) => {
            const taxOnBand = b.upperBound === Infinity ? "—" : currency((b.upperBound - prevBound) * b.rate);
            const row = (
              <tr key={b.label} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-1.5 pr-2 font-mono">{b.label}</td>
                <td className="py-1.5 px-2 text-right font-mono font-semibold">{pct1(b.rate)}</td>
                <td className="py-1.5 text-right font-mono text-muted-foreground">{taxOnBand}</td>
              </tr>
            );
            prevBound = b.upperBound;
            return row;
          })}
        </tbody>
      </table>
    </div>
  );
}

function TaxReliefsTable() {
  const reliefs = [
    { name: "Total Personal Reliefs Cap", value: currency(TOTAL_PERSONAL_RELIEFS_CAP), note: "Overall cap on all reliefs" },
    { name: "SRS Relief Cap (SC/PR)", value: currency(SRS_RELIEF_CAP), note: "Annual SRS contribution cap" },
    { name: "Life Insurance Relief", value: currency(LIFE_INSURANCE_RELIEF_CAP), note: "Reduced if CPF ≥ $5,000" },
    { name: "Earned Income Relief (<55)", value: currency(EARNED_INCOME_RELIEF_BELOW_55), note: "" },
    { name: "Earned Income Relief (55–59)", value: currency(EARNED_INCOME_RELIEF_55_TO_59), note: "" },
    { name: "Earned Income Relief (≥60)", value: currency(EARNED_INCOME_RELIEF_60_AND_ABOVE), note: "" },
  ];
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th className="text-left py-2 pr-2 font-medium">Relief</th>
          <th className="text-right py-2 px-2 font-medium">Cap / Amount</th>
          <th className="text-left py-2 pl-2 font-medium">Note</th>
        </tr>
      </thead>
      <tbody>
        {reliefs.map((r) => (
          <tr key={r.name} className="border-b border-border/50">
            <td className="py-1.5 pr-2">{r.name}</td>
            <td className="py-1.5 px-2 text-right font-mono font-semibold">{r.value}</td>
            <td className="py-1.5 pl-2 text-muted-foreground">{r.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GrowthRatesTable() {
  const rates = [
    { label: "Core Inflation", value: DEFAULT_INFLATION_RATE, color: "text-orange-400" },
    { label: "Medical Inflation", value: DEFAULT_MEDICAL_INFLATION_RATE, color: "text-red-400" },
    { label: "Education Inflation", value: DEFAULT_EDUCATION_INFLATION_RATE, color: "text-yellow-400" },
    { label: "Property Appreciation", value: DEFAULT_PROPERTY_APPRECIATION, color: "text-cyan-400" },
    { label: "Equity Market Return", value: DEFAULT_EQUITY_RETURN, color: "text-green-400" },
    { label: "Conservative Return (Bonds/FD)", value: DEFAULT_CONSERVATIVE_RETURN, color: "text-blue-400" },
    { label: "Passive Income Yield", value: DEFAULT_PASSIVE_INCOME_YIELD, color: "text-purple-400" },
    { label: "Cash Savings Yield", value: DEFAULT_CASH_YIELD, color: "text-muted-foreground" },
    { label: "FD / T-Bills Yield", value: DEFAULT_FD_TBILL_YIELD, color: "text-blue-300" },
    { label: "Robo-Advisor Return", value: DEFAULT_ROBO_ADVISOR_RETURN, color: "text-emerald-400" },
    { label: "Shield Premium Escalation", value: DEFAULT_SHIELD_PREMIUM_ESCALATION, color: "text-red-300" },
  ];
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th className="text-left py-2 pr-2 font-medium">Assumption</th>
          <th className="text-right py-2 font-medium">Rate (p.a.)</th>
        </tr>
      </thead>
      <tbody>
        {rates.map((r) => (
          <tr key={r.label} className="border-b border-border/50">
            <td className={`py-1.5 pr-2 ${r.color}`}>{r.label}</td>
            <td className="py-1.5 text-right font-mono font-semibold">{pct1(r.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InsuranceBenchmarksTable() {
  return (
    <div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 pr-2 font-medium">Coverage Type</th>
            <th className="text-right py-2 font-medium">Benchmark</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/50">
            <td className="py-1.5 pr-2">{LIA_BENCHMARKS.DEATH.label}</td>
            <td className="py-1.5 text-right font-mono">
              {LIA_BENCHMARKS.DEATH.multiplierOfIncome}× annual income or {LIA_BENCHMARKS.DEATH.minYearsExpenses} years expenses
            </td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-1.5 pr-2">{LIA_BENCHMARKS.TPD.label}</td>
            <td className="py-1.5 text-right font-mono">
              {LIA_BENCHMARKS.TPD.multiplierOfIncome}× annual income or {LIA_BENCHMARKS.TPD.minYearsExpenses} years expenses
            </td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-1.5 pr-2">{LIA_BENCHMARKS.CRITICAL_ILLNESS_EARLY.label}</td>
            <td className="py-1.5 text-right font-mono">{LIA_BENCHMARKS.CRITICAL_ILLNESS_EARLY.multiplierOfIncome}× annual income</td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-1.5 pr-2">{LIA_BENCHMARKS.CRITICAL_ILLNESS_LATE.label}</td>
            <td className="py-1.5 text-right font-mono">{LIA_BENCHMARKS.CRITICAL_ILLNESS_LATE.multiplierOfIncome}× annual income</td>
          </tr>
          <tr className="border-b border-border/50">
            <td className="py-1.5 pr-2">{LIA_BENCHMARKS.DISABILITY_INCOME.label}</td>
            <td className="py-1.5 text-right font-mono">{pct1(LIA_BENCHMARKS.DISABILITY_INCOME.monthlyPercentOfIncome)} of monthly income</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Source: Life Insurance Association of Singapore (LIA) recommended guidelines.
      </p>
    </div>
  );
}

function StressTestTable() {
  const tests = [
    { label: "Retrenchment Duration", value: `${RETRENCHMENT_DURATION_MONTHS} months` },
    { label: "Market Crash Loss", value: pct1(MARKET_CRASH_LOSS_PERCENT) },
    { label: "Late CI Expense Increase", value: `+${pct1(LATE_CI_EXPENSE_INCREASE_PERCENT)}` },
    { label: "Mortality — Male", value: `${MORTALITY_AGE.Male} years` },
    { label: "Mortality — Female", value: `${MORTALITY_AGE.Female} years` },
    { label: "Conservative Mortality (Longevity Risk)", value: `${CONSERVATIVE_MORTALITY_AGE} years` },
  ];
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th className="text-left py-2 pr-2 font-medium">Parameter</th>
          <th className="text-right py-2 font-medium">Value</th>
        </tr>
      </thead>
      <tbody>
        {tests.map((t) => (
          <tr key={t.label} className="border-b border-border/50">
            <td className="py-1.5 pr-2">{t.label}</td>
            <td className="py-1.5 text-right font-mono font-semibold">{t.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AssumptionsPanel() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">
            Assumptions & Rates
          </CardTitle>
          <Badge variant="outline" className="text-[10px] ml-auto">
            Singapore 2026
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          All calculation parameters used in projections. These are sourced from CPF Board,
          IRAS, and LIA guidelines as of 2026.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" className="w-full" defaultValue={["cpf-contributions"]}>
          {/* ── CPF Contribution Rates ─────────────────────────────── */}
          <AccordionItem value="cpf-contributions">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-blue-400" />
                CPF Contribution Rates
                <Badge variant="secondary" className="text-[9px] ml-1">
                  Ceiling: {currency(CPF_MONTHLY_SALARY_CEILING)}/mo
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CpfContributionTable />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Monthly ordinary wage ceiling: {currency(CPF_MONTHLY_SALARY_CEILING)}.
                OA/SA/MA allocation rates are expressed as percentage of ordinary wages.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* ── CPF Interest Rates ─────────────────────────────────── */}
          <AccordionItem value="cpf-interest">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-amber-400" />
                CPF Interest Rates & Extra Interest
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CpfInterestTable />
            </AccordionContent>
          </AccordionItem>

          {/* ── CPF Retirement Sums ────────────────────────────────── */}
          <AccordionItem value="cpf-retirement">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-purple-400" />
                CPF Retirement Sums (BRS / FRS / ERS)
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CpfRetirementSumsTable />
            </AccordionContent>
          </AccordionItem>

          {/* ── CPF LIFE Plans ─────────────────────────────────────── */}
          <AccordionItem value="cpf-life">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-green-400" />
                CPF LIFE Payout Plans
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CpfLifePlansTable />
            </AccordionContent>
          </AccordionItem>

          <Separator className="my-1" />

          {/* ── IRAS Tax Brackets ──────────────────────────────────── */}
          <AccordionItem value="tax-brackets">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-green-400" />
                IRAS Progressive Tax Brackets (YA2026)
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <TaxBracketsTable />
            </AccordionContent>
          </AccordionItem>

          {/* ── Tax Reliefs ────────────────────────────────────────── */}
          <AccordionItem value="tax-reliefs">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-yellow-400" />
                Tax Relief Caps
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <TaxReliefsTable />
            </AccordionContent>
          </AccordionItem>

          <Separator className="my-1" />

          {/* ── Growth & Inflation Rates ───────────────────────────── */}
          <AccordionItem value="growth-rates">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                Growth & Inflation Assumptions
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <GrowthRatesTable />
            </AccordionContent>
          </AccordionItem>

          {/* ── Insurance Benchmarks ───────────────────────────────── */}
          <AccordionItem value="insurance">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Heart className="h-3.5 w-3.5 text-red-400" />
                Insurance Benchmarks (LIA)
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <InsuranceBenchmarksTable />
            </AccordionContent>
          </AccordionItem>

          {/* ── Stress Test Parameters ─────────────────────────────── */}
          <AccordionItem value="stress-tests">
            <AccordionTrigger className="text-xs font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
                Stress Test Parameters
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <StressTestTable />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Disclaimer:</strong> These rates are sourced
            from official publications (CPF Board, IRAS, LIA) as of 2026 and may change.
            Growth rates and inflation assumptions are estimates for planning purposes.
            Past performance is not indicative of future results. Consult a licensed
            financial advisor for personalized advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
