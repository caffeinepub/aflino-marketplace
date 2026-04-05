import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { AdCampaign } from "@/context/AdCampaignContext";
import { useAdCampaign } from "@/context/AdCampaignContext";
import type { AdWallet } from "@/context/AdWalletContext";
import { useAdWallet } from "@/context/AdWalletContext";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  CreditCard,
  DollarSign,
  ExternalLink,
  Inbox,
  Layers,
  Megaphone,
  Pause,
  Play,
  TrendingUp,
  Upload,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/* ─── Brand types (preserved) ───────────────────────────── */
type LeadStatus = "new" | "contacted" | "converted";
interface BrandLead {
  id: string;
  brandName: string;
  website: string;
  contactName: string;
  email: string;
  phone: string;
  budget: string;
  message: string;
  submittedAt: string;
  status: LeadStatus;
}
interface Campaign {
  id: number;
  brand: string;
  slot: string;
  status: "active" | "paused";
  startDate: string;
  endDate: string;
  impressions: number;
  budget: number;
}
interface SlotPricing {
  name: string;
  placement: string;
  dimensions: string;
  cpm: string;
  cpc: string;
  active: boolean;
}
const DEFAULT_SLOTS: SlotPricing[] = [
  {
    name: "Homepage Hero Banner",
    placement: "Top of Homepage",
    dimensions: "1200×200 px",
    cpm: "180",
    cpc: "12",
    active: true,
  },
  {
    name: "Search Sidebar",
    placement: "Search Results Page",
    dimensions: "300×600 px",
    cpm: "220",
    cpc: "15",
    active: true,
  },
  {
    name: "Category Top Banner",
    placement: "Category Listing",
    dimensions: "970×90 px",
    cpm: "150",
    cpc: "10",
    active: true,
  },
  {
    name: "Cart Page Promo",
    placement: "Checkout / Cart",
    dimensions: "600×100 px",
    cpm: "260",
    cpc: "18",
    active: true,
  },
  {
    name: "Product Detail Sidebar",
    placement: "Product Pages",
    dimensions: "300×250 px",
    cpm: "200",
    cpc: "14",
    active: true,
  },
  {
    name: "Mobile App Banner",
    placement: "PWA / Mobile",
    dimensions: "360×80 px",
    cpm: "170",
    cpc: "11",
    active: false,
  },
];
const MOCK_BRAND_CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    brand: "Mamaearth",
    slot: "Homepage Hero Banner",
    status: "active",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    impressions: 142350,
    budget: 25000,
  },
  {
    id: 2,
    brand: "boAt",
    slot: "Search Sidebar",
    status: "paused",
    startDate: "2026-03-15",
    endDate: "2026-04-15",
    impressions: 89200,
    budget: 18000,
  },
];

type MainTab =
  | "leads"
  | "campaigns"
  | "pricing"
  | "approvals"
  | "placement"
  | "revenue"
  | "escrow";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#FEF3C7", text: "#92400E" },
  active: { bg: "#D1FAE5", text: "#065F46" },
  approved: { bg: "#D1FAE5", text: "#065F46" },
  rejected: { bg: "#FEE2E2", text: "#991B1B" },
  paused: { bg: "#F3F4F6", text: "#374151" },
  exhausted: { bg: "#FFF7ED", text: "#9A3412" },
};

function statusBadge(status: string) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.paused;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─── Revenue bar chart (CSS-only, no library) ──────────── */
const MONTHLY_REVENUE = [
  { month: "Oct", seller: 4200, brand: 18000 },
  { month: "Nov", seller: 7800, brand: 22000 },
  { month: "Dec", seller: 15600, brand: 35000 },
  { month: "Jan", seller: 11200, brand: 28000 },
  { month: "Feb", seller: 9800, brand: 24000 },
  { month: "Mar", seller: 14400, brand: 31000 },
];

function RevenueChart() {
  const maxVal = Math.max(...MONTHLY_REVENUE.map((r) => r.seller + r.brand));
  return (
    <div className="space-y-2">
      {MONTHLY_REVENUE.map((r) => {
        const total = r.seller + r.brand;
        const sellerPct = (r.seller / maxVal) * 100;
        const brandPct = (r.brand / maxVal) * 100;
        return (
          <div key={r.month} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-8 flex-shrink-0">
              {r.month}
            </span>
            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full rounded-l-full transition-all"
                style={{
                  width: `${sellerPct}%`,
                  backgroundColor: "#006AFF",
                  opacity: 0.85,
                }}
              />
              <div
                className="h-full transition-all"
                style={{
                  width: `${brandPct}%`,
                  backgroundColor: "#EC008C",
                  opacity: 0.75,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 w-20 text-right">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        );
      })}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#006AFF] inline-block" />
          Seller Ads
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#EC008C] inline-block" />
          Brand Partner
        </span>
      </div>
    </div>
  );
}

export default function AdminAdsManager() {
  const [tab, setTab] = useState<MainTab>("leads");

  /* Brand leads */
  const [leads, setLeads] = useState<BrandLead[]>(() =>
    JSON.parse(localStorage.getItem("brandLeads") || "[]"),
  );
  const [brandCampaigns, setBrandCampaigns] =
    useState<Campaign[]>(MOCK_BRAND_CAMPAIGNS);
  const [slots, setSlots] = useState<SlotPricing[]>(() => {
    const saved = localStorage.getItem("adSlotPricing");
    return saved ? JSON.parse(saved) : DEFAULT_SLOTS;
  });
  const [selectedLead, setSelectedLead] = useState<BrandLead | null>(null);

  /* Seller campaigns */
  const {
    campaigns: sellerCampaigns,
    placementConfig,
    approveCampaign,
    rejectCampaign,
    updatePlacementConfig,
  } = useAdCampaign();

  /* Escrow */
  const { wallets, adminCredit, adminDebit, getTotalEscrow } = useAdWallet();

  /* Reject dialog state */
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  /* Escrow admin action */
  const [escrowAction, setEscrowAction] = useState<{
    wallet: AdWallet;
    mode: "credit" | "debit";
  } | null>(null);
  const [escrowAmount, setEscrowAmount] = useState("");
  const [escrowReason, setEscrowReason] = useState("");

  /* Helpers */
  const markContacted = (id: string) => {
    const updated = leads.map((l) =>
      l.id === id ? { ...l, status: "contacted" as LeadStatus } : l,
    );
    setLeads(updated);
    localStorage.setItem("brandLeads", JSON.stringify(updated));
    toast.success("Lead marked as contacted.");
  };
  const toggleBrandCampaign = (id: number) => {
    setBrandCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c,
      ),
    );
  };
  const endBrandCampaign = (id: number) => {
    setBrandCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast.success("Campaign ended.");
  };
  const savePricing = () => {
    localStorage.setItem("adSlotPricing", JSON.stringify(slots));
    toast.success("Slot pricing saved!");
  };
  const updateSlot = (
    idx: number,
    field: keyof SlotPricing,
    value: string | boolean,
  ) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  const pendingCampaigns = sellerCampaigns.filter(
    (c) => c.status === "pending",
  );
  const pendingByType = (type: AdCampaign["adType"]) =>
    pendingCampaigns.filter((c) => c.adType === type);

  // Revenue: separate seller spend vs brand partner budget (fix: these were identical before)
  const sellerAdRevenue = wallets.reduce((s, w) => s + w.totalSpent, 0);
  const brandRevenue = MOCK_BRAND_CAMPAIGNS.reduce((s, c) => s + c.budget, 0);
  const totalAdRevenue = sellerAdRevenue + brandRevenue;

  // All ad wallet transactions flattened for the ledger
  const allTransactions = wallets
    .flatMap((w) =>
      w.transactions.map((tx) => ({ ...tx, sellerEmail: w.sellerEmail })),
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const TAB_LIST: { key: MainTab; label: string }[] = [
    { key: "leads", label: "Brand Leads" },
    { key: "campaigns", label: "Brand Campaigns" },
    { key: "pricing", label: "Slot Pricing" },
    { key: "approvals", label: "Approval Queues" },
    { key: "placement", label: "Placement Controls" },
    { key: "revenue", label: "Revenue" },
    { key: "escrow", label: "Ad Escrow" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5" style={{ color: "#006AFF" }} />
          Ads Manager
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Brand partnerships, seller campaigns, RTB controls, and revenue.
        </p>
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit min-w-max">
          {TAB_LIST.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                tab === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              data-ocid={`admin.ads.${key}.tab`}
            >
              {label}
              {key === "approvals" && pendingCampaigns.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {pendingCampaigns.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab 1: Brand Leads ─────────────────────────────────── */}
      {tab === "leads" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Leads",
                value: leads.length,
                icon: Users,
                color: "#006AFF",
              },
              {
                label: "New Leads",
                value: leads.filter((l) => l.status === "new").length,
                icon: Inbox,
                color: "#F59E0B",
              },
              {
                label: "Converted",
                value: leads.filter((l) => l.status === "converted").length,
                icon: TrendingUp,
                color: "#10B981",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
          {leads.length === 0 ? (
            <div
              className="bg-white rounded-2xl border border-gray-100 p-16 text-center"
              data-ocid="admin.leads.empty_state"
            >
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No brand inquiries yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Submissions from /advertise-with-us will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead, i) => (
                    <TableRow
                      key={lead.id}
                      data-ocid={`admin.leads.row.${i + 1}`}
                    >
                      <TableCell className="font-semibold text-gray-800">
                        {lead.brandName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.contactName}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {lead.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.budget || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(lead.submittedAt).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short" },
                        )}
                      </TableCell>
                      <TableCell>{statusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {lead.status === "new" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => markContacted(lead.id)}
                              data-ocid={`admin.leads.contacted.button.${i + 1}`}
                            >
                              Mark Contacted
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                            onClick={() => setSelectedLead(lead)}
                            data-ocid={`admin.leads.view.button.${i + 1}`}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Brand Campaigns ─────────────────────────── */}
      {tab === "campaigns" && (
        <div className="space-y-4">
          {brandCampaigns.length === 0 ? (
            <div
              className="bg-white rounded-2xl border border-gray-100 p-16 text-center"
              data-ocid="admin.campaigns.empty_state"
            >
              <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active campaigns</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandCampaigns.map((c, i) => (
                    <TableRow
                      key={c.id}
                      data-ocid={`admin.campaigns.row.${i + 1}`}
                    >
                      <TableCell className="font-semibold">{c.brand}</TableCell>
                      <TableCell className="text-sm">{c.slot}</TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {c.startDate} → {c.endDate}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {c.impressions.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        ₹{c.budget.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1"
                            onClick={() => toggleBrandCampaign(c.id)}
                            data-ocid={`admin.campaigns.toggle.button.${i + 1}`}
                          >
                            {c.status === "active" ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            {c.status === "active" ? "Pause" : "Resume"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-xs text-red-500"
                            onClick={() => endBrandCampaign(c.id)}
                            data-ocid={`admin.campaigns.end.button.${i + 1}`}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> End
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 3: Slot Pricing ──────────────────────────────── */}
      {tab === "pricing" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Set floor prices for brand campaign placements.
            </p>
            <Button
              type="button"
              onClick={savePricing}
              className="text-white gap-2"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="admin.pricing.save.button"
            >
              <DollarSign className="w-4 h-4" /> Save Pricing
            </Button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot Name</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Floor CPM (₹)</TableHead>
                  <TableHead>Floor CPC (₹)</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot, i) => (
                  <TableRow
                    key={slot.name}
                    data-ocid={`admin.pricing.row.${i + 1}`}
                  >
                    <TableCell className="font-semibold text-sm">
                      {slot.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {slot.placement}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {slot.dimensions}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={slot.cpm}
                        onChange={(e) => updateSlot(i, "cpm", e.target.value)}
                        className="w-24 h-8 text-sm"
                        data-ocid={`admin.pricing.cpm.input.${i + 1}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={slot.cpc}
                        onChange={(e) => updateSlot(i, "cpc", e.target.value)}
                        className="w-24 h-8 text-sm"
                        data-ocid={`admin.pricing.cpc.input.${i + 1}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={slot.active}
                        onCheckedChange={(v) => updateSlot(i, "active", v)}
                        data-ocid={`admin.pricing.status.switch.${i + 1}`}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── Tab 4: Approval Queues ───────────────────────────── */}
      {tab === "approvals" && (
        <div className="space-y-6">
          {(
            [
              "product_boost",
              "banner_ad",
              "video_spotlight",
            ] as AdCampaign["adType"][]
          ).map((type) => {
            const pending = pendingByType(type);
            const typeLabel =
              type === "product_boost"
                ? "Product Boost"
                : type === "banner_ad"
                  ? "Banner Ads"
                  : "Video Spotlights";
            return (
              <div key={type} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {typeLabel}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      pending.length > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {pending.length} pending
                  </span>
                </div>
                {pending.length === 0 ? (
                  <p
                    className="text-sm text-gray-400 py-3"
                    data-ocid={`admin.approvals.${type}.empty_state`}
                  >
                    No pending {typeLabel.toLowerCase()} to review.
                  </p>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Seller</TableHead>
                          <TableHead>Details</TableHead>
                          {type === "video_spotlight" && (
                            <TableHead>Source</TableHead>
                          )}
                          {type === "banner_ad" && <TableHead>Image</TableHead>}
                          <TableHead>Bid</TableHead>
                          <TableHead>Daily Budget</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pending.map((c, i) => (
                          <TableRow
                            key={c.id}
                            data-ocid={`admin.approvals.${type}.row.${i + 1}`}
                          >
                            <TableCell>
                              <div>
                                <p className="font-semibold text-sm">
                                  {c.sellerName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {c.sellerEmail}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {c.productName ||
                                c.bannerTitle ||
                                c.videoTitle ||
                                "—"}
                            </TableCell>

                            {/* Video source type column */}
                            {type === "video_spotlight" && (
                              <TableCell>
                                {c.videoSourceType === "upload" ? (
                                  <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                    <Upload className="w-3 h-3" /> Upload
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                    <ExternalLink className="w-3 h-3" /> Link
                                  </span>
                                )}
                                {(c.videoUrl || c.videoUploadUrl) && (
                                  <a
                                    href={c.videoUrl || c.videoUploadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-xs text-blue-500 hover:underline mt-0.5 max-w-[120px] truncate"
                                  >
                                    Preview ↗
                                  </a>
                                )}
                              </TableCell>
                            )}

                            {/* Banner image preview column */}
                            {type === "banner_ad" && (
                              <TableCell>
                                {c.bannerImageUrl ? (
                                  <img
                                    src={c.bannerImageUrl}
                                    alt="banner"
                                    className="h-8 w-20 object-cover rounded border border-gray-200"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    No image
                                  </span>
                                )}
                              </TableCell>
                            )}

                            <TableCell className="font-semibold text-sm">
                              ₹{c.maxBidCpc}/click
                            </TableCell>
                            <TableCell className="text-sm">
                              ₹{c.dailyBudget}/day
                            </TableCell>
                            <TableCell>
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                                {c.targeting}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="text-xs text-white gap-1 h-7"
                                  style={{ backgroundColor: "#10B981" }}
                                  onClick={() => {
                                    approveCampaign(c.id);
                                    toast.success(
                                      `Campaign approved for ${c.sellerName}`,
                                    );
                                  }}
                                  data-ocid={`admin.approvals.approve.button.${i + 1}`}
                                >
                                  <CheckCircle className="w-3 h-3" /> Approve
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="text-xs text-red-600 border-red-200 h-7"
                                  onClick={() => {
                                    setRejectId(c.id);
                                    setRejectReason("");
                                  }}
                                  data-ocid={`admin.approvals.reject.button.${i + 1}`}
                                >
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab 5: Placement Controls ──────────────────────────── */}
      {tab === "placement" && (
        <div className="space-y-6 max-w-xl">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
              <Layers className="w-4 h-4" /> Placement controls set how
              frequently Sponsored results appear.
            </p>
          </div>
          {(
            [
              {
                key: "searchAdPercent" as const,
                label: "Search Page Ad Density",
                max: 50,
                hint: (v: number) =>
                  v > 0
                    ? `Every ${Math.round(100 / v)}th search result will be Sponsored`
                    : "Sponsored products disabled on Search",
              },
              {
                key: "homeAdPercent" as const,
                label: "Homepage Ad Density",
                max: 30,
                hint: (v: number) =>
                  v > 0
                    ? `~${v}% of homepage product grid will show Sponsored items`
                    : "Sponsored products disabled on Homepage",
              },
              {
                key: "accountAdPercent" as const,
                label: "Account Page Ad Density",
                max: 20,
                hint: (v: number) =>
                  v > 0
                    ? `Up to ${Math.round((v / 100) * 10)} ad banners in Customer Dashboard`
                    : "Account page ads disabled",
              },
            ] as const
          ).map(({ key, label, max, hint }) => (
            <div
              key={key}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-gray-800">{label}</Label>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#006AFF" }}
                >
                  {placementConfig[key]}%
                </span>
              </div>
              <Slider
                min={0}
                max={max}
                step={5}
                value={[placementConfig[key]]}
                onValueChange={([v]) => updatePlacementConfig({ [key]: v })}
                className="[&_[role=slider]]:border-[#006AFF] [&_.range]:bg-[#006AFF]"
                data-ocid={`admin.placement.${key}.slider`}
              />
              <p className="text-xs text-gray-400">
                {hint(placementConfig[key])}
              </p>
            </div>
          ))}
          <Button
            type="button"
            className="text-white w-full"
            style={{ backgroundColor: "#006AFF" }}
            onClick={() => toast.success("Placement settings saved!")}
            data-ocid="admin.placement.save.button"
          >
            Save Placement Settings
          </Button>
        </div>
      )}

      {/* ── Tab 6: Revenue ────────────────────────────────────────── */}
      {tab === "revenue" && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Ad Revenue",
                value: totalAdRevenue,
                icon: TrendingUp,
                color: "#006AFF",
              },
              {
                label: "Seller Campaigns",
                value: sellerAdRevenue,
                icon: Megaphone,
                color: "#10B981",
              },
              {
                label: "Brand Partners",
                value: brandRevenue,
                icon: Users,
                color: "#EC008C",
              },
              {
                label: "Active Campaigns",
                value: sellerCampaigns.filter((c) => c.status === "active")
                  .length,
                icon: Layers,
                color: "#F59E0B",
                isCount: true,
              },
            ].map(({ label, value, icon: Icon, color, isCount }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {isCount
                      ? value
                      : `₹${Number(value).toLocaleString("en-IN")}`}
                  </p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Monthly Revenue Breakdown
            </h3>
            <RevenueChart />
          </div>

          {/* Detailed transaction ledger */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Ad Transaction Ledger
              </h3>
              <span className="text-xs text-gray-400">
                {allTransactions.length} entries
              </span>
            </div>
            {allTransactions.length === 0 ? (
              <div
                className="p-12 text-center"
                data-ocid="admin.revenue.ledger.empty_state"
              >
                <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No ad transactions yet.</p>
                <p className="text-gray-400 text-xs mt-1">
                  Transactions appear once sellers top up their Ad Wallets.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allTransactions.map((tx, i) => (
                      <TableRow
                        key={tx.id}
                        data-ocid={`admin.revenue.ledger.row.${i + 1}`}
                      >
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(tx.timestamp).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-gray-700">
                          {tx.sellerEmail}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              tx.type === "credit"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {tx.type === "credit" ? (
                              <ArrowUpCircle className="w-3 h-3" />
                            ) : (
                              <ArrowDownCircle className="w-3 h-3" />
                            )}
                            {tx.type === "credit" ? "Recharge" : "Ad Spend"}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`font-bold text-sm ${
                            tx.type === "credit"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {tx.type === "credit" ? "+" : "-"}₹
                          {tx.amount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {tx.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab 7: Escrow ───────────────────────────────────────────── */}
      {tab === "escrow" && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#f0f6ff" }}
            >
              <Wallet className="w-6 h-6" style={{ color: "#006AFF" }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Escrow Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹
                {getTotalEscrow().toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          {wallets.length === 0 ? (
            <div
              className="bg-white rounded-2xl border border-gray-100 p-14 text-center"
              data-ocid="admin.escrow.empty_state"
            >
              <Wallet className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No seller ad wallets yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller Email</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((w, i) => (
                    <TableRow
                      key={w.sellerEmail}
                      data-ocid={`admin.escrow.row.${i + 1}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {w.sellerEmail}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        ₹
                        {w.balance.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-red-500 font-medium">
                        ₹
                        {w.totalSpent.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {w.transactions.length}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="text-xs text-white h-7 gap-1"
                            style={{ backgroundColor: "#10B981" }}
                            onClick={() => {
                              setEscrowAction({ wallet: w, mode: "credit" });
                              setEscrowAmount("");
                              setEscrowReason("");
                            }}
                            data-ocid={`admin.escrow.credit.button.${i + 1}`}
                          >
                            <CreditCard className="w-3 h-3" /> Credit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-600 border-red-200 h-7"
                            onClick={() => {
                              setEscrowAction({ wallet: w, mode: "debit" });
                              setEscrowAmount("");
                              setEscrowReason("");
                            }}
                            data-ocid={`admin.escrow.debit.button.${i + 1}`}
                          >
                            Debit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ─── Reject reason dialog ──────────────────────────────────── */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent data-ocid="admin.approvals.reject.dialog">
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              data-ocid="admin.approvals.reject_reason.textarea"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setRejectId(null)}
                data-ocid="admin.approvals.reject.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 text-white"
                style={{ backgroundColor: "#EF4444" }}
                onClick={() => {
                  if (rejectId) {
                    rejectCampaign(rejectId, rejectReason);
                    toast.success("Campaign rejected.");
                    setRejectId(null);
                  }
                }}
                data-ocid="admin.approvals.reject.confirm_button"
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Escrow action dialog ──────────────────────────────────── */}
      <Dialog open={!!escrowAction} onOpenChange={() => setEscrowAction(null)}>
        <DialogContent data-ocid="admin.escrow.action.dialog">
          <DialogHeader>
            <DialogTitle>
              {escrowAction?.mode === "credit" ? "Credit" : "Debit"} Ad Wallet
              {escrowAction && ` — ${escrowAction.wallet.sellerEmail}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                min={1}
                placeholder="Enter amount"
                value={escrowAmount}
                onChange={(e) => setEscrowAmount(e.target.value)}
                data-ocid="admin.escrow.amount.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea
                placeholder="Reason for adjustment..."
                value={escrowReason}
                onChange={(e) => setEscrowReason(e.target.value)}
                rows={2}
                data-ocid="admin.escrow.reason.textarea"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEscrowAction(null)}
                data-ocid="admin.escrow.cancel.button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 text-white"
                style={{
                  backgroundColor:
                    escrowAction?.mode === "credit" ? "#10B981" : "#EF4444",
                }}
                onClick={() => {
                  const amt = Number.parseFloat(escrowAmount);
                  if (!amt || amt <= 0) {
                    toast.error("Enter a valid amount");
                    return;
                  }
                  if (!escrowAction) return;
                  if (escrowAction.mode === "credit") {
                    adminCredit(
                      escrowAction.wallet.sellerEmail,
                      amt,
                      escrowReason,
                    );
                    toast.success(
                      `₹${amt} credited to ${escrowAction.wallet.sellerEmail}`,
                    );
                  } else {
                    adminDebit(
                      escrowAction.wallet.sellerEmail,
                      amt,
                      escrowReason,
                    );
                    toast.success(
                      `₹${amt} debited from ${escrowAction.wallet.sellerEmail}`,
                    );
                  }
                  setEscrowAction(null);
                }}
                data-ocid="admin.escrow.confirm.button"
              >
                Confirm {escrowAction?.mode === "credit" ? "Credit" : "Debit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead detail dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-md" data-ocid="admin.lead.dialog">
          <DialogHeader>
            <DialogTitle>Lead — {selectedLead?.brandName}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-3 text-sm">
              {(
                [
                  ["Brand", selectedLead.brandName],
                  ["Website", selectedLead.website || "—"],
                  ["Contact", selectedLead.contactName],
                  ["Email", selectedLead.email],
                  ["Phone", selectedLead.phone || "—"],
                  ["Budget", selectedLead.budget || "—"],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-gray-400 w-20 flex-shrink-0">
                    {label}
                  </span>
                  <span className="font-medium text-gray-800 break-all">
                    {value}
                  </span>
                </div>
              ))}
              {selectedLead.message && (
                <div className="mt-2 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Message</p>
                  <p className="text-sm text-gray-700">
                    {selectedLead.message}
                  </p>
                </div>
              )}
              <Button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="w-full text-white mt-2"
                style={{ backgroundColor: "#006AFF" }}
                data-ocid="admin.lead.close.button"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
