import { useCamera } from "@/camera/useCamera";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Camera, CameraOff, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface QuickAddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (product: {
    name: string;
    price: string;
    category: string;
    stock: string;
    imageFile: File | null;
  }) => void;
}

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Other",
];

export default function QuickAddProductModal({
  open,
  onClose,
  onSave,
}: QuickAddProductModalProps) {
  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: "environment",
    quality: 0.9,
    format: "image/jpeg",
  });

  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCapture() {
    const file = await capturePhoto();
    if (file) {
      setCapturedFile(file);
      const url = URL.createObjectURL(file);
      setCapturedPreview(url);
      await stopCamera();
    }
  }

  function handleRetake() {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedFile(null);
    setCapturedPreview(null);
    startCamera();
  }

  function handleClose() {
    stopCamera();
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedFile(null);
    setCapturedPreview(null);
    setName("");
    setPrice("");
    setCategory("");
    setStock("");
    onClose();
  }

  async function handleSave() {
    if (!name.trim() || !price.trim()) {
      toast.error("Product name and price are required.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    onSave?.({ name, price, category, stock, imageFile: capturedFile });
    toast.success("Product added!");
    setSaving(false);
    handleClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="max-w-sm mx-auto p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" style={{ color: "#006AFF" }} />
            Quick Add Product
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Camera / Captured Preview */}
          <div
            className="rounded-xl overflow-hidden border border-gray-200 bg-black relative"
            style={{ height: 240 }}
          >
            {capturedPreview ? (
              <>
                <img
                  src={capturedPreview}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-black/60 hover:bg-black/80 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>
              </>
            ) : (
              <>
                <video
                  ref={videoRef}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 text-white text-sm text-center p-4">
                    <CameraOff className="w-8 h-8 text-red-400" />
                    <p>{error.message}</p>
                    {error.type === "permission" && (
                      <p className="text-xs text-gray-400">
                        Please allow camera access in browser settings.
                      </p>
                    )}
                  </div>
                )}
                {!isActive && !error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
                    <Camera className="w-10 h-10 text-gray-500" />
                    <Button
                      type="button"
                      onClick={startCamera}
                      disabled={isLoading || isSupported === false}
                      size="sm"
                      style={{ backgroundColor: "#006AFF" }}
                      className="text-white"
                      data-ocid="quickadd.camera.primary_button"
                    >
                      {isLoading ? "Starting…" : "Start Camera"}
                    </Button>
                    {isSupported === false && (
                      <p className="text-xs text-gray-400">
                        Camera not supported in this browser.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {!capturedPreview && isActive && (
            <Button
              type="button"
              className="w-full text-white"
              style={{ backgroundColor: "#006AFF" }}
              onClick={handleCapture}
              disabled={!isActive || isLoading}
              data-ocid="quickadd.capture.primary_button"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capture Photo
            </Button>
          )}

          {/* Product Fields */}
          <div className="space-y-3">
            <div>
              <Label
                htmlFor="qa-name"
                className="text-xs font-medium text-gray-700"
              >
                Product Name *
              </Label>
              <Input
                id="qa-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cotton Kurti Blue"
                className="mt-1"
                data-ocid="quickadd.name.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="qa-price"
                  className="text-xs font-medium text-gray-700"
                >
                  Price (₹) *
                </Label>
                <Input
                  id="qa-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="499"
                  className="mt-1"
                  data-ocid="quickadd.price.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="qa-stock"
                  className="text-xs font-medium text-gray-700"
                >
                  Stock
                </Label>
                <Input
                  id="qa-stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="mt-1"
                  data-ocid="quickadd.stock.input"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  className="mt-1"
                  data-ocid="quickadd.category.select"
                >
                  <SelectValue placeholder="Select category" />
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
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              data-ocid="quickadd.cancel_button"
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 text-white"
              style={{ backgroundColor: "#006AFF" }}
              onClick={handleSave}
              disabled={saving}
              data-ocid="quickadd.save_button"
            >
              {saving ? "Saving…" : "Save Product"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
