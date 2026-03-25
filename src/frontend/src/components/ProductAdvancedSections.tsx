import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator,
  ChevronDown,
  Image as ImageIcon,
  Package,
  Plus,
  Trash2,
  Video,
  X,
  ZoomIn,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

const AFLINO_BLUE = "#006AFF";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface AdvancedFormState {
  brandName: string;
  primaryMaterial: string;
  metalFabricType: string;
  finish: string;
  genericName: string;
  manufacturerDetails: string;
  packerImporterDetails: string;
  countryOfOrigin: string;
  hsnCode: string;
  gstRate: string;
  weight: string;
  weightUnit: "kg" | "gm";
  dimensionL: string;
  dimensionB: string;
  dimensionH: string;
  videoUrl: string;
  sizeChartImage: string;
  whatInTheBox: string[];
}

export function initialAdvancedState(): AdvancedFormState {
  return {
    brandName: "",
    primaryMaterial: "",
    metalFabricType: "",
    finish: "",
    genericName: "",
    manufacturerDetails: "",
    packerImporterDetails: "",
    countryOfOrigin: "India",
    hsnCode: "",
    gstRate: "",
    weight: "",
    weightUnit: "kg",
    dimensionL: "",
    dimensionB: "",
    dimensionH: "",
    videoUrl: "",
    sizeChartImage: "",
    whatInTheBox: ["1× Product", "1× User Manual", "1× Warranty Card"],
  };
}

// ─────────────────────────────────────────────
// Collapsible Section
// ─────────────────────────────────────────────
function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white transition-colors"
        style={{ backgroundColor: AFLINO_BLUE }}
      >
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </span>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && <div className="p-4 space-y-4 bg-white">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Live Profit Calculator
// ─────────────────────────────────────────────
export function LiveProfitCalculator({
  sellingPrice,
  weightKg,
  gstRate,
  commissionRate = 10,
}: {
  sellingPrice: number;
  weightKg: number;
  gstRate: number;
  commissionRate?: number;
}) {
  if (sellingPrice <= 0) return null;

  const commission = sellingPrice * (commissionRate / 100);
  const gstOnCommission = commission * 0.18;
  const estimatedShipping = 50 + weightKg * 20;
  const netSettlement =
    sellingPrice - commission - gstOnCommission - estimatedShipping;
  const effectiveGst = gstRate > 0 ? sellingPrice * (gstRate / 100) : 0;

  const row = (label: string, value: string, highlight?: "green" | "red") => (
    <div className="flex items-center justify-between py-1.5 border-b border-blue-100 last:border-0">
      <span className="text-xs text-gray-600">{label}</span>
      <span
        className="text-sm font-semibold"
        style={{
          color:
            highlight === "green"
              ? "#059669"
              : highlight === "red"
                ? "#dc2626"
                : "#1f2937",
        }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div
      className="rounded-xl border p-4 space-y-1"
      style={{ backgroundColor: "#EFF5FF", borderColor: AFLINO_BLUE }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="w-4 h-4" style={{ color: AFLINO_BLUE }} />
        <h4 className="text-sm font-bold" style={{ color: AFLINO_BLUE }}>
          Live Profit Estimate
        </h4>
      </div>
      {row("Selling Price", `₹${sellingPrice.toLocaleString("en-IN")}`)}
      {commissionRate === 0
        ? row("AFLINO Commission (0%)", "₹0", "green")
        : row(
            `AFLINO Commission (${commissionRate}%)`,
            `- ₹${commission.toFixed(2)}`,
            "red",
          )}
      {row(
        "GST on Commission (18%)",
        `- ₹${gstOnCommission.toFixed(2)}`,
        "red",
      )}
      {effectiveGst > 0 &&
        row(
          `Product GST (${gstRate}%)`,
          `- ₹${effectiveGst.toFixed(2)}`,
          "red",
        )}
      <div className="flex items-center justify-between py-1.5 border-b border-blue-100">
        <span className="text-xs text-gray-500">
          Estimated Shipping
          <span className="ml-1 text-gray-400">
            (₹50 base + ₹20/kg, estimated)
          </span>
        </span>
        <span className="text-sm font-semibold text-red-600">
          - ₹{estimatedShipping.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm font-bold text-gray-700">
          Final Net Settlement
        </span>
        <span
          className="text-base font-bold"
          style={{ color: netSettlement > 0 ? "#059669" : "#dc2626" }}
        >
          ₹{netSettlement.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Advanced Sections component
// ─────────────────────────────────────────────
export function ProductAdvancedSections({
  state,
  onChange,
  sellingPrice = 0,
  variantMinPrice,
  commissionRate = 10,
}: {
  state: AdvancedFormState;
  onChange: (patch: Partial<AdvancedFormState>) => void;
  sellingPrice?: number;
  variantMinPrice?: number;
  commissionRate?: number;
}) {
  const [newBoxItem, setNewBoxItem] = useState("");
  const sizeChartInputRef = useRef<HTMLInputElement>(null);

  const effectivePrice = variantMinPrice ?? sellingPrice;
  const weightKg =
    state.weightUnit === "kg"
      ? Number.parseFloat(state.weight) || 0
      : (Number.parseFloat(state.weight) || 0) / 1000;
  const gstRate = Number.parseInt(state.gstRate) || 0;

  const handleSizeChartUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        onChange({ sizeChartImage: (ev.target?.result as string) || "" });
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  return (
    <div className="space-y-3">
      {/* Section B: Product Attributes */}
      <CollapsibleSection title="Product Attributes" icon={Package}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Brand Name</Label>
            <Input
              value={state.brandName}
              onChange={(e) => onChange({ brandName: e.target.value })}
              placeholder="e.g. Samsung"
              className="h-8 text-sm"
              data-ocid="product.brand_name.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Generic Name</Label>
            <Input
              value={state.genericName}
              onChange={(e) => onChange({ genericName: e.target.value })}
              placeholder="e.g. Smartphone"
              className="h-8 text-sm"
              data-ocid="product.generic_name.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Primary Material</Label>
            <Input
              value={state.primaryMaterial}
              onChange={(e) => onChange({ primaryMaterial: e.target.value })}
              placeholder="e.g. Aluminium, Cotton"
              className="h-8 text-sm"
              data-ocid="product.primary_material.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Metal / Fabric Type</Label>
            <Input
              value={state.metalFabricType}
              onChange={(e) => onChange({ metalFabricType: e.target.value })}
              placeholder="e.g. Stainless Steel, Polyester"
              className="h-8 text-sm"
              data-ocid="product.metal_fabric_type.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Finish</Label>
            <Select
              value={state.finish}
              onValueChange={(v) => onChange({ finish: v })}
            >
              <SelectTrigger
                className="h-8 text-sm"
                data-ocid="product.finish.select"
              >
                <SelectValue placeholder="Select finish" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Matte">Matte</SelectItem>
                <SelectItem value="Glossy">Glossy</SelectItem>
                <SelectItem value="Satin">Satin</SelectItem>
                <SelectItem value="Metallic">Metallic</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Country of Origin</Label>
            <Input
              value={state.countryOfOrigin}
              onChange={(e) => onChange({ countryOfOrigin: e.target.value })}
              placeholder="India"
              className="h-8 text-sm"
              data-ocid="product.country_of_origin.input"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-600">
            Manufacturer Name &amp; Address
          </Label>
          <Textarea
            value={state.manufacturerDetails}
            onChange={(e) => onChange({ manufacturerDetails: e.target.value })}
            placeholder="Full manufacturer name and address..."
            rows={2}
            className="text-sm resize-none"
            data-ocid="product.manufacturer_details.textarea"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-600">
            Packer / Importer Details
          </Label>
          <Textarea
            value={state.packerImporterDetails}
            onChange={(e) =>
              onChange({ packerImporterDetails: e.target.value })
            }
            placeholder="Packer or importer name and address..."
            rows={2}
            className="text-sm resize-none"
            data-ocid="product.packer_importer_details.textarea"
          />
        </div>
      </CollapsibleSection>

      {/* Section C: Shipping & Taxation */}
      <CollapsibleSection title="Shipping &amp; Taxation" icon={Package}>
        <div className="space-y-3">
          {/* Weight */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Weight</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={state.weight}
                onChange={(e) => onChange({ weight: e.target.value })}
                placeholder="0.00"
                className="h-8 text-sm flex-1"
                data-ocid="product.weight.input"
              />
              <div className="flex rounded-md border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => onChange({ weightUnit: "kg" })}
                  className="px-3 py-1 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor:
                      state.weightUnit === "kg" ? AFLINO_BLUE : "#f9fafb",
                    color: state.weightUnit === "kg" ? "#fff" : "#374151",
                  }}
                  data-ocid="product.weight_kg.toggle"
                >
                  kg
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ weightUnit: "gm" })}
                  className="px-3 py-1 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor:
                      state.weightUnit === "gm" ? AFLINO_BLUE : "#f9fafb",
                    color: state.weightUnit === "gm" ? "#fff" : "#374151",
                  }}
                  data-ocid="product.weight_gm.toggle"
                >
                  gm
                </button>
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">
              Dimensions (cm) — L × B × H
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                min={0}
                value={state.dimensionL}
                onChange={(e) => onChange({ dimensionL: e.target.value })}
                placeholder="L"
                className="h-8 text-sm"
                data-ocid="product.dimension_l.input"
              />
              <span className="text-gray-400 text-sm">×</span>
              <Input
                type="number"
                min={0}
                value={state.dimensionB}
                onChange={(e) => onChange({ dimensionB: e.target.value })}
                placeholder="B"
                className="h-8 text-sm"
                data-ocid="product.dimension_b.input"
              />
              <span className="text-gray-400 text-sm">×</span>
              <Input
                type="number"
                min={0}
                value={state.dimensionH}
                onChange={(e) => onChange({ dimensionH: e.target.value })}
                placeholder="H"
                className="h-8 text-sm"
                data-ocid="product.dimension_h.input"
              />
            </div>
          </div>

          {/* HSN + GST */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">HSN Code</Label>
              <Input
                value={state.hsnCode}
                onChange={(e) => onChange({ hsnCode: e.target.value })}
                placeholder="e.g. 8517"
                className="h-8 text-sm"
                data-ocid="product.hsn_code.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">GST Rate</Label>
              <Select
                value={state.gstRate}
                onValueChange={(v) => onChange({ gstRate: v })}
              >
                <SelectTrigger
                  className="h-8 text-sm"
                  data-ocid="product.gst_rate.select"
                >
                  <SelectValue placeholder="Select GST %" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                  <SelectItem value="28">28%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Live Profit Calculator — always visible when price > 0 */}
      {effectivePrice > 0 && (
        <LiveProfitCalculator
          sellingPrice={effectivePrice}
          weightKg={weightKg}
          gstRate={gstRate}
          commissionRate={commissionRate}
        />
      )}

      {/* Section D: Product Media */}
      <CollapsibleSection title="Product Video" icon={Video}>
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">Product Video Link</Label>
          <Input
            value={state.videoUrl}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
            placeholder="Paste YouTube, Instagram Reels, or Facebook video link"
            className="text-sm"
            data-ocid="product.video_url.input"
          />
          <p className="text-xs text-gray-400">
            YouTube videos will be embedded directly. Instagram/Facebook will
            show a preview card.
          </p>
        </div>
      </CollapsibleSection>

      {/* Section E: Size Guide & Box Contents */}
      <CollapsibleSection
        title="Size Guide &amp; Box Contents"
        icon={ImageIcon}
      >
        {/* Size Chart Upload */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">Size Chart Image</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => sizeChartInputRef.current?.click()}
              className="gap-1.5 text-xs"
              style={{ borderColor: AFLINO_BLUE, color: AFLINO_BLUE }}
              data-ocid="product.size_chart.upload_button"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Upload Size Chart
            </Button>
            <input
              ref={sizeChartInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSizeChartUpload}
            />
            {state.sizeChartImage && (
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-blue-600 underline"
                    data-ocid="product.size_chart.open_modal_button"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    View Full Size
                  </button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-2xl"
                  data-ocid="product.size_chart.dialog"
                >
                  <DialogHeader>
                    <DialogTitle>Size Chart</DialogTitle>
                  </DialogHeader>
                  <img
                    src={state.sizeChartImage}
                    alt="Size chart"
                    className="w-full rounded-lg object-contain"
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          {state.sizeChartImage && (
            <img
              src={state.sizeChartImage}
              alt="Size chart preview"
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
          )}
        </div>

        {/* What's in the Box */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">
            What&apos;s in the Box
          </Label>
          <div className="space-y-2">
            {state.whatInTheBox.map((item, idx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: list order is user-managed
              <div key={`${item}-${idx}`} className="flex items-center gap-2">
                <span className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded px-3 py-1.5">
                  {item}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      whatInTheBox: state.whatInTheBox.filter(
                        (_, i) => i !== idx,
                      ),
                    })
                  }
                  className="w-7 h-7 flex items-center justify-center rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  data-ocid={`product.box_item.delete_button.${idx + 1}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newBoxItem}
              onChange={(e) => setNewBoxItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newBoxItem.trim()) {
                  e.preventDefault();
                  onChange({
                    whatInTheBox: [...state.whatInTheBox, newBoxItem.trim()],
                  });
                  setNewBoxItem("");
                }
              }}
              placeholder="e.g. 1× USB-C Cable"
              className="h-8 text-sm flex-1"
              data-ocid="product.box_item.input"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (newBoxItem.trim()) {
                  onChange({
                    whatInTheBox: [...state.whatInTheBox, newBoxItem.trim()],
                  });
                  setNewBoxItem("");
                }
              }}
              className="text-white gap-1 text-xs"
              style={{ backgroundColor: AFLINO_BLUE }}
              data-ocid="product.box_item.primary_button"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ─────────────────────────────────────────────
// Swatch Image Upload Button (for variant rows)
// ─────────────────────────────────────────────
export function SwatchImageUpload({
  swatchImage,
  onUpload,
}: {
  swatchImage?: string;
  onUpload: (base64: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpload((ev.target?.result as string) || "");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center justify-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Upload swatch image"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: swatchImage
            ? `2px solid ${AFLINO_BLUE}`
            : "1.5px dashed #9ca3af",
          overflow: "hidden",
          cursor: "pointer",
          background: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        data-ocid="product.swatch.upload_button"
      >
        {swatchImage ? (
          <img
            src={swatchImage}
            alt="Swatch"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
    </div>
  );
}
