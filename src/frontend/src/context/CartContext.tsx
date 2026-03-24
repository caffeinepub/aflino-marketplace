import { createContext, useContext, useState } from "react";

export interface CartItem {
  cartItemId: string;
  productId: number;
  productTitle: string;
  price: number;
  quantity: number;
  variant?: {
    id: string;
    size: string;
    color: string;
    colorHex: string;
  };
}

type AddCartItem = Omit<CartItem, "cartItemId" | "quantity">;

interface CartContextValue {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: AddCartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function makeCartItemId(item: AddCartItem): string {
  const variantPart = item.variant ? item.variant.id : "no-variant";
  return `${item.productId}-${variantPart}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  function addToCart(item: AddCartItem) {
    const cartItemId = makeCartItemId(item);
    setCartItems((prev) => {
      const existing = prev.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, cartItemId, quantity: 1 }];
    });
  }

  function removeFromCart(cartItemId: string) {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
