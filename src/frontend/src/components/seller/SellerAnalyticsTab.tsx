import { useAdCampaign } from "@/context/AdCampaignContext";
import { useAdWallet } from "@/context/AdWalletContext";
import { useOrderTracking } from "@/context/OrderTrackingContext";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FilterType = "today" | "7d" | "30d" | "custom";

interface DayData {
  date: string;
  spend: number;
  sales: number;
}

interface Props {
  sellerEmail: string;
}

function formatRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(date: Date): string {
  return `${date.toISOString().slice(0, 10)}`;
}

function formatLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// Seeded pseudo-random so demo data is stable across renders
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateDemoDay(dayIndex: number): { spend: number; sales: number } {
  const base = 400 + dayIndex * 60;
  const spend = Math.round(base + seededRandom(dayIndex * 3) * 800);
  const sales = Math.round(spend * (1.2 + seededRandom(dayIndex * 7) * 1.8));
  return { spend, sales };
}

export default function SellerAnalyticsTab({ sellerEmail }: Props) {
  const { getWallet } = useAdWallet();
  const { campaigns } = useAdCampaign();
  const { orders } = useOrderTracking();

  const [filter, setFilter] = useState<FilterType>("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [appliedCustomStart, setAppliedCustomStart] = useState("");
  const [appliedCustomEnd, setAppliedCustomEnd] = useState("");

  // ── date range ──────────────────────────────────────────────────────────────
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (filter === "today") {
      return { startDate: today, endDate: today };
    }
    if (filter === "7d") {
      return { startDate: addDays(today, -6), endDate: today };
    }
    if (filter === "30d") {
      return { startDate: addDays(today, -29), endDate: today };
    }
    // custom
    if (appliedCustomStart && appliedCustomEnd) {
      return {
        startDate: new Date(`${appliedCustomStart}T00:00:00`),
        endDate: new Date(`${appliedCustomEnd}T00:00:00`),
      };
    }
    return { startDate: addDays(today, -6), endDate: today };
  }, [filter, appliedCustomStart, appliedCustomEnd]);

  const wallet = getWallet(sellerEmail);
  const sellerCampaigns = campaigns.filter(
    (c) => c.sellerEmail === sellerEmail,
  );

  // ── Attribution: ad clicks from localStorage ────────────────────────────────
  const adClicks: Array<{ adId: string; clickTime: string }> = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("aflino_ad_clicks") ?? "[]");
    } catch {
      return [];
    }
  }, []);

  // ── Build day-by-day data ────────────────────────────────────────────────────
  const chartData: DayData[] = useMemo(() => {
    const days: DayData[] = [];
    let cursor = new Date(startDate);
    let dayIndex = 0;
    while (cursor <= endDate) {
      const ds = toDateStr(cursor);

      // Real spend: sum debit transactions on this day
      const realSpend = wallet.transactions
        .filter((tx) => {
          if (tx.type !== "debit") return false;
          return tx.timestamp.slice(0, 10) === ds;
        })
        .reduce((s, tx) => s + tx.amount, 0);

      // Real ad sales: orders within 7-day attribution window of any ad click
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const dayStart = new Date(`${ds}T00:00:00`).getTime();
      const dayEnd = dayStart + 86400000;

      const realSales = orders
        .filter((o) => {
          const orderTime = new Date(o.date).getTime();
          if (orderTime < dayStart || orderTime >= dayEnd) return false;
          // Check if there's a valid ad click within 7 days before this order
          return adClicks.some((click) => {
            const clickTime = new Date(click.clickTime).getTime();
            return (
              clickTime <= orderTime && orderTime - clickTime <= SEVEN_DAYS_MS
            );
          });
        })
        .reduce((s, o) => s + o.amountRaw, 0);

      const hasRealData = wallet.transactions.length > 0 || adClicks.length > 0;

      if (hasRealData) {
        days.push({ date: ds, spend: realSpend, sales: realSales });
      } else {
        const demo = generateDemoDay(dayIndex);
        days.push({ date: ds, spend: demo.spend, sales: demo.sales });
      }

      cursor = addDays(cursor, 1);
      dayIndex++;
    }
    return days;
  }, [startDate, endDate, wallet.transactions, orders, adClicks]);

  // ── Aggregate metrics ────────────────────────────────────────────────────────
  const totalSpend = useMemo(
    () => chartData.reduce((s, d) => s + d.spend, 0),
    [chartData],
  );
  const totalSales = useMemo(
    () => chartData.reduce((s, d) => s + d.sales, 0),
    [chartData],
  );
  const roas = totalSpend > 0 ? totalSales / totalSpend : 0;

  const totalClicks = sellerCampaigns.reduce((s, c) => s + c.clicks, 0);
  const totalImpressions = sellerCampaigns.reduce(
    (s, c) => s + c.impressions,
    0,
  );
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // ── ROAS badge style ─────────────────────────────────────────────────────────
  const roasBadgeClass =
    roas >= 2
      ? "bg-gradient-to-r from-[#006AFF] to-[#EC008C] text-white"
      : roas >= 1
        ? "bg-amber-400 text-white"
        : "bg-red-500 text-white";

  // ── CSV export ───────────────────────────────────────────────────────────────
  function downloadCSV() {
    const header = "Date,Impressions,Clicks,CTR%,Spend(₹),Sales(₹),ROAS\n";
    const totalDays = chartData.length || 1;
    const avgImpressions = Math.round(totalImpressions / totalDays);
    const avgClicks = Math.round(totalClicks / totalDays);

    const rows = chartData
      .map((d) => {
        const dayRoas = d.spend > 0 ? (d.sales / d.spend).toFixed(2) : "0.00";
        return `${d.date},${avgImpressions},${avgClicks},${ctr.toFixed(1)}%,${d.spend},${d.sales},${dayRoas}`;
      })
      .join("\n");

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ads_Performance_Report_${toDateStr(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Chart tooltip ─────────────────────────────────────────────────────────
  function CustomTooltip({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-700 mb-1.5">
          {label ? formatLabel(label) : ""}
        </p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-600">{p.name}:</span>
            <span className="font-semibold">{formatRupee(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  const filterBtns: Array<{ id: FilterType; label: string }> = [
    { id: "today", label: "Today" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "custom", label: "Custom Range" },
  ];

  return (
    <div className="max-w-5xl" data-ocid="seller.analytics.panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ad Performance</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Earnings vs Spend analytics with 7-day attribution
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-gray-700 shadow-sm"
          data-ocid="seller.analytics.download_csv_button"
        >
          <Download className="w-4 h-4" />
          Download Report (CSV)
        </button>
      </div>

      {/* Metric Cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        data-ocid="seller.analytics.metrics"
      >
        {/* Total Spend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Total Spend
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: "#006AFF" }}
            data-ocid="seller.analytics.total_spend"
          >
            {formatRupee(totalSpend)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Ad wallet debits</p>
        </div>

        {/* Total Ad Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Total Ad Sales
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: "#EC008C" }}
            data-ocid="seller.analytics.total_sales"
          >
            {formatRupee(totalSales)}
          </p>
          <p className="text-xs text-gray-400 mt-1">7-day attribution</p>
        </div>

        {/* ROAS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            ROAS
          </p>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-extrabold ${roasBadgeClass}`}
            data-ocid="seller.analytics.roas_badge"
          >
            {roas.toFixed(1)}× return
          </div>
          <p className="text-xs text-gray-400 mt-1">Revenue / Spend</p>
        </div>

        {/* CTR */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            CTR
          </p>
          <p
            className="text-xl font-bold text-emerald-600"
            data-ocid="seller.analytics.ctr"
          >
            {ctr.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totalClicks.toLocaleString()} clicks /{" "}
            {totalImpressions.toLocaleString()} impr.
          </p>
        </div>
      </div>

      {/* Time Filters + Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {filterBtns.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setFilter(btn.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === btn.id
                  ? "text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={
                filter === btn.id ? { backgroundColor: "#006AFF" } : undefined
              }
              data-ocid={`seller.analytics.filter_${btn.id}`}
            >
              {btn.label}
            </button>
          ))}

          {filter === "custom" && (
            <div className="flex items-center gap-2 ml-1 flex-wrap">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                data-ocid="seller.analytics.custom_start"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                data-ocid="seller.analytics.custom_end"
              />
              <button
                type="button"
                onClick={() => {
                  if (customStart && customEnd) {
                    setAppliedCustomStart(customStart);
                    setAppliedCustomEnd(customEnd);
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "#006AFF" }}
                data-ocid="seller.analytics.custom_apply"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Chart */}
        <div data-ocid="seller.analytics.chart">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData.map((d) => ({
                ...d,
                label: formatLabel(d.date),
              }))}
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) =>
                  `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value: string) => (
                  <span className="text-sm text-gray-600">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="spend"
                name="Daily Ad Spend"
                stroke="#006AFF"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#006AFF", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                name="Daily Sales from Ads"
                stroke="#EC008C"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#EC008C", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          {wallet.transactions.length === 0 && adClicks.length === 0
            ? "Showing simulated demo data — run your first ad campaign to see real analytics"
            : "Sales credited to the day the ad click occurred (7-day attribution window)"}
        </p>
      </div>
    </div>
  );
}
