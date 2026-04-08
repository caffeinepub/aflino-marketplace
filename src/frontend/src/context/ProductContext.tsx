import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import {
  PRODUCTS,
  type Product,
  type Product360Asset,
  type ProductMedia,
  type ProductVariantExtended,
} from "../data/products";

// Re-export new types so consumers can import from ProductContext
export type { Product360Asset, ProductMedia, ProductVariantExtended };

interface BulkUpdate {
  id: number;
  price?: number;
  discountedPrice?: number;
  stock?: number;
  stockThreshold?: number;
  // Extended fields from 20-col CSV
  skuId?: string;
  brand?: string;
  isVariable?: boolean;
  parentSku?: string;
  videoUrl?: string;
  folder360Url?: string;
  highRes360FolderUrl?: string;
}

interface ProductContextType {
  products: Product[];
  lowStockProducts: Product[];
  addProduct: (p: Product) => void;
  deleteProduct: (id: number) => void;
  updateProductPrice: (
    productId: number,
    newPrice: number,
    oldPrice: number,
    onDrop?: (id: number, title: string, price: number) => void,
  ) => void;
  updateProductsBulk: (updates: BulkUpdate[]) => void;
}

const ProductContext = createContext<ProductContextType>({
  products: PRODUCTS,
  lowStockProducts: [],
  addProduct: () => {},
  deleteProduct: () => {},
  updateProductPrice: () => {},
  updateProductsBulk: () => {},
});

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= (p.stockThreshold ?? 5)),
    [products],
  );

  const addProduct = (p: Product) => setProducts((prev) => [p, ...prev]);

  const deleteProduct = (id: number) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));

  const updateProductPrice = (
    productId: number,
    newPrice: number,
    oldPrice: number,
    onDrop?: (id: number, title: string, price: number) => void,
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          if (newPrice < oldPrice && onDrop) {
            onDrop(productId, p.title, newPrice);
          }
          return { ...p, price: newPrice };
        }
        return p;
      }),
    );
  };

  const updateProductsBulk = (updates: BulkUpdate[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        const update = updates.find((u) => u.id === p.id);
        if (!update) return p;
        return {
          ...p,
          ...(update.price !== undefined ? { price: update.price } : {}),
          ...(update.discountedPrice !== undefined
            ? { discountedPrice: update.discountedPrice }
            : {}),
          ...(update.stock !== undefined ? { stock: update.stock } : {}),
          ...(update.stockThreshold !== undefined
            ? { stockThreshold: update.stockThreshold }
            : {}),
          // Extended fields — only applied when present (20-col CSV)
          ...(update.skuId !== undefined ? { skuId: update.skuId } : {}),
          ...(update.brand !== undefined ? { brand: update.brand } : {}),
          ...(update.isVariable !== undefined
            ? { isVariable: update.isVariable }
            : {}),
          ...(update.parentSku !== undefined
            ? { parentSku: update.parentSku }
            : {}),
          ...(update.videoUrl !== undefined
            ? { videoUrl: update.videoUrl }
            : {}),
          ...(update.folder360Url !== undefined
            ? { folder360Url: update.folder360Url }
            : {}),
          ...(update.highRes360FolderUrl !== undefined
            ? { highRes360FolderUrl: update.highRes360FolderUrl }
            : {}),
        };
      }),
    );
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        lowStockProducts,
        addProduct,
        deleteProduct,
        updateProductPrice,
        updateProductsBulk,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
