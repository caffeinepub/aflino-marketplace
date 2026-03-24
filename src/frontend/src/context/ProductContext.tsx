import type React from "react";
import { createContext, useContext, useState } from "react";
import { PRODUCTS, type Product } from "../data/products";

interface ProductContextType {
  products: Product[];
  addProduct: (p: Product) => void;
  deleteProduct: (id: number) => void;
}

const ProductContext = createContext<ProductContextType>({
  products: PRODUCTS,
  addProduct: () => {},
  deleteProduct: () => {},
});

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const addProduct = (p: Product) => setProducts((prev) => [p, ...prev]);
  const deleteProduct = (id: number) =>
    setProducts((prev) => prev.filter((p) => p.id !== id));
  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
