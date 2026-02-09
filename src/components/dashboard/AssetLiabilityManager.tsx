"use client";

import { useDashboardStore } from "@/lib/store";
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
import type { Asset, Liability } from "@/lib/types";

export function AssetManager() {
  const { assets, addAsset, removeAsset } = useDashboardStore();
  const [open, setOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: "",
    category: "liquid",
    currentValue: 0,
    projectedAppreciationRate: 0.05,
  });

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
          {assets.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 text-xs bg-background p-2 rounded border border-border"
            >
              <span className="flex-1 truncate">{a.name}</span>
              <span className="font-mono text-muted-foreground">
                ${a.currentValue.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {a.category}
              </span>
              <button
                onClick={() => removeAsset(a.id)}
                className="text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                className="h-8 text-xs bg-background"
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
                onValueChange={(v) =>
                  setNewAsset((p) => ({
                    ...p,
                    category: v as "fixed" | "liquid",
                  }))
                }
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liquid">Liquid</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
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
                    currentValue: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Growth Rate
              </Label>
              <Input
                type="number"
                step="0.01"
                className="h-8 text-xs bg-background"
                value={newAsset.projectedAppreciationRate}
                onChange={(e) =>
                  setNewAsset((p) => ({
                    ...p,
                    projectedAppreciationRate: parseFloat(e.target.value),
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
              if (newAsset.name) {
                addAsset({
                  id: crypto.randomUUID(),
                  name: newAsset.name!,
                  category: newAsset.category as "liquid" | "fixed",
                  currentValue: newAsset.currentValue || 0,
                  projectedAppreciationRate:
                    newAsset.projectedAppreciationRate || 0.05,
                });
                setNewAsset({
                  name: "",
                  category: "liquid",
                  currentValue: 0,
                  projectedAppreciationRate: 0.05,
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
    category: "longTerm",
    currentBalance: 0,
    interestRate: 0.035,
    monthlyPayment: 0,
    yearsRemaining: 10,
  });

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
          {liabilities.map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-2 text-xs bg-background p-2 rounded border border-border"
            >
              <span className="flex-1 truncate">{l.name}</span>
              <span className="font-mono text-red-400">
                ${l.currentBalance.toLocaleString()}
              </span>
              <button
                onClick={() => removeLiability(l.id)}
                className="text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                className="h-8 text-xs bg-background"
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
                onValueChange={(v) =>
                  setNewLiab((p) => ({
                    ...p,
                    category: v as "longTerm" | "shortTerm",
                  }))
                }
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="longTerm">Long Term</SelectItem>
                  <SelectItem value="shortTerm">Short Term</SelectItem>
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
                    currentBalance: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Rate</Label>
              <Input
                type="number"
                step="0.001"
                className="h-8 text-xs bg-background"
                value={newLiab.interestRate}
                onChange={(e) =>
                  setNewLiab((p) => ({
                    ...p,
                    interestRate: parseFloat(e.target.value),
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
                    monthlyPayment: parseFloat(e.target.value),
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
              if (newLiab.name) {
                addLiability({
                  id: crypto.randomUUID(),
                  name: newLiab.name!,
                  category: newLiab.category as "longTerm" | "shortTerm",
                  currentBalance: newLiab.currentBalance || 0,
                  interestRate: newLiab.interestRate || 0.035,
                  monthlyPayment: newLiab.monthlyPayment || 0,
                  yearsRemaining: newLiab.yearsRemaining || 10,
                });
                setNewLiab({
                  name: "",
                  category: "longTerm",
                  currentBalance: 0,
                  interestRate: 0.035,
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
