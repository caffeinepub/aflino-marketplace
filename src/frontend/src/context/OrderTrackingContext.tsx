import { useWallet } from "@/context/WalletContext";
import { createContext, useContext, useState } from "react";

export type OrderStatus =
  | "Order Placed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Paid & Processing";

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
    amount: "₹2,499",
    amountRaw: 2499,
    status: "Delivered",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    buyerName: "Rahul Sharma",
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
  },
  {
    id: "ORD-10391",
    product: "Men's Running Shoes – Size 42",
    date: "Mar 12, 2026",
    amount: "₹3,199",
    amountRaw: 3199,
    status: "Out for Delivery",
    sellerEmail: "fashionhub@aflino.com",
    sellerName: "Fashion Hub",
    buyerName: "Priya Mehta",
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
  },
  {
    id: "ORD-10267",
    product: "Stainless Steel Water Bottle 1L",
    date: "Mar 5, 2026",
    amount: "₹649",
    amountRaw: 649,
    status: "Shipped",
    sellerEmail: "techzone@aflino.com",
    sellerName: "TechZone Store",
    buyerName: "Arjun Nair",
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
  },
];

export function OrderTrackingProvider({
  children,
}: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const { addWalletEntry } = useWallet();

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
