import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Inbox,
  Megaphone,
  Pause,
  Play,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

const MOCK_CAMPAIGNS: Campaign[] = [
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

type SubTab = "leads" | "campaigns" | "pricing";

export default function AdminAdsManager() {
  const [subTab, setSubTab] = useState<SubTab>("leads");
  const [leads, setLeads] = useState<BrandLead[]>(() => {
    return JSON.parse(localStorage.getItem("brandLeads") || "[]");
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [slots, setSlots] = useState<SlotPricing[]>(() => {
    const saved = localStorage.getItem("adSlotPricing");
    return saved ? JSON.parse(saved) : DEFAULT_SLOTS;
  });
  const [selectedLead, setSelectedLead] = useState<BrandLead | null>(null);

  const markContacted = (id: string) => {
    const updated = leads.map((l) =>
      l.id === id ? { ...l, status: "contacted" as LeadStatus } : l,
    );
    setLeads(updated);
    localStorage.setItem("brandLeads", JSON.stringify(updated));
    toast.success("Lead marked as contacted.");
  };

  const toggleCampaign = (id: number) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c,
      ),
    );
  };

  const endCampaign = (id: number) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast.success("Campaign ended.");
  };

  const savePricing = () => {
    localStorage.setItem("adSlotPricing", JSON.stringify(slots));
    toast.success("Slot pricing saved successfully!");
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

  const leadStatusColor: Record<LeadStatus, string> = {
    new: "bg-yellow-100 text-yellow-800",
    contacted: "bg-blue-100 text-blue-700",
    converted: "bg-green-100 text-green-700",
  };

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const converted = leads.filter((l) => l.status === "converted").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5" style={{ color: "#006AFF" }} />
          Ads Manager
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage brand partnerships, campaigns, and ad slot pricing.
        </p>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["leads", "campaigns", "pricing"] as SubTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            data-ocid={`admin.ads.${tab}.tab`}
          >
            {tab === "leads"
              ? "Brand Leads"
              : tab === "campaigns"
                ? "Active Campaigns"
                : "Slot Pricing"}
          </button>
        ))}
      </div>

      {/* Brand Leads */}
      {subTab === "leads" && (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Leads",
                value: totalLeads,
                icon: Users,
                color: "#006AFF",
              },
              {
                label: "New Leads",
                value: newLeads,
                icon: Inbox,
                color: "#F59E0B",
              },
              {
                label: "Converted",
                value: converted,
                icon: TrendingUp,
                color: "#10B981",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}15` }}
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
                    <TableHead>Phone</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Submitted</TableHead>
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
                      <TableCell className="text-sm text-gray-600">
                        {lead.contactName}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {lead.email}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {lead.phone || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {lead.budget || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(lead.submittedAt).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short" },
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${leadStatusColor[lead.status]}`}
                        >
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {lead.status === "new" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => markContacted(lead.id)}
                              className="text-xs"
                              data-ocid={`admin.leads.contacted.button.${i + 1}`}
                            >
                              Mark Contacted
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedLead(lead)}
                            className="text-xs"
                            data-ocid={`admin.leads.view.button.${i + 1}`}
                          >
                            View Details
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

      {/* Active Campaigns */}
      {subTab === "campaigns" && (
        <div className="space-y-5">
          {campaigns.length === 0 ? (
            <div
              className="bg-white rounded-2xl border border-gray-100 p-16 text-center"
              data-ocid="admin.campaigns.empty_state"
            >
              <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No active campaigns yet
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Approve brand applications to create campaigns.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Ad Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Budget (₹)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c, i) => (
                    <TableRow
                      key={c.id}
                      data-ocid={`admin.campaigns.row.${i + 1}`}
                    >
                      <TableCell className="font-semibold text-gray-800">
                        {c.brand}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {c.slot}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            c.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {c.startDate}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {c.endDate}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-700">
                        {c.impressions.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-700">
                        ₹{c.budget.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => toggleCampaign(c.id)}
                            className="text-xs flex items-center gap-1"
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
                            onClick={() => endCampaign(c.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"
                            data-ocid={`admin.campaigns.end.button.${i + 1}`}
                          >
                            <XCircle className="w-3 h-3" /> End
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

      {/* Slot Pricing */}
      {subTab === "pricing" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Set floor prices for each ad placement. These apply to all brand
              campaigns.
            </p>
            <Button
              type="button"
              onClick={savePricing}
              className="text-white flex items-center gap-2"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="admin.pricing.save.button"
            >
              <DollarSign className="w-4 h-4" /> Save All Pricing
            </Button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot Name</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Floor CPM (₹)</TableHead>
                  <TableHead>Floor CPC (₹)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot, i) => (
                  <TableRow
                    key={slot.name}
                    data-ocid={`admin.pricing.row.${i + 1}`}
                  >
                    <TableCell className="font-semibold text-gray-800">
                      {slot.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {slot.placement}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
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

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-md" data-ocid="admin.lead.dialog">
          <DialogHeader>
            <DialogTitle>Lead Details — {selectedLead?.brandName}</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-3 text-sm">
              {[
                ["Brand", selectedLead.brandName],
                ["Website", selectedLead.website || "—"],
                ["Contact", selectedLead.contactName],
                ["Email", selectedLead.email],
                ["Phone", selectedLead.phone || "—"],
                ["Budget", selectedLead.budget || "—"],
                [
                  "Submitted",
                  new Date(selectedLead.submittedAt).toLocaleString("en-IN"),
                ],
              ].map(([label, value]) => (
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
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">
                    Campaign Goals / Message
                  </p>
                  <p className="text-sm text-gray-700">
                    {selectedLead.message}
                  </p>
                </div>
              )}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setSelectedLead(null);
                  }}
                  className="w-full text-white"
                  style={{ backgroundColor: "#006AFF" }}
                  data-ocid="admin.lead.close.button"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
