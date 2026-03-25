import { Image, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

const STORAGE_KEY = "aflino_brand_logo";

export default function BrandSettingsTab() {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      localStorage.setItem(STORAGE_KEY, dataUrl);
      setLogoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRemove = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLogoDataUrl(null);
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Brand Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your platform branding used across shipping labels and
          documents.
        </p>
      </div>

      {/* Shipping Label Logo Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Image className="w-4 h-4 text-gray-500" />
            Shipping Label Logo
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload a high-resolution Black &amp; White PNG logo to replace the
            &ldquo;AFLINO&rdquo; text wordmark on shipping labels. Recommended:
            400&times;160px, B&amp;W PNG.
          </p>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Preview */}
          {logoDataUrl ? (
            <div className="flex items-center gap-4">
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                <img
                  src={logoDataUrl}
                  alt="Brand logo preview"
                  className="object-contain"
                  style={{ width: 150, height: 60 }}
                  data-ocid="brand.logo.preview"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800">Custom logo active</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  This logo will appear on all new shipping label PDFs.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center gap-3 border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
              data-ocid="brand.logo.empty_state"
            >
              <Image className="w-8 h-8 text-gray-300 shrink-0" />
              <p className="text-sm text-gray-500">
                No logo uploaded &mdash; using text wordmark{" "}
                <span className="font-bold text-gray-700">
                  &ldquo;AFLINO&rdquo;
                </span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="brand.logo.upload_button"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="brand.logo.primary_button"
            >
              <Upload className="w-4 h-4" />
              {logoDataUrl ? "Replace Logo" : "Upload Logo"}
            </button>

            {logoDataUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "#EC008C" }}
                data-ocid="brand.logo.delete_button"
              >
                <Trash2 className="w-4 h-4" />
                Remove Logo
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400">
            The logo is stored locally in your browser and embedded directly
            into the PDF at print time. For a permanent cross-device solution,
            upload via the file manager and paste the URL here in a future
            update.
          </p>
        </div>
      </div>
    </div>
  );
}
