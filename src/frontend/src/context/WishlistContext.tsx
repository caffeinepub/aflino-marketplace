import type React from "react";
import { createContext, useContext, useState } from "react";
import { logEmail, logWhatsApp } from "../utils/communicationLogger";

interface WishlistContextType {
  wishlistIds: number[];
  priceDroppedIds: Set<number>;
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (
    productId: number,
    isLoggedIn: boolean,
    onLoginRequired: () => void,
  ) => void;
  triggerPriceDropAlerts: (
    productId: number,
    productTitle: string,
    newPrice: number,
  ) => void;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  priceDroppedIds: new Set(),
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isWishlisted: () => false,
  toggleWishlist: () => {},
  triggerPriceDropAlerts: () => {},
});

function loadFromStorage(): number[] {
  try {
    const stored = localStorage.getItem("aflino_wishlist");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids: number[]) {
  try {
    localStorage.setItem("aflino_wishlist", JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>(loadFromStorage);
  const [priceDroppedIds, setPriceDroppedIds] = useState<Set<number>>(
    new Set(),
  );

  function addToWishlist(productId: number) {
    setWishlistIds((prev) => {
      if (prev.includes(productId)) return prev;
      const next = [...prev, productId];
      saveToStorage(next);
      return next;
    });
  }

  function removeFromWishlist(productId: number) {
    setWishlistIds((prev) => {
      const next = prev.filter((id) => id !== productId);
      saveToStorage(next);
      return next;
    });
  }

  function isWishlisted(productId: number) {
    return wishlistIds.includes(productId);
  }

  function toggleWishlist(
    productId: number,
    isLoggedIn: boolean,
    onLoginRequired: () => void,
  ) {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    if (isWishlisted(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  }

  function triggerPriceDropAlerts(
    productId: number,
    productTitle: string,
    newPrice: number,
  ) {
    const orderId = `PRICE_DROP_${productId}`;
    logEmail(
      "price_drop_alert",
      "wishlist-users@aflino.com",
      `Price Drop Alert! "${productTitle}" is now ₹${newPrice.toLocaleString("en-IN")} on AFLINO`,
      orderId,
    );
    logWhatsApp("price_drop_alert", "wishlist-users", orderId);
    setPriceDroppedIds((prev) => new Set([...prev, productId]));
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        priceDroppedIds,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        toggleWishlist,
        triggerPriceDropAlerts,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
