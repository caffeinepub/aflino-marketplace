import { Button } from "@/components/ui/button";
import { useProducts } from "@/context/ProductContext";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Info,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

// 20-column header (cols 1-8 are unchanged legacy cols)
const CSV_HEADER =
  "product_id,product_name,sku,category,price,discounted_price,stock,stock_threshold," +
  "sku_id,brand,is_variable,parent_sku,size,color," +
  "image_url_1,image_url_2,image_url_3,video_url,folder_360_url,high_res_360_folder_url";

interface ValidationError {
  row: number;
  col: string;
  productName: string;
  error: string;
}

interface ParsedRow {
  // Legacy cols 1-8
  id: number;
  productName: string;
  sku: string;
  category: string;
  price: number;
  discountedPrice: number;
  stock: number;
  stockThreshold: number;
  // Extended cols 9-20
  skuId?: string;
  brand?: string;
  isVariable?: boolean;
  parentSku?: string;
  size?: string;
  color?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  videoUrl?: string;
  folder360Url?: string;
  highRes360FolderUrl?: string;
}

interface Props {
  sellerEmail?: string;
}

/** Parse a single CSV line respecting quoted fields */
function parseRow(line: string): string[] {
  const result: string[] = [];
  let inQuote = false;
  let current = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === "," && !inQuote) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/** Detect whether this is a legacy 8-col CSV or the new 20-col CSV */
function detectMode(headerLine: string): "legacy" | "extended" {
  const cols = parseRow(headerLine);
  return cols.length >= 9 ? "extended" : "legacy";
}

/** Validate 360 folder URL — basic heuristic */
function is360UrlLikelyValid(url: string): boolean {
  if (!url) return false;
  // Accept http/https URLs or relative paths — reject obviously wrong values
  return /^(https?:\/\/|\/|\.\/)/i.test(url.trim());
}

export default function BulkCSVManager({ sellerEmail = "" }: Props) {
  const { products, updateProductsBulk } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [page, setPage] = useState(1);

  const myProducts = products.filter(
    (p) =>
      p.seller === sellerEmail ||
      p.seller === "TechZone Store" ||
      p.seller === "Seller Store",
  );

  const totalPages = Math.ceil(myProducts.length / PAGE_SIZE);
  const paginated = myProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // --- Export CSV (20-col) ---
  const handleExport = () => {
    const rows = myProducts.map((p) => {
      const name = `"${p.title.replace(/"/g, '""')}"`;
      const legacySku = p.variants?.[0]?.sku ?? p.skuId ?? "";
      const imageUrl1 = p.images?.[0] ?? "";
      const imageUrl2 = p.images?.[1] ?? "";
      const imageUrl3 = p.images?.[2] ?? "";
      return [
        p.id,
        name,
        legacySku,
        p.category,
        p.price,
        p.discountedPrice ?? p.price,
        p.stock,
        p.stockThreshold ?? 5,
        p.skuId ?? "",
        p.brand ?? p.brandName ?? "",
        p.isVariable ? "TRUE" : "FALSE",
        p.parentSku ?? "",
        "",
        "",
        imageUrl1,
        imageUrl2,
        imageUrl3,
        p.videoUrl ?? "",
        p.folder360Url ?? "",
        p.highRes360FolderUrl ?? "",
      ].join(",");
    });
    const csv = [CSV_HEADER, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aflino_products.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully!");
  };

  // --- Import CSV ---
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    setSuccessMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split("\n");
      if (lines.length < 2) {
        toast.error("CSV file appears to be empty.");
        return;
      }

      const mode = detectMode(lines[0]);
      const validationErrors: ValidationError[] = [];
      const parsed: ParsedRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = parseRow(line);

        // Legacy mode: at least 8 cols
        if (parts.length < 8) continue;

        const [
          idStr,
          productName,
          sku,
          category,
          priceStr,
          discountedPriceStr,
          stockStr,
          thresholdStr,
        ] = parts;

        const id = Number.parseInt(idStr);
        const price = Number.parseFloat(priceStr);
        const discountedPrice = Number.parseFloat(discountedPriceStr);
        const stock = Number.parseInt(stockStr);
        const stockThreshold = Number.parseInt(thresholdStr);

        const rowErrors: string[] = [];
        if (Number.isNaN(id)) rowErrors.push("product_id: invalid number");
        if (Number.isNaN(price) || price < 0)
          rowErrors.push("price: must be a positive number");
        if (Number.isNaN(discountedPrice) || discountedPrice < 0)
          rowErrors.push("discounted_price: must be a positive number");
        if (Number.isNaN(stock) || stock < 0)
          rowErrors.push("stock: must be a positive number");
        if (Number.isNaN(stockThreshold) || stockThreshold < 1)
          rowErrors.push("stock_threshold: must be ≥ 1");

        // Extended column validation (only if 20-col mode)
        let skuId: string | undefined;
        let brand: string | undefined;
        let isVariable: boolean | undefined;
        let parentSku: string | undefined;
        let size: string | undefined;
        let color: string | undefined;
        let imageUrl1: string | undefined;
        let imageUrl2: string | undefined;
        let imageUrl3: string | undefined;
        let videoUrl: string | undefined;
        let folder360Url: string | undefined;
        let highRes360FolderUrl: string | undefined;

        if (mode === "extended" && parts.length >= 20) {
          skuId = parts[8] || undefined;
          brand = parts[9] || undefined;
          isVariable =
            parts[10]?.toUpperCase() === "TRUE"
              ? true
              : parts[10]?.toUpperCase() === "FALSE"
                ? false
                : undefined;
          parentSku = parts[11] || undefined;
          size = parts[12] || undefined;
          color = parts[13] || undefined;
          imageUrl1 = parts[14] || undefined;
          imageUrl2 = parts[15] || undefined;
          imageUrl3 = parts[16] || undefined;
          videoUrl = parts[17] || undefined;
          folder360Url = parts[18] || undefined;
          highRes360FolderUrl = parts[19] || undefined;

          // Validate 360 folder URL
          if (folder360Url) {
            if (!is360UrlLikelyValid(folder360Url)) {
              rowErrors.push(
                "folder_360_url: URL format looks invalid (must start with http://, https://, / or ./)",
              );
            }
          }
        }

        if (rowErrors.length > 0) {
          validationErrors.push({
            row: i + 1,
            col: rowErrors.map((e) => e.split(":")[0]).join(", "),
            productName: productName || `Row ${i + 1}`,
            error: rowErrors.join(" | "),
          });
        } else {
          parsed.push({
            id,
            productName,
            sku,
            category,
            price,
            discountedPrice,
            stock,
            stockThreshold,
            skuId,
            brand,
            isVariable,
            parentSku,
            size,
            color,
            imageUrl1,
            imageUrl2,
            imageUrl3,
            videoUrl,
            folder360Url,
            highRes360FolderUrl,
          });
        }
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        toast.error(
          `${validationErrors.length} row(s) have errors. Please fix and re-upload.`,
        );
        return;
      }

      // Build bulk updates — match by skuId first, then by id
      const updates = parsed.map((row) => {
        // Try to find an existing product by skuId (extended) then by id (legacy)
        const bySkuId = row.skuId
          ? products.find((p) => p.skuId === row.skuId)
          : undefined;
        const resolvedId = bySkuId ? bySkuId.id : row.id;

        return {
          id: resolvedId,
          price: row.price,
          discountedPrice: row.discountedPrice,
          stock: row.stock,
          stockThreshold: row.stockThreshold,
          // Extended fields (undefined if legacy CSV)
          ...(row.skuId !== undefined ? { skuId: row.skuId } : {}),
          ...(row.brand !== undefined ? { brand: row.brand } : {}),
          ...(row.isVariable !== undefined
            ? { isVariable: row.isVariable }
            : {}),
          ...(row.parentSku !== undefined ? { parentSku: row.parentSku } : {}),
          ...(row.videoUrl !== undefined ? { videoUrl: row.videoUrl } : {}),
          ...(row.folder360Url !== undefined
            ? { folder360Url: row.folder360Url }
            : {}),
          ...(row.highRes360FolderUrl !== undefined
            ? { highRes360FolderUrl: row.highRes360FolderUrl }
            : {}),
        };
      });

      updateProductsBulk(updates);
      setSuccessMsg(`${updates.length} products updated successfully!`);
      toast.success(`${updates.length} products updated successfully!`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          My Products &amp; Bulk Manager
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage inventory, prices, variants, and 360° media in bulk via CSV.
        </p>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">
            How to use Bulk CSV (20 columns):
          </p>
          <p>
            Download your product list and open in Excel or Google Sheets. Edit{" "}
            <strong>price</strong>, <strong>discounted_price</strong>,{" "}
            <strong>stock</strong>, and <strong>stock_threshold</strong> as
            before.{" "}
            <span className="text-blue-600">
              New columns 9–20 let you set SKU_ID, Brand, Variants, Media URLs,
              and 360° folder URLs.
            </span>{" "}
            Old 8-column CSVs still import without changes.
          </p>
          <p className="mt-1 font-medium text-blue-700">
            360° tip: if you fill <em>folder_360_url</em>, ensure the folder
            contains ≥ 24 frames. We assume 36 if not specified.
          </p>
        </div>
      </div>

      {/* Export / Import */}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          onClick={handleExport}
          className="gap-2 text-white"
          style={{ background: "#006AFF" }}
          data-ocid="seller.csv.upload_button"
        >
          <Download className="w-4 h-4" />
          Download Product List (CSV)
        </Button>
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 border-pink-300 text-pink-700 hover:bg-pink-50"
            data-ocid="seller.csv.dropzone"
          >
            <Upload className="w-4 h-4" />
            Upload Updated CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImport}
          />
          <p className="text-xs text-gray-400 mt-1">
            readonly: product_id, product_name, sku, category
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div
          className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800"
          data-ocid="seller.csv.success_state"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* Validation Errors — 20-col header */}
      {errors.length > 0 && (
        <div
          className="rounded-xl border border-red-200 overflow-hidden"
          data-ocid="seller.csv.error_state"
        >
          <div className="flex items-center gap-2 bg-red-50 px-4 py-3 border-b border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-700">
              Validation Errors — Fix these rows and re-upload
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium whitespace-nowrap">
                    Row
                  </th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium whitespace-nowrap">
                    Product
                  </th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium whitespace-nowrap">
                    Column(s)
                  </th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium whitespace-nowrap">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody>
                {errors.map((e) => (
                  <tr key={e.row} className="border-t border-red-100">
                    <td className="px-4 py-2 text-red-600 font-medium">
                      {e.row}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{e.productName}</td>
                    <td className="px-4 py-2 text-orange-600 font-mono text-xs">
                      {e.col}
                    </td>
                    <td className="px-4 py-2 text-red-600">{e.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 text-sm">
            Product Inventory ({myProducts.length} products)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Product Name
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Price (₹)
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Disc. Price (₹)
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Threshold
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Brand
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                  360°
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="seller.products.empty_state"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                paginated.map((p, i) => {
                  const isLow = p.stock <= (p.stockThreshold ?? 5);
                  const has360 = !!(p.folder360Url || p.highRes360FolderUrl);
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                      data-ocid={`seller.products.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px]">
                        <p className="line-clamp-2">{p.title}</p>
                        {p.skuId && (
                          <p className="text-xs text-gray-400 font-mono mt-0.5">
                            {p.skuId}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₹{p.price.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {p.discountedPrice
                          ? `₹${p.discountedPrice.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {p.stock}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {p.stockThreshold ?? 5}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {p.brand ?? p.brandName ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {has360 ? (
                          <span className="bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded text-xs">
                            360°
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isLow ? (
                          <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-xs animate-pulse">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded text-xs">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages} ({myProducts.length} products)
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                data-ocid="seller.products.pagination_prev"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                data-ocid="seller.products.pagination_next"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
