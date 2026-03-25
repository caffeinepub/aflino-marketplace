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

interface ValidationError {
  row: number;
  productName: string;
  error: string;
}

interface Props {
  sellerEmail?: string;
}

export default function BulkCSVManager({ sellerEmail = "" }: Props) {
  const { products, updateProductsBulk } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [page, setPage] = useState(1);

  // For demo, show TechZone Store + Seller Store products (same as logged-in seller)
  const myProducts = products.filter(
    (p) =>
      p.seller === sellerEmail ||
      p.seller === "TechZone Store" ||
      p.seller === "Seller Store",
  );

  const totalPages = Math.ceil(myProducts.length / PAGE_SIZE);
  const paginated = myProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // --- Export CSV ---
  const handleExport = () => {
    const header =
      "product_id,product_name,sku,category,price,discounted_price,stock,stock_threshold";
    const rows = myProducts.map((p) => {
      const name = `"${p.title.replace(/"/g, '""')}"`;
      const sku = p.variants?.[0]?.sku ?? "";
      return `${p.id},${name},${sku},${p.category},${p.price},${p.discountedPrice ?? p.price},${p.stock},${p.stockThreshold ?? 5}`;
    });
    const csv = [header, ...rows].join("\n");
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

      const parseRow = (line: string): string[] => {
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
            result.push(current);
            current = "";
          } else {
            current += ch;
          }
        }
        result.push(current);
        return result;
      };

      const validationErrors: ValidationError[] = [];
      const updates: Array<{
        id: number;
        price?: number;
        discountedPrice?: number;
        stock?: number;
        stockThreshold?: number;
      }> = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = parseRow(lines[i]);
        if (parts.length < 8) continue;

        const [
          idStr,
          productName,
          ,
          ,
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
        if (Number.isNaN(id)) rowErrors.push("Invalid product_id");
        if (Number.isNaN(price) || price < 0)
          rowErrors.push("Price must be a positive number");
        if (Number.isNaN(discountedPrice) || discountedPrice < 0)
          rowErrors.push("Discounted price must be a positive number");
        if (Number.isNaN(stock) || stock < 0)
          rowErrors.push("Stock must be a positive number");
        if (Number.isNaN(stockThreshold) || stockThreshold < 1)
          rowErrors.push("Stock threshold must be ≥ 1");

        if (rowErrors.length > 0) {
          validationErrors.push({
            row: i + 1,
            productName: productName || `Row ${i + 1}`,
            error: rowErrors.join("; "),
          });
        } else {
          updates.push({ id, price, discountedPrice, stock, stockThreshold });
        }
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        toast.error(
          `${validationErrors.length} row(s) have errors. Please fix and re-upload.`,
        );
        return;
      }

      updateProductsBulk(updates);
      setSuccessMsg(`${updates.length} products updated successfully!`);
      toast.success(`${updates.length} products updated successfully!`);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          My Products & Bulk Manager
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage inventory, prices, and stock in bulk via CSV.
        </p>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">How to use Bulk CSV:</p>
          <p>
            Keep it simple — open in Excel or Google Sheets. Only edit the{" "}
            <strong>price</strong>, <strong>discounted_price</strong>,{" "}
            <strong>stock</strong>, and <strong>stock_threshold</strong>{" "}
            columns.{" "}
            <span className="text-blue-600">
              Do not modify product_id, product_name, sku, or category
            </span>{" "}
            (readonly).
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

      {/* Validation Errors */}
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
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">
                  Row
                </th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">
                  Product
                </th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">
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
                  <td className="px-4 py-2 text-red-600">{e.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Product Name
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Price (₹)
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Disc. Price (₹)
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Threshold
                </th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="seller.products.empty_state"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                paginated.map((p, i) => {
                  const isLow = p.stock <= (p.stockThreshold ?? 5);
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                      data-ocid={`seller.products.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px]">
                        <p className="line-clamp-2">{p.title}</p>
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
