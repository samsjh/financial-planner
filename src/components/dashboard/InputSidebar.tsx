"use client";

import { useDashboardStore } from "@/lib/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/lib/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Briefcase,
  Wallet,
  Building2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Home,
  Target,
  Calculator,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { LifeEvent } from "@/lib/types";

function InputField({
  label,
  id,
  type = "number",
  prefix,
  suffix,
  register,
  error,
}: {
  label: string;
  id: string;
  type?: string;
  prefix?: string;
  suffix?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type={type}
          step={type === "number" ? "any" : undefined}
          className={`h-9 text-sm ${prefix ? "pl-7" : ""} ${suffix ? "pr-8" : ""} bg-background border-border`}
          {...register}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function InputSidebar() {
  const { profile, setProfile, lifeEvents, addLifeEvent, removeLifeEvent, runSimulation } =
    useDashboardStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
    defaultValues: profile,
  });

  const [newEvent, setNewEvent] = useState<Partial<LifeEvent>>({
    year: new Date().getFullYear() + 5,
    description: "",
    cost: 0,
  });

  const onSubmit = useCallback(
    (data: ProfileFormValues) => {
      setProfile(data);
      runSimulation();
    },
    [setProfile, runSimulation]
  );

  const watchGender = watch("gender");
  const watchStressTest = watch("activeStressTest");

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Planning Inputs
        </h2>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Singapore Wealth Management
        </p>
      </div>

      <ScrollArea className="flex-1">
        <form onSubmit={handleSubmit(onSubmit)} className="p-3">
          <Accordion
            type="multiple"
            defaultValue={["profile", "income", "cpf", "expenses"]}
            className="space-y-1"
          >
            {/* ─── Profile ────────────────────────────────────────── */}
            <AccordionItem value="profile" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Personal Profile
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <InputField
                  label="Full Name"
                  id="name"
                  type="text"
                  register={register("name")}
                  error={errors.name?.message}
                />
                <InputField
                  label="Date of Birth"
                  id="dateOfBirth"
                  type="date"
                  register={register("dateOfBirth")}
                />
                <InputField
                  label="Current Age"
                  id="currentAge"
                  register={register("currentAge")}
                  error={errors.currentAge?.message}
                />
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Gender</Label>
                  <Select
                    value={watchGender}
                    onValueChange={(v) =>
                      setValue("gender", v as "Male" | "Female")
                    }
                  >
                    <SelectTrigger className="h-9 text-sm bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male (Mortality: 84)</SelectItem>
                      <SelectItem value="Female">
                        Female (Mortality: 88)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <InputField
                  label="Occupation"
                  id="occupation"
                  type="text"
                  register={register("occupation")}
                />
              </AccordionContent>
            </AccordionItem>

            {/* ─── Income ─────────────────────────────────────────── */}
            <AccordionItem value="income" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Income
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <InputField
                  label="Monthly Gross Income"
                  id="monthlyGrossIncome"
                  prefix="$"
                  register={register("monthlyGrossIncome")}
                />
                <InputField
                  label="Annual Bonus"
                  id="annualBonus"
                  prefix="$"
                  register={register("annualBonus")}
                />
                <InputField
                  label="Monthly Rental Income"
                  id="rentalIncome"
                  prefix="$"
                  register={register("rentalIncome")}
                />
                <InputField
                  label="Monthly Side Income"
                  id="sideIncome"
                  prefix="$"
                  register={register("sideIncome")}
                />
              </AccordionContent>
            </AccordionItem>

            {/* ─── CPF ────────────────────────────────────────────── */}
            <AccordionItem value="cpf" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  CPF Balances
                  <Badge variant="outline" className="text-[10px] ml-1">
                    2026
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <InputField
                  label="Ordinary Account (OA)"
                  id="cpfOaBalance"
                  prefix="$"
                  register={register("cpfOaBalance")}
                />
                <InputField
                  label="Special Account (SA)"
                  id="cpfSaBalance"
                  prefix="$"
                  register={register("cpfSaBalance")}
                />
                <InputField
                  label="MediSave Account (MA)"
                  id="cpfMaBalance"
                  prefix="$"
                  register={register("cpfMaBalance")}
                />
                <Separator />
                <p className="text-xs font-medium text-muted-foreground">
                  Monthly Deductions
                </p>
                <InputField
                  label="Housing Usage (OA) /mo"
                  id="housingUsageOaMonthly"
                  prefix="$"
                  register={register("housingUsageOaMonthly")}
                />
                <InputField
                  label="Shield Plan Premium (MA) /yr"
                  id="shieldPlanPremiumMa"
                  prefix="$"
                  register={register("shieldPlanPremiumMa")}
                />
              </AccordionContent>
            </AccordionItem>

            {/* ─── Expenses ───────────────────────────────────────── */}
            <AccordionItem value="expenses" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Expenses
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Pre-Retirement (Current Lifestyle)
                </p>
                <InputField
                  label="Fixed Expenses /mo (Mortgage, Loans)"
                  id="monthlyFixedExpenses"
                  prefix="$"
                  register={register("monthlyFixedExpenses")}
                />
                <InputField
                  label="Variable Expenses /mo (Lifestyle)"
                  id="monthlyVariableExpenses"
                  prefix="$"
                  register={register("monthlyVariableExpenses")}
                />
                <Separator />
                <p className="text-xs font-medium text-muted-foreground">
                  Post-Retirement (Desired Spending)
                </p>
                <InputField
                  label="Desired Monthly Spending (Today&apos;s $)"
                  id="desiredMonthlySpending"
                  prefix="$"
                  register={register("desiredMonthlySpending")}
                />
              </AccordionContent>
            </AccordionItem>

            {/* ─── Retirement Goals ───────────────────────────────── */}
            <AccordionItem value="retirement" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Retirement Goals
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <InputField
                  label="Desired Retirement Age"
                  id="desiredRetirementAge"
                  register={register("desiredRetirementAge")}
                />
                <InputField
                  label="Risk Appetite Growth Rate"
                  id="riskAppetiteGrowthRate"
                  register={register("riskAppetiteGrowthRate")}
                  suffix="%"
                />
              </AccordionContent>
            </AccordionItem>

            {/* ─── Tax Reliefs ────────────────────────────────────── */}
            <AccordionItem value="tax" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Tax Reliefs & SRS
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <InputField
                  label="Annual SRS Contribution"
                  id="annualSrsContribution"
                  prefix="$"
                  register={register("annualSrsContribution")}
                />
                <InputField
                  label="SRS Relief Years Remaining"
                  id="srsReliefYearsRemaining"
                  register={register("srsReliefYearsRemaining")}
                  suffix="yrs"
                />
                <InputField
                  label="Life Insurance Premium /yr"
                  id="lifeInsuranceRelief"
                  prefix="$"
                  register={register("lifeInsuranceRelief")}
                />
                <InputField
                  label="Life Ins Relief Years Remaining"
                  id="lifeInsuranceReliefYearsRemaining"
                  register={register("lifeInsuranceReliefYearsRemaining")}
                  suffix="yrs"
                />
              </AccordionContent>
            </AccordionItem>

            {/* ─── Property ───────────────────────────────────────── */}
            <AccordionItem value="property" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  Property
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <InputField
                  label="Property Market Value"
                  id="propertyMarketValue"
                  prefix="$"
                  register={register("propertyMarketValue")}
                />
                <InputField
                  label="Outstanding Mortgage"
                  id="outstandingMortgage"
                  prefix="$"
                  register={register("outstandingMortgage")}
                />
                <InputField
                  label="CPF Principal Used"
                  id="cpfPrincipalUsedForProperty"
                  prefix="$"
                  register={register("cpfPrincipalUsedForProperty")}
                />
                <InputField
                  label="Property Appreciation Rate"
                  id="propertyAppreciationRate"
                  register={register("propertyAppreciationRate")}
                  suffix="%"
                />
                <InputField
                  label="Mortgage Interest Rate"
                  id="mortgageInterestRate"
                  register={register("mortgageInterestRate")}
                  suffix="%"
                />
                <InputField
                  label="Mortgage Years Remaining"
                  id="mortgageYearsRemaining"
                  register={register("mortgageYearsRemaining")}
                  suffix="yrs"
                />
              </AccordionContent>
            </AccordionItem>

            {/* ─── Life Events / Milestones ────────────────────────── */}
            <AccordionItem value="milestones" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Life Events (Milestones)
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                {lifeEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-2 text-xs bg-background p-2 rounded-md border border-border"
                  >
                    <span className="font-mono text-muted-foreground">
                      {ev.year}
                    </span>
                    <span className="flex-1 truncate">{ev.description}</span>
                    <Badge variant="outline" className="text-[10px]">
                      ${ev.cost.toLocaleString()}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => removeLifeEvent(ev.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Year
                      </Label>
                      <Input
                        type="number"
                        className="h-8 text-xs bg-background"
                        value={newEvent.year}
                        onChange={(e) =>
                          setNewEvent((p) => ({
                            ...p,
                            year: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Cost ($)
                      </Label>
                      <Input
                        type="number"
                        className="h-8 text-xs bg-background"
                        value={newEvent.cost}
                        onChange={(e) =>
                          setNewEvent((p) => ({
                            ...p,
                            cost: parseFloat(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <Input
                      type="text"
                      className="h-8 text-xs bg-background"
                      placeholder="e.g. Kids University"
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent((p) => ({
                          ...p,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      if (newEvent.description && newEvent.year && newEvent.cost) {
                        addLifeEvent({
                          id: crypto.randomUUID(),
                          year: newEvent.year!,
                          description: newEvent.description!,
                          cost: newEvent.cost!,
                        });
                        setNewEvent({
                          year: new Date().getFullYear() + 5,
                          description: "",
                          cost: 0,
                        });
                      }
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Event
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ─── Advanced Settings ──────────────────────────────── */}
            <AccordionItem value="advanced" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Advanced Settings
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="inflationToggle"
                    className="text-xs text-muted-foreground"
                  >
                    Inflation Adjusted (Real Returns)
                  </Label>
                  <Switch
                    id="inflationToggle"
                    checked={watch("useInflationAdjusted")}
                    onCheckedChange={(v) =>
                      setValue("useInflationAdjusted", v)
                    }
                  />
                </div>
                <InputField
                  label="Inflation Rate"
                  id="inflationRate"
                  register={register("inflationRate")}
                  suffix="%"
                />
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="conservativeMode"
                    className="text-xs text-muted-foreground"
                  >
                    Conservative Mode (Live to 100)
                  </Label>
                  <Switch
                    id="conservativeMode"
                    checked={watch("conservativeMode")}
                    onCheckedChange={(v) => setValue("conservativeMode", v)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ─── Stress Tests ────────────────────────────────────── */}
            <AccordionItem value="stress" className="border border-border rounded-lg px-3">
              <AccordionTrigger className="text-sm py-3">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Stress Tests
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Active Stress Test
                  </Label>
                  <Select
                    value={watchStressTest}
                    onValueChange={(v) =>
                      setValue(
                        "activeStressTest",
                        v as ProfileFormValues["activeStressTest"]
                      )
                    }
                  >
                    <SelectTrigger className="h-9 text-sm bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="retrenchment">
                        Retrenchment (Income = $0)
                      </SelectItem>
                      <SelectItem value="marketCrash">
                        Market Crash (-30% Liquid)
                      </SelectItem>
                      <SelectItem value="longevityRisk">
                        Longevity Risk (Age 100)
                      </SelectItem>
                      <SelectItem value="earlyCi">
                        Early Critical Illness
                      </SelectItem>
                      <SelectItem value="lateCi">
                        Late Critical Illness
                      </SelectItem>
                      <SelectItem value="deathDisability">
                        Death / Disability
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {watchStressTest !== "none" && (
                  <>
                    <InputField
                      label="Stress Test Start Age"
                      id="stressTestStartAge"
                      register={register("stressTestStartAge")}
                    />
                    {(watchStressTest === "retrenchment" ||
                      watchStressTest === "earlyCi") && (
                      <InputField
                        label="Duration (months)"
                        id="stressTestDuration"
                        register={register("stressTestDuration")}
                      />
                    )}
                    {watchStressTest === "earlyCi" && (
                      <InputField
                        label="Early CI Payout"
                        id="earlyCiPayout"
                        prefix="$"
                        register={register("earlyCiPayout")}
                      />
                    )}
                    {watchStressTest === "lateCi" && (
                      <InputField
                        label="Late CI Payout"
                        id="lateCiPayout"
                        prefix="$"
                        register={register("lateCiPayout")}
                      />
                    )}
                    {watchStressTest === "deathDisability" && (
                      <InputField
                        label="Death Payout"
                        id="deathPayout"
                        prefix="$"
                        register={register("deathPayout")}
                      />
                    )}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* ─── Submit ──────────────────────────────────────────── */}
          <div className="pt-4 pb-8">
            <Button
              type="submit"
              className="w-full font-semibold tracking-wide"
              size="lg"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Run Simulation
            </Button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}
