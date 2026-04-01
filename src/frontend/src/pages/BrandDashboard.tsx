import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart2,
  Building2,
  ChevronRight,
  Eye,
  FileImage,
  Home,
  LogOut,
  Megaphone,
  Monitor,
  Package,
  Plus,
  Settings,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  brandId: string;
  onBack: () => void;
}

type BrandAccount = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  website: string;
  industry: string;
  budget: string;
  status: "pending" | "active" | "suspended";
  registeredAt: string;
  campaigns: object[];
};

type Tab = "overview" | "campaigns" | "upload" | "settings";

const NAV_ITEMS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "campaigns", label: "My Campaigns", icon: Megaphone },
  { id: "upload", label: "Upload Creative", icon: Upload },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const SLOT_SPECS = [
  {
    slot: "Homepage Hero Banner",
    dims: "1200×200 px",
    format: "JPG, PNG, GIF",
  },
  { slot: "Search Sidebar", dims: "300×600 px", format: "JPG, PNG" },
  { slot: "Category Top Banner", dims: "970×90 px", format: "JPG, PNG, GIF" },
  { slot: "Cart Page Promo", dims: "600×100 px", format: "JPG, PNG" },
  {
    slot: "Product Detail Sidebar",
    dims: "300×250 px",
    format: "JPG, PNG, GIF",
  },
  { slot: "Mobile App Banner", dims: "360×80 px", format: "JPG, PNG" },
];

export default function BrandDashboard({ brandId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [dragOver, setDragOver] = useState(false);

  const accounts: BrandAccount[] = JSON.parse(
    localStorage.getItem("brandAccounts") || "[]",
  );
  const brand = accounts.find((a) => a.id === brandId);

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Brand account not found.</p>
          <Button type="button" onClick={onBack}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      label: "Pending Review",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    active: {
      label: "Active",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    suspended: {
      label: "Suspended",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
  };
  const st = statusConfig[brand.status];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm fixed h-full z-10">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="text-lg font-bold mb-1">
            <span style={{ color: "#006AFF" }}>AFL</span>
            <span style={{ color: "#EC008C" }}>INO</span>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Brand Partner Portal
          </p>
        </div>

        <div className="px-4 py-4 border-b border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {brand.companyName}
            </p>
            <p className="text-xs text-gray-400 truncate">{brand.email}</p>
            <span
              className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${st.className}`}
            >
              {st.label}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              data-ocid={`brand.${id}.tab`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-gray-100 pt-3 space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            data-ocid="brand.back_to_aflino.button"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AFLINO
          </button>
          <button
            type="button"
            onClick={() => {
              onBack();
              toast.success("Logged out of Brand Portal.");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
            data-ocid="brand.logout.button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 md:p-8">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Status Banner */}
            {brand.status === "pending" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Eye className="w-4 h-4 text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-yellow-800">
                    Your account is under review
                  </p>
                  <p className="text-xs text-yellow-600 mt-0.5">
                    Our team will verify your brand details within 1–2 business
                    days. You'll receive an email once approved.
                  </p>
                </div>
              </div>
            )}
            {brand.status === "active" && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="w-4 h-4 text-green-700" />
                </div>
                <p className="text-sm font-semibold text-green-800">
                  Your account is active! Start creating campaigns.
                </p>
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {brand.companyName}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Brand Partner Dashboard
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  label: "Active Campaigns",
                  value: brand.campaigns.length,
                  icon: Megaphone,
                  color: "#006AFF",
                },
                {
                  label: "Total Impressions",
                  value: "0",
                  icon: Monitor,
                  color: "#EC008C",
                },
                {
                  label: "Budget Used",
                  value: "₹0",
                  icon: Package,
                  color: "#00AA55",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <span className="text-sm text-gray-500">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => setActiveTab("campaigns")}
                  className="text-white flex items-center gap-2"
                  style={{ backgroundColor: "#006AFF" }}
                  data-ocid="brand.create_campaign.button"
                >
                  <Plus className="w-4 h-4" /> Create New Campaign
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-ocid="brand.upload_banner.button"
                >
                  <Upload className="w-4 h-4" /> Upload Banner Asset
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Campaigns
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage your advertising campaigns
                </p>
              </div>
              <Button
                type="button"
                className="text-white flex items-center gap-2"
                style={{ backgroundColor: "#006AFF" }}
                data-ocid="brand.campaigns.create.button"
              >
                <Plus className="w-4 h-4" /> Create Campaign
              </Button>
            </div>

            {brand.campaigns.length === 0 ? (
              <div
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center"
                data-ocid="brand.campaigns.empty_state"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#EBF3FF" }}
                >
                  <Megaphone className="w-8 h-8" style={{ color: "#006AFF" }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No campaigns yet
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Create your first campaign to get started.
                </p>
                <Button
                  type="button"
                  className="text-white"
                  style={{ backgroundColor: "#006AFF" }}
                  data-ocid="brand.campaigns.create_first.button"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Campaign
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-sm text-gray-500">
                  Your campaigns will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload Creative */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Upload Creative
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Upload banner assets for review. All creatives are set to Draft
                until Admin approves.
              </p>
            </div>

            <div
              className={`bg-white rounded-2xl border-2 border-dashed p-16 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                toast.success(
                  "File received — status: Draft. Awaiting Admin Approval.",
                );
              }}
              data-ocid="brand.upload.dropzone"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#EBF3FF" }}
              >
                <FileImage className="w-8 h-8" style={{ color: "#006AFF" }} />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Drag & Drop your banner here
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Accepted formats: JPG, PNG, GIF
              </p>
              <label
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#006AFF" }}
              >
                <Upload className="w-4 h-4" />
                Browse Files
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={() =>
                    toast.success(
                      "File received — Status: Draft — Awaiting Admin Approval.",
                    )
                  }
                  data-ocid="brand.upload.upload_button"
                />
              </label>
              <p className="text-xs text-yellow-600 mt-4 bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-2 inline-block">
                Status: <strong>Draft</strong> — Awaiting Admin Approval
              </p>
            </div>

            {/* Dimension Guidelines */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ChevronRight
                  className="w-4 h-4"
                  style={{ color: "#006AFF" }}
                />
                Creative Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SLOT_SPECS.map(({ slot, dims, format }) => (
                  <div key={slot} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-800">
                      {slot}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      {dims}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{format}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Account Settings
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Your brand profile details
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                data-ocid="brand.settings.edit_button"
              >
                <Settings className="w-4 h-4" /> Edit Profile
              </Button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              {[
                { label: "Company / Brand Name", value: brand.companyName },
                { label: "Contact Person", value: brand.contactName },
                { label: "Official Email", value: brand.email },
                { label: "Website", value: brand.website || "—" },
                { label: "Industry", value: brand.industry || "—" },
                { label: "Monthly Ad Budget", value: brand.budget || "—" },
                {
                  label: "Registered At",
                  value: new Date(brand.registeredAt).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" },
                  ),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <span className="text-sm text-gray-400 w-40 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {value}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 py-3">
                <span className="text-sm text-gray-400 w-40 flex-shrink-0">
                  Account Status
                </span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${st.className}`}
                >
                  {st.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
