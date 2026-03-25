import type { Order } from "@/context/OrderTrackingContext";
import { BarChart2, IndianRupee, MapPin, Package } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  orders: Order[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLogisticsLabel(order: Order): string {
  if (order.indiaPostOrder) return "India Post";
  if (order.courierPartner?.toLowerCase().includes("shiprocket"))
    return "Shiprocket";
  return "iThinkLogistics";
}

function parseDateStr(dateStr: string): Date | null {
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

export default function AdminCommandCenter({ orders }: Props) {
  // --- Top 5 Pincodes ---
  const pincodeCounts: Record<string, number> = {};
  for (const o of orders) {
    if (o.buyerPincode) {
      pincodeCounts[o.buyerPincode] = (pincodeCounts[o.buyerPincode] ?? 0) + 1;
    }
  }
  const topPincodes = Object.entries(pincodeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pincode, count]) => ({ pincode, count }));

  // --- Logistics Split ---
  const logisticsCounts: Record<string, number> = {};
  for (const o of orders) {
    const label = getLogisticsLabel(o);
    logisticsCounts[label] = (logisticsCounts[label] ?? 0) + 1;
  }
  const totalOrders = orders.length || 1;
  const pieData = Object.entries(logisticsCounts).map(([name, value]) => ({
    name,
    value,
    pct: Math.round((value / totalOrders) * 100),
  }));
  const PIE_COLORS: Record<string, string> = {
    iThinkLogistics: "#006AFF",
    Shiprocket: "#EC008C",
    "India Post": "#F59E0B",
  };

  // --- Weekly Revenue ---
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      day: DAYS[d.getDay()],
      date: d.toDateString(),
      revenue: 0,
    };
  });

  for (const o of orders) {
    const d = parseDateStr(o.date);
    if (!d) continue;
    const ds = d.toDateString();
    const slot = weekData.find((w) => w.date === ds);
    if (slot) slot.revenue += o.amountRaw;
  }

  // Summary stats
  const totalRevenue = orders.reduce((s, o) => s + o.amountRaw, 0);
  const indiaPostCount = orders.filter((o) => o.indiaPostOrder).length;

  return (
    <div data-ocid="admin.analytics.panel">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <BarChart2 className="w-6 h-6" style={{ color: "#006AFF" }} />
          Command Center
        </h2>
        <p className="text-gray-500 text-sm">
          Live analytics and geographic insights for your marketplace
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#EEF4FF" }}
          >
            <Package className="w-5 h-5" style={{ color: "#006AFF" }} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#FFF0F8" }}
          >
            <IndianRupee className="w-5 h-5" style={{ color: "#EC008C" }} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#FFFBEB" }}
          >
            <MapPin className="w-5 h-5" style={{ color: "#F59E0B" }} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">
              India Post Orders
            </p>
            <p className="text-2xl font-bold text-gray-900">{indiaPostCount}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Pincodes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Top 5 Pincodes by Order Volume
          </h3>
          {topPincodes.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              No pincode data yet
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPincodes}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="pincode" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, "Orders"]} />
                  <Bar dataKey="count" fill="#006AFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Logistics Split */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Logistics Partner Split
          </h3>
          {pieData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              No order data yet
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={60}
                    label={({ pct }) => `${pct}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[entry.name] ?? "#6B7280"}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px" }}
                    formatter={(value: string, entry: any) =>
                      `${value} (${(entry as { payload?: { pct?: number } }).payload?.pct ?? 0}%)`
                    }
                  />
                  <Tooltip formatter={(v) => [v, "Orders"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Weekly Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Daily Revenue (Last 7 Days)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weekData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => [`₹${v}`, "Revenue"]} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#006AFF"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#006AFF" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
