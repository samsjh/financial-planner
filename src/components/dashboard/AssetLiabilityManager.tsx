"use client";

import { useDashboardStore } from "@/lib/store";
import { ASSET_CATEGORIES, LIABILITY_CATEGORIES } from "@/lib/engine";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Asset, Liability, AssetCategory, LiabilityCategory } from "@/lib/types";

export function AssetManager() {
  const { assets, addAsset, removeAsset } = useDashboardStore();
  const [open, setOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: "",
    category: "cash",
    currentValue: 0,
    projectedAppreciationRate: ASSET_CATEGORIES.cash.defaultRate,
  });

  const handleCategoryChange = (category: string) => {
    const catKey = category as AssetCategory;
    const defaultRate = ASSET_CATEGORIES[catKey]?.defaultRate ?? 0;
    setNewAsset((p) => ({
      ...p,
      category: catKey,
      projectedAppreciationRate: defaultRate,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Plus className="h-3 w-3 mr-1" /> Assets ({assets.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Manage Assets</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {assets.map((a) => {
            const catLabel = ASSET_CATEGORIES[a.category]?.label ?? a.category;
            return (
              <div
                key={a.id}
                className="flex items-center gap-2 text-xs bg-background p-2 rounded border border-border"
              >
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground">{catLabel}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold">${a.currentValue.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">{(a.projectedAppreciationRate * 100).toFixed(1)}%</div>
                </div>
                <button
                  onClick={() => removeAsset(a.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                className="h-8 text-xs bg-background"
                placeholder="e.g., GIC in POSB"
                value={newAsset.name}
                onChange={(e) =>
                  setNewAsset((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={newAsset.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_CATEGORIES).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Value ($)</Label>
              <Input
                type="number"
                className="h-8 text-xs bg-background"
                value={newAsset.currentValue}
                onChange={(e) =>
                  setNewAsset((p) => ({
                    ...p,
                    currentValue: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                Growth Rate
                <span className="text-[9px] text-muted-foreground">(suggested)</span>
              </Label>
              <Input
                type="number"
                step="0.001"
                className="h-8 text-xs bg-background"
                value={newAsset.projectedAppreciationRate}
                onChange={(e) =>
                  setNewAsset((p) => ({
                    ...p,
                    projectedAppreciationRate: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              if (newAsset.name && newAsset.category) {
                addAsset({
                  id: crypto.randomUUID(),
                  name: newAsset.name!,
                  category: newAsset.category as AssetCategory,
                  currentValue: newAsset.currentValue || 0,
                  projectedAppreciationRate:
                    newAsset.projectedAppreciationRate ?? 0.05,
                });
                setNewAsset({
                  name: "",
                  category: "cash",
                  currentValue: 0,
                  projectedAppreciationRate: ASSET_CATEGORIES.cash.defaultRate,
                });
              }
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Asset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function LiabilityManager() {
  const { liabilities, addLiability, removeLiability } = useDashboardStore();
  const [open, setOpen] = useState(false);
  const [newLiab, setNewLiab] = useState<Partial<Liability>>({
    name: "",
    category: "mortgage",
    currentBalance: 0,
    interestRate: LIABILITY_CATEGORIES.mortgage.defaultRate,
    monthlyPayment: 0,
    yearsRemaining: 10,
  });

  const handleCategoryChange = (category: string) => {
    const catKey = category as LiabilityCategory;
    const defaultRate = LIABILITY_CATEGORIES[catKey]?.defaultRate ?? 0.05;
    setNewLiab((p) => ({
      ...p,
      category: catKey,
      interestRate: defaultRate,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Plus className="h-3 w-3 mr-1" /> Liabilities ({liabilities.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Manage Liabilities</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {liabilities.map((l) => {
            const catLabel = LIABILITY_CATEGORIES[l.category]?.label ?? l.category;
            return (
              <div
                key={l.id}
                className="flex items-center gap-2 text-xs bg-background p-2 rounded border border-border"
              >
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{l.name}</div>
                  <div className="text-[10px] text-muted-foreground">{catLabel}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-red-400">${l.currentBalance.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">{(l.interestRate * 100).toFixed(2)}%</div>
                </div>
                <button
                  onClick={() => removeLiability(l.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                className="h-8 text-xs bg-background"
                placeholder="e.g., HDB Mortgage"
                value={newLiab.name}
                onChange={(e) =>
                  setNewLiab((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={newLiab.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LIABILITY_CATEGORIES).map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Balance ($)
              </Label>
              <Input
                type="number"
                className="h-8 text-xs bg-background"
                value={newLiab.currentBalance}
                onChange={(e) =>
                  setNewLiab((p) => ({
                    ...p,
                    currentBalance: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                Rate
                <span className="text-[9px] text-muted-foreground">(suggested)</span>
              </Label>
              <Input
                type="number"
                step="0.001"
                className="h-8 text-xs bg-background"
                value={newLiab.interestRate}
                onChange={(e) =>
                  setNewLiab((p) => ({
                    ...p,
                    interestRate: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Monthly Pay
              </Label>
              <Input
                type="number"
                className="h-8 text-xs bg-background"
                value={newLiab.monthlyPayment}
                onChange={(e) =>
                  setNewLiab((p) => ({
                    ...p,
                    monthlyPayment: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Years Remaining</Label>
            <Input
              type="number"
              className="h-8 text-xs bg-background"
              value={newLiab.yearsRemaining}
              onChange={(e) =>
                setNewLiab((p) => ({
                  ...p,
                  yearsRemaining: parseFloat(e.target.value) || 10,
                }))
              }
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              if (newLiab.name && newLiab.category) {
                addLiability({
                  id: crypto.randomUUID(),
                  name: newLiab.name!,
                  category: newLiab.category as LiabilityCategory,
                  currentBalance: newLiab.currentBalance || 0,
                  interestRate: newLiab.interestRate ?? LIABILITY_CATEGORIES.other.defaultRate,
                  monthlyPayment: newLiab.monthlyPayment || 0,
                  yearsRemaining: newLiab.yearsRemaining || 10,
                });
                setNewLiab({
                  name: "",
                  category: "mortgage",
                  currentBalance: 0,
                  interestRate: LIABILITY_CATEGORIES.mortgage.defaultRate,
                  monthlyPayment: 0,
                  yearsRemaining: 10,
                });
              }
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Liability
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
