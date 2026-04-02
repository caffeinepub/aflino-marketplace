import { useWallet } from "@/context/WalletContext";
import { createContext, useContext, useEffect, useState } from "react";

export type OrderStatus =
  | "Order Placed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Paid & Processing"
  | "Confirmed (COD)"
  | "Refund Initiated";

export interface Order {
  id: string;
  product: string;
  date: string;
  amount: string;
  amountRaw: number;
  status: OrderStatus;
  sellerEmail: string;
  sellerName: string;
  // Invoice fields
  quantity?: number;
  unitPrice?: number;
  buyerName?: string;
  buyerAddress?: string;
  buyerState?: string;
  buyerPincode?: string;
  sellerAddress?: string;
  sellerState?: string;
  sellerGstin?: string;
  sellerPan?: string;
  hsnCode?: string;
  gstRate?: number;
  discount?: number;
  category?: string;
  // Customer contact (for encrypted QR)
  buyerPhone?: string;
  // Logistics / Shipping
  awbNumber?: string;
  courierPartner?: string;
  nonReturnable?: boolean;
  indiaPostOrder?: boolean;
}

interface OrderTrackingContextValue {
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  addOrder: (order: Order) => void;
}

const OrderTrackingContext = createContext<OrderTrackingContextValue | null>(
  null,
);

const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-10482",
    product: "Wireless Bluetooth Headphones",
    date: "Mar 18, 2026",
    amount: "\u20B92,499",
    amountRaw: 2499,
    status: "Delivered",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    buyerName: "Rahul Sharma",
    buyerPhone: "+91-98765-43210",
    buyerAddress: "45 Andheri West, Mumbai - 400058",
    buyerState: "Maharashtra",
    buyerPincode: "400058",
    sellerAddress:
      "Plot 45, MIDC Industrial Area, Andheri East, Mumbai - 400093",
    sellerState: "Maharashtra",
    sellerGstin: "27AABCT1234A1Z5",
    sellerPan: "AABCT1234A",
    hsnCode: "8517",
    gstRate: 18,
    quantity: 1,
    unitPrice: 2499,
    discount: 0,
    category: "Electronics",
    awbNumber: "DL-112233445",
    courierPartner: "Delhivery",
  },
  {
    id: "ORD-10391",
    product: "Men's Running Shoes \u2013 Size 42",
    date: "Mar 12, 2026",
    amount: "\u20B93,199",
    amountRaw: 3199,
    status: "Out for Delivery",
    sellerEmail: "fashionhub@aflino.com",
    sellerName: "Fashion Hub",
    buyerName: "Priya Mehta",
    buyerPhone: "+91-91234-56789",
    buyerAddress: "B-12, Lajpat Nagar Phase II, New Delhi - 110024",
    buyerState: "Delhi",
    buyerPincode: "110024",
    sellerAddress: "#12, 3rd Cross, Koramangala 5th Block, Bengaluru - 560095",
    sellerState: "Karnataka",
    sellerGstin: "29AABCF5678B1Z3",
    sellerPan: "AABCF5678B",
    hsnCode: "6109",
    gstRate: 12,
    quantity: 1,
    unitPrice: 3199,
    discount: 200,
    category: "Fashion",
    awbNumber: "BD-556677889",
    courierPartner: "BlueDart",
  },
  {
    id: "ORD-10267",
    product: "Stainless Steel Water Bottle 1L",
    date: "Mar 5, 2026",
    amount: "\u20B9649",
    amountRaw: 649,
    status: "Shipped",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    buyerName: "Arjun Nair",
    buyerPhone: "+91-90000-12345",
    buyerAddress: "Plot 7, Sector 15, Navi Mumbai - 400614",
    buyerState: "Maharashtra",
    buyerPincode: "400614",
    sellerAddress:
      "Plot 45, MIDC Industrial Area, Andheri East, Mumbai - 400093",
    sellerState: "Maharashtra",
    sellerGstin: "27AABCT1234A1Z5",
    sellerPan: "AABCT1234A",
    hsnCode: "7323",
    gstRate: 18,
    quantity: 2,
    unitPrice: 649,
    discount: 0,
    category: "Home & Kitchen",
    awbNumber: "DL-987654321",
    courierPartner: "Delhivery",
  },
];

const STORAGE_KEY = "aflino_orders";

function loadOrdersFromStorage(): Order[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Order[];
  } catch {
    return null;
  }
}

function saveOrdersToStorage(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore storage errors
  }
}

/**
 * Non-hook helper for PickupConfirmationPage (runs outside React context).
 * Directly updates order status in localStorage.
 */
export function updateOrderStatusInStorage(
  orderId: string,
  status: OrderStatus,
): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const orders: Order[] = JSON.parse(stored);
    let found = false;
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        found = true;
        return { ...o, status };
      }
      return o;
    });
    if (found) localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return found;
  } catch {
    return false;
  }
}

export function OrderTrackingProvider({
  children,
}: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = loadOrdersFromStorage();
    if (stored && stored.length > 0) return stored;
    return INITIAL_ORDERS;
  });
  const { addWalletEntry } = useWallet();

  // Persist to localStorage whenever orders change
  useEffect(() => {
    saveOrdersToStorage(orders);
  }, [orders]);

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (status === "Delivered" && o.status !== "Delivered") {
          addWalletEntry({
            orderId: o.id,
            sellerEmail: o.sellerEmail,
            sellerName: o.sellerName,
            productName: o.product,
            orderAmount: o.amountRaw,
            deliveredAt: new Date().toISOString(),
          });
        }
        return { ...o, status };
      }),
    );
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  return (
    <OrderTrackingContext.Provider
      value={{ orders, updateOrderStatus, addOrder }}
    >
      {children}
    </OrderTrackingContext.Provider>
  );
}

export function useOrderTracking() {
  const ctx = useContext(OrderTrackingContext);
  if (!ctx)
    throw new Error(
      "useOrderTracking must be used within OrderTrackingProvider",
    );
  return ctx;
}
