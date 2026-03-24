import { createContext, useContext, useState } from "react";

export type OrderStatus =
  | "Order Placed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered";

export interface Order {
  id: string;
  product: string;
  date: string;
  amount: string;
  status: OrderStatus;
  sellerEmail: string;
}

interface OrderTrackingContextValue {
  orders: Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
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
    status: "Delivered",
    sellerEmail: "techzone@aflino.com",
  },
  {
    id: "ORD-10391",
    product: "Men's Running Shoes – Size 42",
    date: "Mar 12, 2026",
    amount: "₹3,199",
    status: "Out for Delivery",
    sellerEmail: "fashionhub@aflino.com",
  },
  {
    id: "ORD-10267",
    product: "Stainless Steel Water Bottle 1L",
    date: "Mar 5, 2026",
    amount: "₹649",
    status: "Shipped",
    sellerEmail: "techzone@aflino.com",
  },
];

export function OrderTrackingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  return (
    <OrderTrackingContext.Provider value={{ orders, updateOrderStatus }}>
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
