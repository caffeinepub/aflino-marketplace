import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { logEmail, logWhatsApp } from "../utils/communicationLogger";

interface WishlistItem {
  productId: number;
  addedAt: number; // timestamp for sorting
  priceAtAdd?: number; // for price-drop detection
}

interface WishlistContextType {
  wishlistIds: number[];
  wishlistCount: number;
  priceDroppedIds: Set<number>;
  addToWishlist: (productId: number, price?: number) => void;
  removeFromWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (
    productId: number,
    isLoggedIn: boolean,
    onLoginRequired: () => void,
    price?: number,
  ) => void;
  triggerPriceDropAlerts: (
    productId: number,
    productTitle: string,
    newPrice: number,
  ) => void;
  syncGuestWishlist: () => void;
}

const STORAGE_KEY = "aflino_wishlist_v2";
const GUEST_KEY = "aflino_wishlist_guest";

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  wishlistCount: 0,
  priceDroppedIds: new Set(),
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isWishlisted: () => false,
  toggleWishlist: () => {},
  triggerPriceDropAlerts: () => {},
  syncGuestWishlist: () => {},
});

function loadItems(): WishlistItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as WishlistItem[];
    // Migrate from old flat array format
    const old = localStorage.getItem("aflino_wishlist");
    if (old) {
      const ids = JSON.parse(old) as number[];
      return ids.map((id) => ({ productId: id, addedAt: Date.now() }));
    }
    return [];
  } catch {
    return [];
  }
}

function saveItems(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function saveGuestItems(items: WishlistItem[]) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function loadGuestItems(): WishlistItem[] {
  try {
    const stored = localStorage.getItem(GUEST_KEY);
    return stored ? (JSON.parse(stored) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(loadItems);
  const [priceDroppedIds, setPriceDroppedIds] = useState<Set<number>>(
    new Set(),
  );

  const wishlistIds = items.map((i) => i.productId);
  const wishlistCount = items.length;

  // Persist on change
  useEffect(() => {
    saveItems(items);
  }, [items]);

  function addToWishlist(productId: number, price?: number) {
    setItems((prev) => {
      if (prev.some((i) => i.productId === productId)) return prev;
      return [...prev, { productId, addedAt: Date.now(), priceAtAdd: price }];
    });
  }

  function removeFromWishlist(productId: number) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function isWishlisted(productId: number) {
    return items.some((i) => i.productId === productId);
  }

  function toggleWishlist(
    productId: number,
    isLoggedIn: boolean,
    onLoginRequired: () => void,
    price?: number,
  ) {
    if (!isLoggedIn) {
      // Save to guest wishlist in localStorage so it survives login
      const guestItems = loadGuestItems();
      if (!guestItems.some((i) => i.productId === productId)) {
        saveGuestItems([
          ...guestItems,
          { productId, addedAt: Date.now(), priceAtAdd: price },
        ]);
      }
      onLoginRequired();
      return;
    }
    if (isWishlisted(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId, price);
    }
  }

  // Sync guest wishlist after login
  function syncGuestWishlist() {
    const guestItems = loadGuestItems();
    if (guestItems.length === 0) return;
    setItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.productId));
      const newItems = guestItems.filter((i) => !existingIds.has(i.productId));
      return [...prev, ...newItems];
    });
    localStorage.removeItem(GUEST_KEY);
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
        wishlistCount,
        priceDroppedIds,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        toggleWishlist,
        triggerPriceDropAlerts,
        syncGuestWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
