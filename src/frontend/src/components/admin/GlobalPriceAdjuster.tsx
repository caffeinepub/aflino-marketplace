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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Product } from "@/data/products";
import { Percent } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface BulkUpdate {
  id: number;
  discountedPrice: number;
}

interface Props {
  products: Product[];
  updateProductsBulk: (updates: BulkUpdate[]) => void;
}

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
];

export default function GlobalPriceAdjuster({
  products,
  updateProductsBulk,
}: Props) {
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [pct, setPct] = useState<string>("");

  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>();
    for (const p of products) {
      if (p.brandName) brands.add(p.brandName);
    }
    return Array.from(brands).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (brand !== "All" && p.brandName !== brand) return false;
      return true;
    });
  }, [products, category, brand]);

  const pctNum = Number.parseFloat(pct);
  const isValidPct = !Number.isNaN(pctNum) && pctNum !== 0;

  const preview = useMemo(() => {
    if (!isValidPct)
      return filtered.map((p) => ({
        ...p,
        newPrice: p.discountedPrice ?? p.price,
      }));
    return filtered.map((p) => {
      const current = p.discountedPrice ?? p.price;
      const newPrice = Math.round(current * (1 + pctNum / 100));
      return { ...p, current, newPrice };
    });
  }, [filtered, pctNum, isValidPct]);

  function handleApply() {
    if (!isValidPct) return;
    const updates: BulkUpdate[] = preview.map((p) => ({
      id: p.id,
      discountedPrice: p.newPrice,
    }));
    updateProductsBulk(updates);
    toast.success(`✓ ${updates.length} products updated`);
  }

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
      data-ocid="admin.price_adjuster.panel"
    >
      <div className="flex items-center gap-2 mb-1">
        <Percent className="w-5 h-5" style={{ color: "#006AFF" }} />
        <h3 className="text-base font-semibold text-gray-900">
          Global Price Adjuster
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Bulk-update Discounted (Selling) Prices — MRP is never changed
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-ocid="admin.price_adjuster.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Brand</Label>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger data-ocid="admin.price_adjuster.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Brands</SelectItem>
              {uniqueBrands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Percentage Input */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Adjustment %
            <span className="ml-1 text-xs text-gray-400 font-normal">
              Negative = sale, Positive = hike
            </span>
          </Label>
          <Input
            type="number"
            min={-50}
            max={50}
            step={0.5}
            placeholder="e.g. -5 or +2"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            data-ocid="admin.price_adjuster.input"
          />
        </div>
      </div>

      {/* Preview count */}
      <p className="text-sm text-gray-600 mb-3">
        <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
        products will be affected
      </p>

      {/* Preview table */}
      {filtered.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="overflow-y-auto" style={{ maxHeight: "12rem" }}>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500">
                    Product Name
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">
                    Current Selling Price
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500">
                    New Selling Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((p, i) => {
                  const current = p.discountedPrice ?? p.price;
                  const newPrice = isValidPct ? p.newPrice : current;
                  const isDown = newPrice < current;
                  const isUp = newPrice > current;
                  return (
                    <tr
                      key={p.id}
                      data-ocid={`admin.price_adjuster.row.${i + 1}`}
                    >
                      <td className="px-3 py-2 text-gray-700 max-w-[160px] truncate">
                        {p.title}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        ₹{current.toLocaleString("en-IN")}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-medium ${isDown ? "text-green-600" : isUp ? "text-orange-500" : "text-gray-600"}`}
                      >
                        ₹{newPrice.toLocaleString("en-IN")}
                        {isDown && " ↓"}
                        {isUp && " ↑"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                type="button"
                disabled={!isValidPct || filtered.length === 0}
                onClick={handleApply}
                className="text-white"
                style={{
                  backgroundColor:
                    isValidPct && filtered.length > 0 ? "#006AFF" : undefined,
                }}
                data-ocid="admin.price_adjuster.submit_button"
              >
                Apply to {filtered.length} Products
              </Button>
            </span>
          </TooltipTrigger>
          {(!isValidPct || filtered.length === 0) && (
            <TooltipContent>
              <p>
                {filtered.length === 0
                  ? "No products match the filter"
                  : "Enter a non-zero percentage"}
              </p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
