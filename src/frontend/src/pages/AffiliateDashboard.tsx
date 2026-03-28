import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type AffiliateCommission,
  useAffiliate,
} from "@/context/AffiliateContext";
import { useProducts } from "@/context/ProductContext";
import { useRole } from "@/context/RoleContext";
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  EyeOff,
  Link2,
  LogOut,
  Send,
  TrendingUp,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  onRegisterClick: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    withdrawable: "bg-green-100 text-green-700",
    paid: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function CommissionRow({ c }: { c: AffiliateCommission }) {
  const days = daysUntil(c.releasesAt);
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="py-3 px-4 text-sm text-gray-600">
        {new Date(c.orderDate).toLocaleDateString("en-IN")}
      </td>
      <td className="py-3 px-4 text-sm font-medium text-gray-800">
        {c.orderId}
      </td>
      <td className="py-3 px-4 text-sm text-gray-700">{c.productName}</td>
      <td className="py-3 px-4 text-sm text-gray-700">
        ₹{c.saleAmount.toLocaleString()}
      </td>
      <td
        className="py-3 px-4 text-sm font-semibold"
        style={{ color: "#006AFF" }}
      >
        ₹{c.commissionAmount}
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={c.status} />
        {c.status === "pending" && days > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">Releases in {days}d</p>
        )}
      </td>
    </tr>
  );
}

export default function AffiliateDashboard({ onBack, onRegisterClick }: Props) {
  const { logout } = useRole();
  const {
    affiliates,
    commissions,
    videos,
    addVideo,
    autoTransitionCommissions,
  } = useAffiliate();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState("overview");
  const [showApiKey, setShowApiKey] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  // Find affiliate by email (simulate logged-in user)
  const userEmail = "rohit@example.com"; // In real app, from auth context
  const affiliate = affiliates.find((a) => a.email === userEmail);

  useEffect(() => {
    autoTransitionCommissions();
  }, [autoTransitionCommissions]);

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div
          className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm"
          data-ocid="affiliate.not_registered.panel"
        >
          <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Not Registered
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            You are not registered as an AFLINO Affiliate yet.
          </p>
          <Button
            className="w-full rounded-full text-white"
            style={{ backgroundColor: "#006AFF" }}
            onClick={onRegisterClick}
            data-ocid="affiliate.register.button"
          >
            Register as Affiliate
          </Button>
        </div>
      </div>
    );
  }

  if (affiliate.status === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div
          className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md"
          data-ocid="affiliate.under_review.panel"
        >
          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Application Under Review
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Our team is reviewing your KYC documents. Estimated time: 24–48
            hours.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <p className="text-xs text-gray-400 font-semibold uppercase">
              Submitted Details
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="text-gray-400">Name:</span> {affiliate.name}
              </p>
              <p>
                <span className="text-gray-400">Email:</span> {affiliate.email}
              </p>
              <p>
                <span className="text-gray-400">ID Type:</span>{" "}
                {affiliate.idProof.type.toUpperCase()}
              </p>
              <p>
                <span className="text-gray-400">Joined:</span>{" "}
                {new Date(affiliate.joinedAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 text-sm text-gray-400 hover:text-gray-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (affiliate.status === "rejected") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div
          className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md"
          data-ocid="affiliate.rejected.panel"
        >
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Application Rejected
          </h2>
          {affiliate.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-red-700">
                {affiliate.rejectionReason}
              </p>
            </div>
          )}
          <Button
            className="w-full rounded-full text-white mb-2"
            style={{ backgroundColor: "#006AFF" }}
            onClick={onRegisterClick}
            data-ocid="affiliate.reapply.button"
          >
            Re-Apply
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Approved dashboard
  const myCommissions = commissions.filter(
    (c) => c.affiliateId === affiliate.id,
  );
  const totalEarned = myCommissions
    .filter((c) => c.status !== "pending")
    .reduce((s, c) => s + c.commissionAmount, 0);
  const pendingSum = myCommissions
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + c.commissionAmount, 0);
  const withdrawableSum = myCommissions
    .filter((c) => c.status === "withdrawable")
    .reduce((s, c) => s + c.commissionAmount, 0);
  const myVideos = videos.filter((v) => v.affiliateId === affiliate.id);
  const referralUrl = `https://aflino.com/?ref=${affiliate.referralCode}`;
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const productAffUrl = selectedProduct
    ? `https://aflino.com/product/${selectedProduct.id}?ref=${affiliate.referralCode}`
    : "";
  const apiKey = `aflino_api_${affiliate.id}_key`;

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "links", label: "My Links", icon: Link2 },
    { id: "commissions", label: "Commissions", icon: DollarSign },
    ...(affiliate.apiEnabled
      ? [{ id: "developer", label: "Developer", icon: Code2 }]
      : []),
  ];

  function handleVideoSubmit() {
    if (!videoTitle || !videoUrl) {
      toast.error("Please enter title and URL");
      return;
    }
    const platform: "youtube" | "instagram" = videoUrl.includes("instagram")
      ? "instagram"
      : "youtube";
    if (!affiliate) return;
    addVideo(affiliate.id, videoUrl, videoTitle, platform);
    setVideoTitle("");
    setVideoUrl("");
    toast.success("Video submitted for review!");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold">
            <span style={{ color: "#006AFF" }}>AFL</span>
            <span style={{ color: "#EC008C" }}>INO</span>
            <span
              className="ml-2 text-xs font-normal text-gray-400 bg-blue-50 px-2 py-0.5 rounded-full"
              style={{ color: "#006AFF" }}
            >
              Affiliate
            </span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {affiliate.name}
            </span>
            <Badge className="bg-purple-100 text-purple-700 capitalize">
              {affiliate.tier}
            </Badge>
            <button
              type="button"
              onClick={() => {
                logout();
                onBack();
              }}
              className="text-gray-400 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              data-ocid={`affiliate.${tab.id}.tab`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6" data-ocid="affiliate.overview.panel">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Earned",
                  value: `₹${totalEarned}`,
                  color: "#006AFF",
                  icon: TrendingUp,
                },
                {
                  label: "Pending",
                  value: `₹${pendingSum}`,
                  color: "#F59E0B",
                  icon: Clock,
                },
                {
                  label: "Withdrawable",
                  value: `₹${withdrawableSum}`,
                  color: "#10B981",
                  icon: CheckCircle2,
                },
                {
                  label: "Links Clicked",
                  value: "1,247",
                  color: "#EC008C",
                  icon: BarChart2,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <stat.icon
                      className="w-4 h-4"
                      style={{ color: stat.color }}
                    />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Your Referral Code
                </h3>
                <div className="bg-blue-50 rounded-xl p-4 text-center mb-3">
                  <p
                    className="text-2xl font-bold tracking-widest"
                    style={{ color: "#006AFF" }}
                  >
                    {affiliate.referralCode}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  Share Link
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={referralUrl}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(referralUrl);
                      toast.success("Link copied!");
                    }}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    data-ocid="affiliate.copy_referral.button"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Shop on AFLINO and save! Use my link: ${referralUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1"
                    style={{ backgroundColor: "#25D366" }}
                    data-ocid="affiliate.whatsapp_share.button"
                  >
                    <Send className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Recent Commissions
                </h3>
                {myCommissions.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No commissions yet. Share your link to start earning!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myCommissions.slice(0, 5).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between py-2 border-b border-gray-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {c.productName}
                          </p>
                          <p className="text-xs text-gray-400">{c.orderId}</p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#006AFF" }}
                          >
                            ₹{c.commissionAmount}
                          </p>
                          <StatusBadge status={c.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Links */}
        {activeTab === "links" && (
          <div className="space-y-6" data-ocid="affiliate.links.panel">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                Generate Product Link
              </h3>
              <p className="text-sm text-gray-600 mb-2">Select a Product</p>
              <select
                value={selectedProductId ?? ""}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                data-ocid="affiliate.product.select"
              >
                <option value="">Choose a product...</option>
                {products.slice(0, 20).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              {productAffUrl && (
                <div className="mt-3 flex gap-2">
                  <input
                    readOnly
                    value={productAffUrl}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(productAffUrl);
                      toast.success("Link copied!");
                    }}
                    className="p-2 rounded-lg border border-gray-200"
                    data-ocid="affiliate.copy_product_link.button"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                Submit a Video
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Video Title</p>
                  <input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Best Electronics on AFLINO 2025"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    data-ocid="affiliate.video_title.input"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    YouTube or Instagram URL
                  </p>
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    data-ocid="affiliate.video_url.input"
                  />
                </div>
                <Button
                  className="w-full rounded-full text-white"
                  style={{ backgroundColor: "#006AFF" }}
                  onClick={handleVideoSubmit}
                  data-ocid="affiliate.submit_video.button"
                >
                  <Video className="w-4 h-4 mr-2" /> Submit for Review
                </Button>
              </div>
            </div>

            {myVideos.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50">
                  <h3 className="font-semibold text-gray-900">
                    My Submitted Videos
                  </h3>
                </div>
                <table className="w-full" data-ocid="affiliate.videos.table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Title
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Platform
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myVideos.map((v, i) => (
                      <tr
                        key={v.id}
                        className="border-t border-gray-50"
                        data-ocid={`affiliate.videos.item.${i + 1}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {v.title}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              v.platform === "youtube"
                                ? "bg-red-100 text-red-700"
                                : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {v.platform}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={v.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Commissions */}
        {activeTab === "commissions" && (
          <div className="space-y-6" data-ocid="affiliate.commissions.panel">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Pending", value: pendingSum, color: "#F59E0B" },
                {
                  label: "Withdrawable",
                  value: withdrawableSum,
                  color: "#10B981",
                },
                {
                  label: "Paid",
                  value: myCommissions
                    .filter((c) => c.status === "paid")
                    .reduce((s, c) => s + c.commissionAmount, 0),
                  color: "#6B7280",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-xl p-4 shadow-sm text-center"
                >
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className="text-xl font-bold" style={{ color: s.color }}>
                    ₹{s.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table
                  className="w-full"
                  data-ocid="affiliate.commissions.table"
                >
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Date
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Order ID
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Product
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Sale
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Commission
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCommissions.map((c, i) => (
                      <tr
                        key={c.id}
                        data-ocid={`affiliate.commissions.item.${i + 1}`}
                      >
                        <CommissionRow c={c} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Developer */}
        {activeTab === "developer" && affiliate.apiEnabled && (
          <div className="space-y-6" data-ocid="affiliate.developer.panel">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Your API Key</h3>
              <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3">
                <code className="flex-1 text-sm font-mono text-green-400">
                  {showApiKey ? apiKey : "•".repeat(apiKey.length)}
                </code>
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="text-gray-400 hover:text-white"
                  data-ocid="affiliate.toggle_api_key.button"
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    toast.success("API key copied!");
                  }}
                  className="text-gray-400 hover:text-white"
                  data-ocid="affiliate.copy_api_key.button"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Product Catalog API
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Fetch the AFLINO product catalog in JSON format to build your
                own storefront.
              </p>
              <div className="bg-gray-900 rounded-xl p-4 text-sm font-mono overflow-x-auto">
                <p className="text-blue-400">
                  GET https://aflino.com/api/products?key=YOUR_API_KEY
                </p>
                <p className="text-gray-500 mt-2">Response:</p>
                <pre className="text-green-400 text-xs mt-1">
                  {JSON.stringify(
                    [
                      {
                        id: 1,
                        name: "Product Name",
                        price: 999,
                        discountedPrice: 799,
                        image: "/img.jpg",
                        link: "https://aflino.com/product/1",
                      },
                    ],
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Live Product Preview
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                First 6 products from the AFLINO catalog:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow"
                  >
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-24 object-cover rounded-lg mb-2"
                      />
                    )}
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                      {p.title}
                    </p>
                    <p className="text-xs text-gray-400">{p.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {p.discountedPrice && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: "#006AFF" }}
                        >
                          ₹{p.discountedPrice}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 line-through">
                        ₹{p.price}
                      </span>
                    </div>
                    <a
                      href={`https://aflino.com/product/${p.id}?ref=${affiliate.referralCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 flex items-center gap-1 text-xs"
                      style={{ color: "#006AFF" }}
                    >
                      <ExternalLink className="w-3 h-3" /> Affiliate Link
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Embed Widget</h3>
              <p className="text-sm text-gray-500 mb-3">
                Embed AFLINO products on your website:
              </p>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
                {`<iframe src="https://aflino.com/widget?ref=${affiliate.referralCode}" width="100%" height="400" frameborder="0"></iframe>`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
