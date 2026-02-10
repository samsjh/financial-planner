"use client";

import { useState, useCallback } from "react";
import { useDashboardStore } from "@/lib/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/lib/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import KpiPanel from "@/components/dashboard/KpiPanel";
import { ChevronRight, ChevronLeft } from "lucide-react";

const INTAKE_SECTIONS = [
  { key: "profile", title: "Profile", description: "Basic information and retirement goals" },
  { key: "income", title: "Income", description: "All income sources" },
  { key: "expenses", title: "Expenses", description: "Monthly and annual expenses" },
  { key: "assets", title: "Assets", description: "Investments, cash, property" },
  { key: "liabilities", title: "Liabilities", description: "Debts and loans" },
  { key: "cpf", title: "CPF", description: "CPF balances and strategy" },
  { key: "investments", title: "Investments", description: "Risk profile and allocation" },
  { key: "tax", title: "Tax Relief", description: "Family situation and reliefs" },
];

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
      <Label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default function IntakePage() {
  const { profile, setProfile, runSimulation, setCurrentPhase } = useDashboardStore();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
    defaultValues: profile,
  });

  const onSubmit = useCallback(
    (data: ProfileFormValues) => {
      setProfile(data);
      runSimulation();
    },
    [setProfile, runSimulation]
  );

  const currentSection = INTAKE_SECTIONS[currentSectionIndex];
  const watchGender = watch("gender");

  const handleNext = () => {
    if (currentSectionIndex < INTAKE_SECTIONS.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      // Move to next phase
      setCurrentPhase("milestones");
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel: Form */}
      <div className="flex-1 overflow-auto border-r border-border">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="max-w-2xl mx-auto">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex gap-1 mb-3">
                {INTAKE_SECTIONS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full ${
                      index <= currentSectionIndex ? "bg-primary" : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Section {currentSectionIndex + 1} of {INTAKE_SECTIONS.length}
              </p>
            </div>

            {/* Section Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold mb-2">{currentSection.title}</h1>
              <p className="text-muted-foreground">{currentSection.description}</p>
            </div>

            {/* Render appropriate section */}
            {currentSection.key === "profile" && (
              <div className="space-y-4">
                <InputField label="Full Name" id="name" type="text" register={register("name")} error={errors.name?.message} />
                <div>
                  <Label htmlFor="gender" className="text-sm text-muted-foreground">
                    Gender
                  </Label>
                  <Select defaultValue={watchGender}>
                    <SelectTrigger className="h-9 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <InputField
                  label="Date of Birth"
                  id="dateOfBirth"
                  type="date"
                  register={register("dateOfBirth")}
                  error={errors.dateOfBirth?.message}
                />
                <InputField
                  label="Current Age"
                  id="currentAge"
                  register={register("currentAge")}
                  error={errors.currentAge?.message}
                />
                <InputField
                  label="Occupation"
                  id="occupation"
                  type="text"
                  register={register("occupation")}
                  error={errors.occupation?.message}
                />
                <InputField
                  label="Desired Retirement Age"
                  id="desiredRetirementAge"
                  register={register("desiredRetirementAge")}
                  error={errors.desiredRetirementAge?.message}
                  suffix="yrs"
                />
                <InputField
                  label="Desired Monthly Spending (Retirement)"
                  id="desiredMonthlySpending"
                  register={register("desiredMonthlySpending")}
                  error={errors.desiredMonthlySpending?.message}
                  prefix="$"
                />
              </div>
            )}

            {currentSection.key === "income" && (
              <div className="space-y-4">
                <InputField
                  label="Monthly Gross Income"
                  id="monthlyGrossIncome"
                  register={register("monthlyGrossIncome")}
                  prefix="$"
                />
                <InputField
                  label="Annual Bonus"
                  id="annualBonus"
                  register={register("annualBonus")}
                  prefix="$"
                />
                <InputField
                  label="Monthly Rental Income"
                  id="rentalIncome"
                  register={register("rentalIncome")}
                  prefix="$"
                />
                <InputField
                  label="Monthly Side Income"
                  id="sideIncome"
                  register={register("sideIncome")}
                  prefix="$"
                />
              </div>
            )}

            {currentSection.key === "expenses" && (
              <div className="space-y-4">
                <InputField
                  label="Monthly Fixed Expenses"
                  id="monthlyFixedExpenses"
                  register={register("monthlyFixedExpenses")}
                  prefix="$"
                />
                <InputField
                  label="Monthly Variable Expenses"
                  id="monthlyVariableExpenses"
                  register={register("monthlyVariableExpenses")}
                  prefix="$"
                />
                <InputField
                  label="Current Lifestyle Expenses"
                  id="currentLifestyleExpenses"
                  register={register("currentLifestyleExpenses")}
                  prefix="$"
                />
              </div>
            )}

            {currentSection.key === "assets" && (
              <div className="text-muted-foreground">
                <p className="mb-4">Asset management is available in the next sections. You can add and manage assets after completing the intake form.</p>
              </div>
            )}

            {currentSection.key === "liabilities" && (
              <div className="text-muted-foreground">
                <p className="mb-4">Liability management is available in the next sections. You can add and manage liabilities after completing the intake form.</p>
              </div>
            )}

            {currentSection.key === "cpf" && (
              <div className="space-y-4">
                <InputField
                  label="CPF OA Balance"
                  id="cpfOaBalance"
                  register={register("cpfOaBalance")}
                  prefix="$"
                />
                <InputField
                  label="CPF SA Balance"
                  id="cpfSaBalance"
                  register={register("cpfSaBalance")}
                  prefix="$"
                />
                <InputField
                  label="CPF MA Balance"
                  id="cpfMaBalance"
                  register={register("cpfMaBalance")}
                  prefix="$"
                />
                <InputField
                  label="Monthly Housing Usage (OA)"
                  id="housingUsageOaMonthly"
                  register={register("housingUsageOaMonthly")}
                  prefix="$"
                />
                <InputField
                  label="Monthly Shield Plan Premium (MA)"
                  id="shieldPlanPremiumMa"
                  register={register("shieldPlanPremiumMa")}
                  prefix="$"
                />
                <InputField
                  label="Annual CPF Top-up"
                  id="annualCpfTopUp"
                  register={register("annualCpfTopUp")}
                  prefix="$"
                />
              </div>
            )}

            {currentSection.key === "investments" && (
              <div className="space-y-4">
                <InputField
                  label="Risk Appetite / Growth Rate"
                  id="riskAppetiteGrowthRate"
                  register={register("riskAppetiteGrowthRate")}
                  suffix="%"
                />
              </div>
            )}

            {currentSection.key === "tax" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Family Situation</h3>
                  <div className="space-y-3">
                    <InputField
                      label="Number of Children"
                      id="numberOfChildren"
                      register={register("numberOfChildren")}
                    />
                    <InputField
                      label="Number of Disabled Children"
                      id="numberOfDisabledChildren"
                      register={register("numberOfDisabledChildren")}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Parents Support</h3>
                  <div className="space-y-3">
                    <InputField
                      label="Parents Same Household"
                      id="numberOfParentsSameHousehold"
                      register={register("numberOfParentsSameHousehold")}
                    />
                    <InputField
                      label="Parents Not Same Household"
                      id="numberOfParentsNotSameHousehold"
                      register={register("numberOfParentsNotSameHousehold")}
                    />
                    <InputField
                      label="Handicapped Parents Same Household"
                      id="numberOfHandicappedParentsSameHousehold"
                      register={register("numberOfHandicappedParentsSameHousehold")}
                    />
                    <InputField
                      label="Handicapped Parents Not Same Household"
                      id="numberOfHandicappedParentsNotSameHousehold"
                      register={register("numberOfHandicappedParentsNotSameHousehold")}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Other Reliefs</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isWorkingMother" {...register("isWorkingMother")} />
                      <Label htmlFor="isWorkingMother">Working Mother</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isActiveNsman" {...register("isActiveNsman")} />
                      <Label htmlFor="isActiveNsman">Active NSman</Label>
                    </div>
                  </div>
                </div>

                <InputField
                  label="Annual SRS Contribution"
                  id="annualSrsContribution"
                  register={register("annualSrsContribution")}
                  prefix="$"
                />
                <InputField
                  label="Life Insurance Premium"
                  id="lifeInsuranceRelief"
                  register={register("lifeInsuranceRelief")}
                  prefix="$"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-12">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentSectionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="button" variant="outline" onClick={handleSubmit(onSubmit)}>
                Save Progress
              </Button>
              <Button onClick={handleNext} className="ml-auto">
                {currentSectionIndex === INTAKE_SECTIONS.length - 1 ? (
                  <>
                    Go to Milestones
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Right Panel: Live KPI Preview */}
      <div className="hidden xl:block w-[350px] flex-shrink-0 bg-card border-l border-border">
        <KpiPanel />
      </div>
    </div>
  );
}
