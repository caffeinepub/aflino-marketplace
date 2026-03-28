import { BannerCarousel } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FlashSale } from "@/context/FlashSaleContext";
import { useFlashSale } from "@/context/FlashSaleContext";
import {
  type CategoryFeedConfig,
  type HomepageBanner,
  type HomepageBrand,
  type HomepageCategory,
  type HomepageSection,
  useHomepageManager,
} from "@/context/HomepageManagerContext";
import { useProducts } from "@/context/ProductContext";
import {
  Eye,
  GripVertical,
  LayoutList,
  Plus,
  Sliders,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";

// ── Drag-and-Drop helpers ──────────────────────────────────────────────────
function useDragReorder<T extends { id: string }>(
  items: T[],
  onReorder: (newOrder: T[]) => void,
) {
  const dragIndex = useRef<number | null>(null);

  function onDragStart(index: number) {
    dragIndex.current = index;
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    const updated = [...items];
    const [moved] = updated.splice(dragIndex.current, 1);
    updated.splice(index, 0, moved);
    dragIndex.current = index;
    onReorder(updated);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dragIndex.current = null;
  }

  return { onDragStart, onDragOver, onDrop };
}

// Helper to format datetime-local value from ISO
function toDatetimeLocal(iso?: string): string {
  if (!iso) return "";
  // datetime-local expects YYYY-MM-DDTHH:MM
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

// ── Banner Section ────────────────────────────────────────────────────────────────
function BannersSection() {
  const {
    banners,
    addBanner,
    deleteBanner,
    updateBanner,
    reorderBanners,
    uploadProgress,
  } = useHomepageManager();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null,
  );
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { onDragStart, onDragOver, onDrop } = useDragReorder(
    banners,
    reorderBanners,
  );

  async function handleUpload() {
    if (!file || !title.trim()) return;
    setUploading(true);
    await addBanner(
      file,
      title.trim(),
      link.trim(),
      scheduleStart ? new Date(scheduleStart).toISOString() : undefined,
      scheduleEnd ? new Date(scheduleEnd).toISOString() : undefined,
    );
    setUploading(false);
    setTitle("");
    setLink("");
    setScheduleStart("");
    setScheduleEnd("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEditSchedule(banner: HomepageBanner) {
    setEditingScheduleId(banner.id);
    setEditStart(toDatetimeLocal(banner.scheduleStart));
    setEditEnd(toDatetimeLocal(banner.scheduleEnd));
  }

  function saveEditSchedule(id: string) {
    updateBanner(id, {
      scheduleStart: editStart ? new Date(editStart).toISOString() : undefined,
      scheduleEnd: editEnd ? new Date(editEnd).toISOString() : undefined,
    });
    setEditingScheduleId(null);
  }

  function formatDateRange(start?: string, end?: string): string {
    const fmt = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };
    if (start && end) return `\ud83d\udcc5 ${fmt(start)} – ${fmt(end)}`;
    if (start) return `\ud83d\udcc5 From ${fmt(start)}`;
    if (end) return `\ud83d\udcc5 Until ${fmt(end)}`;
    return "";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          Hero Banners ({banners.length})
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 border-[#006AFF] text-[#006AFF] hover:bg-blue-50"
          onClick={() => setPreviewOpen(true)}
          data-ocid="homepage.open_modal_button"
        >
          <Eye className="w-4 h-4" />
          Live Preview
        </Button>
      </div>

      <div className="space-y-2">
        {banners.map((banner: HomepageBanner, i: number) => (
          <div key={banner.id}>
            <div
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDrop={onDrop}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-200 transition-colors"
              data-ocid={`homepage.item.${i + 1}`}
            >
              <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-[60px] h-[38px] object-cover rounded flex-shrink-0 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {banner.title}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {banner.redirectLink || "No link"}
                </p>
                {(banner.scheduleStart || banner.scheduleEnd) && (
                  <p className="text-[10px] text-blue-500 mt-0.5">
                    {formatDateRange(banner.scheduleStart, banner.scheduleEnd)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => startEditSchedule(banner)}
                className="text-[10px] text-blue-500 hover:text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 hover:border-blue-400 flex-shrink-0 whitespace-nowrap"
                data-ocid={`homepage.edit_button.${i + 1}`}
              >
                \ud83d\udcc5 Schedule
              </button>
              <button
                type="button"
                onClick={() => deleteBanner(banner.id)}
                className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Delete banner"
                data-ocid={`homepage.delete_button.${i + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Inline schedule editor */}
            {editingScheduleId === banner.id && (
              <div className="mt-1 ml-6 p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                <p className="text-xs font-semibold text-blue-700">
                  📅 Edit Schedule
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-gray-500 mb-0.5 block">
                      Show From
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-gray-500 mb-0.5 block">
                      Hide After
                    </Label>
                    <Input
                      type="datetime-local"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="text-xs h-7 text-white"
                    style={{ backgroundColor: "#006AFF" }}
                    onClick={() => saveEditSchedule(banner.id)}
                    data-ocid="homepage.save_button"
                  >
                    Save Schedule
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setEditingScheduleId(null)}
                    data-ocid="homepage.cancel_button"
                  >
                    Cancel
                  </Button>
                  {(banner.scheduleStart || banner.scheduleEnd) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 text-red-500 border-red-200"
                      onClick={() => {
                        updateBanner(banner.id, {
                          scheduleStart: undefined,
                          scheduleEnd: undefined,
                        });
                        setEditingScheduleId(null);
                      }}
                      data-ocid="homepage.delete_button"
                    >
                      Clear Schedule
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {banners.length === 0 && (
          <p
            className="text-sm text-gray-400 text-center py-6"
            data-ocid="homepage.empty_state"
          >
            No banners yet. Add one below.
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4" style={{ color: "#006AFF" }} />
          Add New Banner
        </p>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Banner Image *
          </Label>
          <Input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
            data-ocid="homepage.upload_button"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Smartphones Sale - 30% Off"
            className="text-sm"
            data-ocid="homepage.input"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Redirect Link
          </Label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="e.g. /mobiles"
            className="text-sm"
            data-ocid="homepage.input"
          />
        </div>
        {/* Schedule inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">
              Show From (optional)
            </Label>
            <Input
              type="datetime-local"
              value={scheduleStart}
              onChange={(e) => setScheduleStart(e.target.value)}
              className="text-sm"
              data-ocid="homepage.input"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">
              Hide After (optional)
            </Label>
            <Input
              type="datetime-local"
              value={scheduleEnd}
              onChange={(e) => setScheduleEnd(e.target.value)}
              className="text-sm"
              data-ocid="homepage.input"
            />
          </div>
        </div>
        <p className="text-[10px] text-gray-400">
          Leave schedule blank to always show. A "Sunday Sale" banner with a
          Monday end time will auto-hide when the sale ends.
        </p>
        {uploading && uploadProgress > 0 && (
          <div data-ocid="homepage.loading_state">
            <p className="text-xs text-gray-500 mb-1">
              Uploading… {uploadProgress}%
            </p>
            <Progress value={uploadProgress} className="h-1.5" />
          </div>
        )}
        <Button
          type="button"
          disabled={uploading || !file || !title.trim()}
          onClick={handleUpload}
          className="gap-2 w-full text-white"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="homepage.submit_button"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : "Upload Banner"}
        </Button>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="max-w-[420px] p-0 overflow-hidden"
          data-ocid="homepage.dialog"
        >
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-base">
              Mobile Preview (375px)
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center pb-4 px-4">
            <div
              className="relative rounded-[28px] overflow-hidden border-[6px] border-gray-900 shadow-2xl bg-black"
              style={{ width: 375, maxWidth: "100%" }}
            >
              <div className="bg-black flex items-center justify-between px-4 pt-1.5 pb-0.5">
                <span className="text-white text-[10px] font-semibold">
                  9:41
                </span>
                <div className="w-[80px] h-4 bg-black rounded-full" />
                <span className="text-white text-[10px]">
                  \u25cf\u25cf\u25cf
                </span>
              </div>
              <div className="overflow-hidden" style={{ width: "100%" }}>
                <BannerCarousel />
              </div>
              <div className="bg-white pb-2 flex justify-center pt-1">
                <div className="w-24 h-1 bg-gray-900 rounded-full" />
              </div>
            </div>
          </div>
          <div className="px-4 pb-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(false)}
              data-ocid="homepage.close_button"
            >
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Categories Section ────────────────────────────────────────────────────────────────
function CategoriesSection() {
  const {
    categories,
    addCategory,
    deleteCategory,
    reorderCategories,
    uploadProgress,
  } = useHomepageManager();
  const [label, setLabel] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAdd() {
    if (!file || !label.trim()) return;
    setUploading(true);
    await addCategory(file, label.trim(), link.trim());
    setUploading(false);
    setLabel("");
    setLink("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDragStart(i: number) {
    setDragIndex(i);
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const newOrder = [...categories];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(i, 0, moved);
    reorderCategories(newOrder);
    setDragIndex(i);
  }

  function handleDrop() {
    setDragIndex(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          Category Carousel Pills ({categories.length})
        </h3>
        <span className="text-xs text-gray-400">Drag to reorder</span>
      </div>

      <div className="space-y-2">
        {categories.map((cat: HomepageCategory, i: number) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={handleDrop}
            className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border transition-colors cursor-grab active:cursor-grabbing ${dragIndex === i ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-200"}`}
            data-ocid={`homepage.item.${i + 1}`}
          >
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <img
              src={cat.iconUrl || cat.imageUrl}
              alt={cat.label}
              className="w-10 h-10 rounded-md object-cover flex-shrink-0 border border-gray-200"
              style={{ width: 40, height: 40 }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {cat.label}
              </p>
              {cat.link && (
                <p className="text-xs text-blue-500 truncate">{cat.link}</p>
              )}
            </div>
            <div
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0"
              style={{
                border: "1px solid #0056B3",
                color: "#0056B3",
                fontSize: 11,
              }}
            >
              <img
                src={cat.iconUrl || cat.imageUrl}
                alt=""
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
              {cat.label}
            </div>
            <button
              type="button"
              onClick={() => deleteCategory(cat.id)}
              className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
              aria-label="Delete category"
              data-ocid={`homepage.delete_button.${i + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p
            className="text-sm text-gray-400 text-center py-6"
            data-ocid="homepage.empty_state"
          >
            No categories yet. Add your first category below.
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4" style={{ color: "#006AFF" }} />
          Add New Category
        </p>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Icon Image (150×150 recommended) *
          </Label>
          <Input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
            data-ocid="homepage.upload_button"
          />
          <p className="text-xs text-gray-400 mt-1">
            Shown as icon inside pill button on homepage
          </p>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Category Name *
          </Label>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Kitchen, Fashion, Electronics"
            className="text-sm"
            data-ocid="homepage.input"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Link / URL (optional)
          </Label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="e.g. /category/electronics or #electronics"
            className="text-sm"
          />
        </div>
        {uploading && uploadProgress > 0 && (
          <div data-ocid="homepage.loading_state">
            <p className="text-xs text-gray-500 mb-1">
              Uploading… {uploadProgress}%
            </p>
            <Progress value={uploadProgress} className="h-1.5" />
          </div>
        )}
        <Button
          type="button"
          disabled={uploading || !file || !label.trim()}
          onClick={handleAdd}
          className="w-full text-sm"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="homepage.save_button"
        >
          {uploading ? "Uploading…" : "Add Category"}
        </Button>
      </div>
    </div>
  );
}

// ── Brands Section ────────────────────────────────────────────────────────────────
function BrandsSection() {
  const {
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    reorderBrands,
    uploadBrandLogo,
    uploadProgress,
  } = useHomepageManager();
  const [name, setName] = useState("");
  const [abbr, setAbbr] = useState("");
  const [color, setColor] = useState("#006AFF");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const { onDragStart, onDragOver, onDrop } = useDragReorder(
    brands,
    reorderBrands,
  );

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBrandLogo(file);
      setLogoUrl(url);
    } finally {
      setUploading(false);
    }
  }

  function handleAdd() {
    if (!name.trim() || !abbr.trim()) return;
    addBrand(name.trim(), abbr.trim().slice(0, 5), color, logoUrl || undefined);
    setName("");
    setAbbr("");
    setColor("#006AFF");
    setLogoUrl("");
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-800">
        Curated Brands ({brands.length})
      </h3>
      <div className="space-y-2">
        {brands.map((brand: HomepageBrand, i: number) => (
          <div
            key={brand.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDrop={onDrop}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-200 transition-colors"
            data-ocid={`homepage.item.${i + 1}`}
          >
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-10 h-10 rounded-full object-contain border border-gray-200 bg-white flex-shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${brand.color}15` }}
              >
                <span
                  className="text-[9px] font-extrabold"
                  style={{ color: brand.color }}
                >
                  {brand.abbr}
                </span>
              </div>
            )}
            <p className="flex-1 text-sm font-medium text-gray-800">
              {brand.name}
            </p>
            <button
              type="button"
              onClick={() => updateBrand(brand.id, { enabled: !brand.enabled })}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0"
              style={{
                backgroundColor:
                  brand.enabled !== false ? "#006AFF" : "#e5e7eb",
                color: brand.enabled !== false ? "#fff" : "#6b7280",
              }}
              data-ocid={`homepage.toggle.${i + 1}`}
            >
              {brand.enabled !== false ? "Show" : "Hidden"}
            </button>
            <button
              type="button"
              onClick={() => deleteBrand(brand.id)}
              className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
              aria-label="Delete brand"
              data-ocid={`homepage.delete_button.${i + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {brands.length === 0 && (
          <p
            className="text-sm text-gray-400 text-center py-6"
            data-ocid="homepage.empty_state"
          >
            No brands yet.
          </p>
        )}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4" style={{ color: "#006AFF" }} />
          Add New Brand
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">
              Brand Name *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samsung"
              className="text-sm"
              data-ocid="homepage.input"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">
              Abbreviation (max 5) *
            </Label>
            <Input
              value={abbr}
              onChange={(e) => setAbbr(e.target.value.slice(0, 5))}
              placeholder="e.g. SAM"
              className="text-sm"
              data-ocid="homepage.input"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Brand Color
          </Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
              className="text-sm flex-1"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Logo Image (optional)
          </Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            data-ocid="homepage.upload_button"
          />
          {uploading && (
            <div className="mt-2" data-ocid="homepage.loading_state">
              <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Uploading… {uploadProgress}%
              </p>
            </div>
          )}
          {logoUrl && !uploading && (
            <div className="mt-2 flex items-center gap-2">
              <img
                src={logoUrl}
                alt="Preview"
                className="w-10 h-10 rounded-full object-contain border border-gray-200 bg-white"
              />
              <span className="text-xs text-emerald-600 font-medium">
                Logo uploaded!
              </span>
              <button
                type="button"
                onClick={() => setLogoUrl("")}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          )}
        </div>
        <Button
          type="button"
          disabled={!name.trim() || !abbr.trim() || uploading}
          onClick={handleAdd}
          className="gap-2 w-full text-white"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="homepage.submit_button"
        >
          <Plus className="w-4 h-4" />
          Add Brand
        </Button>
      </div>
    </div>
  );
}

// ── Feed Customizer Section ──────────────────────────────────────────────────────────────
function FeedsSection() {
  const { categoryFeeds, updateFeed, reorderFeeds, addFeed, deleteFeed } =
    useHomepageManager();
  const [newCategory, setNewCategory] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const { onDragStart, onDragOver, onDrop } = useDragReorder(
    categoryFeeds,
    reorderFeeds,
  );

  function handleAddFeed() {
    if (!newCategory.trim() || !newTitle.trim()) return;
    addFeed(newCategory.trim(), newTitle.trim());
    setNewCategory("");
    setNewTitle("");
  }

  const enabledCount = categoryFeeds.filter((f) => f.enabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800">
          Category Feed Customizer
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Toggle feeds on/off and drag to reorder. Feeds with 0 products are
          automatically hidden from the homepage.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: "#006AFF" }}
          >
            {enabledCount} active
          </span>
          <span className="text-xs text-gray-400">
            {categoryFeeds.length - enabledCount} disabled
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {categoryFeeds.map((feed: CategoryFeedConfig, i: number) => (
          <div
            key={feed.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDrop={onDrop}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-grab active:cursor-grabbing ${
              feed.enabled
                ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                : "bg-gray-50 border-gray-200 hover:border-gray-300 opacity-60"
            }`}
            data-ocid={`homepage.item.${i + 1}`}
          >
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="w-5 text-center text-xs font-bold text-gray-400 flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {feed.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                Category:{" "}
                <span className="font-medium text-gray-600">
                  {feed.categoryName}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateFeed(feed.id, { enabled: !feed.enabled })}
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none"
              style={{ backgroundColor: feed.enabled ? "#006AFF" : "#d1d5db" }}
              aria-label={feed.enabled ? "Disable feed" : "Enable feed"}
              data-ocid={`homepage.toggle.${i + 1}`}
            >
              <span
                className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                style={{
                  transform: feed.enabled
                    ? "translateX(18px)"
                    : "translateX(2px)",
                }}
              />
            </button>
            <button
              type="button"
              onClick={() => deleteFeed(feed.id)}
              className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
              aria-label="Delete feed"
              data-ocid={`homepage.delete_button.${i + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {categoryFeeds.length === 0 && (
          <p
            className="text-sm text-gray-400 text-center py-6"
            data-ocid="homepage.empty_state"
          >
            No feeds configured yet.
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4" style={{ color: "#006AFF" }} />
          Add New Feed
        </p>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Category Name *
          </Label>
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Beauty, Sports, Mobiles"
            className="text-sm"
            data-ocid="homepage.input"
          />
          <p className="text-[10px] text-gray-400 mt-0.5">
            Must match the category assigned to products
          </p>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Section Title *
          </Label>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Top in Beauty"
            className="text-sm"
            data-ocid="homepage.input"
          />
        </div>
        <Button
          type="button"
          disabled={!newCategory.trim() || !newTitle.trim()}
          onClick={handleAddFeed}
          className="gap-2 w-full text-white"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="homepage.submit_button"
        >
          <Plus className="w-4 h-4" />
          Add Feed
        </Button>
      </div>
    </div>
  );
}

// ── Section Reordering ──────────────────────────────────────────────────────────────
const SECTION_ICONS: Record<string, string> = {
  banners: "\ud83d\uddbc\ufe0f",
  categories: "\ud83d\udd35",
  brands: "\ud83c\udff7\ufe0f",
  feeds: "\ud83d\udce6",
  recently_viewed: "\ud83d\udd50",
  flash_sale: "\u26a1",
};

function SectionOrderSection() {
  const { homepageSections, reorderSections } = useHomepageManager();

  const { onDragStart, onDragOver, onDrop } = useDragReorder(
    homepageSections,
    reorderSections,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800">Homepage Section Order</h3>
        <p className="text-xs text-gray-400 mt-1">
          Drag the sections to change the order in which they appear on the
          homepage. Changes are saved automatically.
        </p>
      </div>

      <div className="space-y-2">
        {homepageSections.map((section: HomepageSection, i: number) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={(e) => onDragOver(e, i)}
            onDrop={onDrop}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 cursor-grab active:cursor-grabbing hover:border-[#006AFF] hover:shadow-sm transition-all"
            data-ocid={`homepage.item.${i + 1}`}
          >
            <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
              style={{ backgroundColor: "#006AFF" }}
            >
              {i + 1}
            </span>
            <span className="text-lg flex-shrink-0">
              {SECTION_ICONS[section.key] ?? "\ud83d\udcc4"}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {section.label}
              </p>
              <p className="text-[10px] text-gray-400 capitalize">
                section key: {section.key}
              </p>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Position {i + 1}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-[#006AFF] font-semibold mb-1">Tip</p>
        <p className="text-xs text-gray-600">
          For seasonal sales (e.g. Eid Sale, Summer Collection), drag the Flash
          Sale section to the top so customers see it first.
        </p>
      </div>
    </div>
  );
}

// ── Flash Sale Section ──────────────────────────────────────────────────────────────

function FlashSaleAdminSection() {
  const { flashSales, addFlashSale, removeFlashSale } = useFlashSale();
  const { products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  function handleAddSale() {
    const pid = Number.parseInt(selectedProductId);
    const sp = Number.parseFloat(salePrice);
    if (!pid || !sp || sp <= 0) return;
    const product = products.find((p) => p.id === pid);
    if (!product) return;

    addFlashSale({
      productId: pid,
      productTitle: product.title,
      originalPrice: product.price,
      salePrice: sp,
      startTime: startTime ? new Date(startTime).toISOString() : null,
      endTime: endTime ? new Date(endTime).toISOString() : null,
    });

    setSelectedProductId("");
    setSalePrice("");
    setStartTime("");
    setEndTime("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Flash Sale Manager
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Create timed flash sales with live countdowns, or "Hot Deal" badges
          for always-on discounts.
        </p>
      </div>

      {/* Tip */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
        <p className="text-xs text-orange-700 font-semibold mb-1">
          ⚡ Auto-Logic
        </p>
        <p className="text-xs text-gray-600">
          <strong>With End Time</strong> → Shows "🔥 Flash Sale" badge + live
          countdown timer on product cards and homepage section.
          <br />
          <strong>No End Time</strong> → Shows "🔥 Hot Deal" badge only. Leave
          End Time blank to use this mode.
        </p>
      </div>

      {/* Active sales list */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">
          Active Flash Sales ({flashSales.length})
        </h4>
        {flashSales.length === 0 && (
          <p
            className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl"
            data-ocid="flash_sale.empty_state"
          >
            No flash sales yet. Add one below.
          </p>
        )}
        {flashSales.map((sale: FlashSale, i: number) => {
          const isExpired =
            sale.endTime && new Date(sale.endTime).getTime() < Date.now();
          return (
            <div
              key={sale.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                isExpired
                  ? "bg-gray-50 border-gray-200 opacity-60"
                  : "bg-orange-50 border-orange-200"
              }`}
              data-ocid={`flash_sale.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {sale.productTitle}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#006AFF" }}
                  >
                    ₹{sale.salePrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    ₹{sale.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                    -
                    {Math.round(
                      ((sale.originalPrice - sale.salePrice) /
                        sale.originalPrice) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {sale.endTime
                    ? `\ud83d\udd25 Flash Sale • Ends ${new Date(sale.endTime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
                    : "\ud83d\udd25 Hot Deal (no timer)"}
                  {isExpired && (
                    <span className="text-red-500 ml-1">(Expired)</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFlashSale(sale.id)}
                className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Remove flash sale"
                data-ocid={`flash_sale.delete_button.${i + 1}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Flash Sale form */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Plus className="w-4 h-4" style={{ color: "#006AFF" }} />
          Add Flash Sale
        </p>

        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Select Product *
          </Label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            data-ocid="flash_sale.select"
          >
            <option value="">-- Choose a product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.id} • {p.title} • ₹{p.price.toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs text-gray-500 mb-1 block">
            Flash Sale Price (₹) *
          </Label>
          <Input
            type="number"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="e.g. 1299"
            className="text-sm"
            data-ocid="flash_sale.input"
          />
          {selectedProductId && salePrice && (
            <p className="text-[10px] text-emerald-600 mt-0.5">
              {(() => {
                const p = products.find(
                  (pr) => pr.id === Number.parseInt(selectedProductId),
                );
                const sp = Number.parseFloat(salePrice);
                if (p && sp > 0 && sp < p.price) {
                  return `Discount: ${Math.round(((p.price - sp) / p.price) * 100)}% off (saving ₹${(p.price - sp).toLocaleString("en-IN")})`;
                }
                return "";
              })()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">
              Start Time (optional)
            </Label>
            <Input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="text-sm"
              data-ocid="flash_sale.input"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">
              End Time (optional)
            </Label>
            <Input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="text-sm"
              data-ocid="flash_sale.input"
            />
            <p className="text-[10px] text-gray-400 mt-0.5">
              Leave blank → "Hot Deal" badge (no timer)
            </p>
          </div>
        </div>

        <Button
          type="button"
          disabled={
            !selectedProductId ||
            !salePrice ||
            Number.parseFloat(salePrice) <= 0
          }
          onClick={handleAddSale}
          className="gap-2 w-full text-white"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="flash_sale.submit_button"
        >
          <Zap className="w-4 h-4" />
          Create Flash Sale
        </Button>
      </div>
    </div>
  );
}

// ── Main Tab ────────────────────────────────────────────────────────────────
export default function HomepageManagerTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Homepage Manager
        </h2>
        <p className="text-gray-500 text-sm">
          Manage hero banners, categories, brands, feed sections, and flash
          sales. Drag to reorder anything.
        </p>
      </div>

      <Tabs defaultValue="feeds" className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
          <TabsTrigger
            value="feeds"
            className="gap-1.5"
            data-ocid="homepage.tab"
          >
            <Sliders className="w-3.5 h-3.5" />
            Feed Customizer
          </TabsTrigger>
          <TabsTrigger
            value="sections"
            className="gap-1.5"
            data-ocid="homepage.tab"
          >
            <LayoutList className="w-3.5 h-3.5" />
            Section Order
          </TabsTrigger>
          <TabsTrigger
            value="flash_sale"
            className="gap-1.5"
            data-ocid="homepage.tab"
          >
            <Zap className="w-3.5 h-3.5" />
            \u26a1 Flash Sale
          </TabsTrigger>
          <TabsTrigger value="banners" data-ocid="homepage.tab">
            Banners
          </TabsTrigger>
          <TabsTrigger value="categories" data-ocid="homepage.tab">
            Categories
          </TabsTrigger>
          <TabsTrigger value="brands" data-ocid="homepage.tab">
            Brands
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feeds">
          <FeedsSection />
        </TabsContent>
        <TabsContent value="sections">
          <SectionOrderSection />
        </TabsContent>
        <TabsContent value="flash_sale">
          <FlashSaleAdminSection />
        </TabsContent>
        <TabsContent value="banners">
          <BannersSection />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesSection />
        </TabsContent>
        <TabsContent value="brands">
          <BrandsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
