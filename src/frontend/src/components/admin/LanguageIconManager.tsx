import { useLanguageIcons } from "@/context/LanguageIconContext";
import { ALL_LANGUAGES } from "@/i18n";
import { Check, RotateCcw, Upload, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Keep backward-compat export */
export const LANGUAGES = ALL_LANGUAGES;

const ASSET_LABELS: {
  key: string;
  label: string;
  size: string;
  desc: string;
}[] = [
  {
    key: "logo",
    label: "Brand Logo",
    size: "200x60",
    desc: "Horizontal logo for header",
  },
  {
    key: "banner",
    label: "Homepage Banner",
    size: "1920x600",
    desc: "Full-width hero banner",
  },
  {
    key: "icon",
    label: "Language Icon",
    size: "150x150",
    desc: "Square/round icon for language modal",
  },
];

interface CropState {
  x: number;
  y: number;
  scale: number;
}

function ImageCropper({
  src,
  outputSize,
  shape,
  onSave,
  onCancel,
}: {
  src: string;
  outputSize: number;
  shape: "square" | "round";
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const DISPLAY = 220;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const scaleToFit = Math.max(DISPLAY / img.width, DISPLAY / img.height);
      setCrop({ x: 0, y: 0, scale: scaleToFit });
    };
    img.src = src;
  }, [src]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, DISPLAY, DISPLAY);
    ctx.save();
    if (shape === "round") {
      ctx.beginPath();
      ctx.arc(DISPLAY / 2, DISPLAY / 2, DISPLAY / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    const w = img.width * crop.scale;
    const h = img.height * crop.scale;
    const drawX = (DISPLAY - w) / 2 + crop.x;
    const drawY = (DISPLAY - h) / 2 + crop.y;
    ctx.drawImage(img, drawX, drawY, w, h);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "#006AFF";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    if (shape === "round") {
      ctx.beginPath();
      ctx.arc(DISPLAY / 2, DISPLAY / 2, DISPLAY / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(2, 2, DISPLAY - 4, DISPLAY - 4);
    }
    ctx.restore();
  }, [crop, shape]);

  useEffect(() => {
    draw();
  }, [draw]);

  function onMouseDown(e: React.MouseEvent) {
    setDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging) return;
    setCrop((c) => ({
      ...c,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  }
  function onMouseUp() {
    setDragging(false);
  }

  function handleSave() {
    const out = document.createElement("canvas");
    out.width = outputSize;
    out.height = outputSize;
    const ctx = out.getContext("2d");
    if (!ctx || !imgRef.current) return;
    const ratio = outputSize / DISPLAY;
    ctx.save();
    if (shape === "round") {
      ctx.beginPath();
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    const w = imgRef.current.width * crop.scale * ratio;
    const h = imgRef.current.height * crop.scale * ratio;
    const drawX = (outputSize - w) / 2 + crop.x * ratio;
    const drawY = (outputSize - h) / 2 + crop.y * ratio;
    ctx.drawImage(imgRef.current, drawX, drawY, w, h);
    ctx.restore();
    onSave(out.toDataURL("image/png"));
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={DISPLAY}
          height={DISPLAY}
          className={`border-2 border-[#006AFF] cursor-move bg-gray-100 ${shape === "round" ? "rounded-full" : "rounded-lg"}`}
          style={{ width: DISPLAY, height: DISPLAY }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
        <p className="text-[11px] text-gray-400 text-center mt-1">
          Drag to reposition · Blue border = display area on website
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            setCrop((c) => ({ ...c, scale: Math.max(c.scale / 1.15, 0.2) }))
          }
          className="p-2 rounded-full border hover:bg-gray-50"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => {
            const img = imgRef.current;
            if (!img) return;
            setCrop({
              x: 0,
              y: 0,
              scale: Math.max(DISPLAY / img.width, DISPLAY / img.height),
            });
          }}
          className="p-2 rounded-full border hover:bg-gray-50"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() =>
            setCrop((c) => ({ ...c, scale: Math.min(c.scale * 1.15, 5) }))
          }
          className="p-2 rounded-full border hover:bg-gray-50"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 rounded-full text-white text-sm font-semibold flex items-center gap-2"
          style={{ backgroundColor: "#006AFF" }}
        >
          <Check className="w-4 h-4" /> Save Icon
        </button>
      </div>
    </div>
  );
}

export default function LanguageIconManager() {
  const { icons, setIcon } = useLanguageIcons();
  const [cropping, setCropping] = useState<{
    code: string;
    src: string;
  } | null>(null);
  const [shape, setShape] = useState<"square" | "round">("square");
  const [saved, setSaved] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleFileSelect(
    code: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setCropping({ code, src: ev.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSaveCrop(dataUrl: string) {
    if (!cropping) return;
    setIcon(cropping.code, dataUrl);
    setSaved(cropping.code);
    setCropping(null);
    setTimeout(() => setSaved(null), 2000);
  }

  const filtered = ALL_LANGUAGES.filter(
    (l) =>
      search === "" ||
      l.label.toLowerCase().includes(search.toLowerCase()) ||
      l.sub.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Asset Size Reference */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Asset Size Reference
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {ASSET_LABELS.map((a) => (
            <div
              key={a.key}
              className="bg-white rounded-lg p-3 border border-gray-100 text-center"
            >
              <div className="text-sm font-bold text-gray-900">{a.label}</div>
              <div className="text-xs font-mono text-[#006AFF] mt-0.5">
                {a.size}px
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            Language Icon Manager
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {ALL_LANGUAGES.length} languages · Blue border = exact display area
          </p>
        </div>
        <input
          type="text"
          placeholder="Search languages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-xs border rounded-full outline-none focus:border-[#006AFF] w-36"
        />
        <div className="flex items-center gap-1 border rounded-full p-1 text-xs">
          <button
            type="button"
            onClick={() => setShape("square")}
            className={`px-3 py-1 rounded-full transition-colors ${shape === "square" ? "bg-[#006AFF] text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Square
          </button>
          <button
            type="button"
            onClick={() => setShape("round")}
            className={`px-3 py-1 rounded-full transition-colors ${shape === "round" ? "bg-[#006AFF] text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            Round
          </button>
        </div>
      </div>

      {/* Cropper modal */}
      {cropping && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h4 className="font-bold text-gray-900 mb-4 text-center">
              Crop Icon for{" "}
              <span style={{ color: "#006AFF" }}>
                {ALL_LANGUAGES.find((l) => l.code === cropping.code)?.label}
              </span>
            </h4>
            <ImageCropper
              src={cropping.src}
              outputSize={150}
              shape={shape}
              onSave={handleSaveCrop}
              onCancel={() => setCropping(null)}
            />
          </div>
        </div>
      )}

      {/* Language icon cards — 5-column grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-3">
        {filtered.map((lang) => {
          const customIcon = icons[lang.code];
          const isSaved = saved === lang.code;
          return (
            <div
              key={lang.code}
              className="border rounded-xl p-3 flex flex-col items-center gap-2 bg-gray-50"
            >
              <div
                className={`w-16 h-16 flex items-center justify-center bg-white border-2 border-dashed border-gray-300 ${shape === "round" ? "rounded-full" : "rounded-lg"} overflow-hidden`}
              >
                {customIcon ? (
                  <img
                    src={customIcon}
                    alt={lang.label}
                    className={`w-full h-full object-cover ${shape === "round" ? "rounded-full" : "rounded-lg"}`}
                  />
                ) : (
                  <span className="text-[10px] text-gray-400 text-center leading-tight px-1">
                    Default SVG
                  </span>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-gray-900 truncate max-w-full">
                  {lang.label}
                </div>
                <div className="text-[10px] text-gray-400">{lang.sub}</div>
              </div>
              <div className="flex gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[lang.code]?.click()}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium border border-[#006AFF] text-[#006AFF] hover:bg-blue-50"
                >
                  {isSaved ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  {isSaved ? "Saved!" : "Upload"}
                </button>
                {customIcon && (
                  <button
                    type="button"
                    onClick={() => setIcon(lang.code, null)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <input
                ref={(el) => {
                  fileInputRefs.current[lang.code] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(lang.code, e)}
              />
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400">
        Icons are stored locally. Click Upload to replace. Click ✕ to revert to
        default SVG. Icon size: 150x150px.
      </p>
    </div>
  );
}
