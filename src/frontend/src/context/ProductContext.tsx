import type React from "react";
import { createContext, useContext, useState } from "react";
import { PRODUCTS, type Product } from "../data/products";

interface ProductContextType {
  products: Product[];
  addProduct: (p: Product) => void;
  deleteProduct: (id: number) => void;
  updateProductPrice: (
    productId: number,
    newPrice: number,
    oldPrice: number,
    onDrop?: (id: number, title: string, price: number) => void,
  ) => void;
}

const ProductContext = createContext<ProductContextType>({
  products: PRODUCTS,
  addProduct: () => {},
  deleteProduct: () => {},
  updateProductPrice: () => {},
});

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);

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

  return (
    <ProductContext.Provider
      value={{ products, addProduct, deleteProduct, updateProductPrice }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}
