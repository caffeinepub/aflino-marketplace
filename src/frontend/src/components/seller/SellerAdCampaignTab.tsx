import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import type {
  AdCampaign,
  AdTarget,
  AdType,
  VideoSourceType,
} from "@/context/AdCampaignContext";
import { useAdCampaign } from "@/context/AdCampaignContext";
import { useAdWallet } from "@/context/AdWalletContext";
import { useProducts } from "@/context/ProductContext";
import {
  AlertTriangle,
  BarChart3,
  ChevronRight,
  Clapperboard,
  Image,
  Link,
  Megaphone,
  MousePointerClick,
  Plus,
  Target,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  sellerEmail: string;
  sellerName: string;
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "Pending Review" },
  approved: { bg: "#D1FAE5", text: "#065F46", label: "Approved" },
  active: { bg: "#D1FAE5", text: "#065F46", label: "Active" },
  rejected: { bg: "#FEE2E2", text: "#991B1B", label: "Rejected" },
  paused: { bg: "#F3F4F6", text: "#374151", label: "Paused" },
  exhausted: { bg: "#FFF7ED", text: "#9A3412", label: "Budget Exhausted" },
};

const AD_TYPES: {
  type: AdType;
  label: string;
  desc: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
}[] = [
  {
    type: "product_boost",
    label: "Product Boost",
    desc: "Appear as Sponsored in search results",
    icon: TrendingUp,
  },
  {
    type: "banner_ad",
    label: "Banner Ad",
    desc: "Display banner on Homepage / Category pages",
    icon: Image,
  },
  {
    type: "video_spotlight",
    label: "Video Spotlight",
    desc: "YouTube/Instagram embed or uploaded video in Watch & Shop",
    icon: Clapperboard,
  },
];

const TARGET_OPTIONS: { value: AdTarget; label: string; desc: string }[] = [
  { value: "search", label: "Search Only", desc: "Appears in search results" },
  { value: "home", label: "Home Only", desc: "Appears on homepage" },
  { value: "all", label: "All Platforms", desc: "Search + Home (max reach)" },
];

function CampaignCard({
  campaign,
  onPause,
  onResume,
}: {
  campaign: AdCampaign;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  const style = STATUS_STYLES[campaign.status] ?? STATUS_STYLES.paused;
  const pct =
    campaign.dailyBudget > 0
      ? Math.min(100, (campaign.todaySpent / campaign.dailyBudget) * 100)
      : 0;
  const ctr =
    campaign.impressions > 0
      ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1)
      : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
      data-ocid="seller.ad_campaign.card"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
            {campaign.adType === "product_boost"
              ? campaign.productName
              : campaign.adType === "banner_ad"
                ? campaign.bannerTitle
                : campaign.videoTitle || "Video Spotlight"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">
            {campaign.adType.replace("_", " ")} ·{" "}
            {campaign.targeting === "all"
              ? "All Platforms"
              : campaign.targeting}
            {campaign.adType === "video_spotlight" &&
              campaign.videoSourceType && (
                <span className="ml-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full uppercase">
                  {campaign.videoSourceType}
                </span>
              )}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {style.label}
        </span>
      </div>

      {/* Daily budget progress */}
      {campaign.status === "active" && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Today: ₹{campaign.todaySpent.toFixed(0)}</span>
            <span>Limit: ₹{campaign.dailyBudget}</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { icon: MousePointerClick, label: "Clicks", value: campaign.clicks },
          { icon: Target, label: "Impressions", value: campaign.impressions },
          { icon: BarChart3, label: "CTR", value: `${ctr}%` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center bg-gray-50 rounded-lg p-2">
            <Icon className="w-3.5 h-3.5 text-gray-400 mx-auto mb-0.5" />
            <p className="text-sm font-bold text-gray-800">{value}</p>
            <p className="text-[10px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Bid: ₹{campaign.maxBidCpc}/click · Rank: {campaign.adRank.toFixed(1)}
        </p>
        {campaign.status === "active" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-7"
            onClick={() => onPause(campaign.id)}
            data-ocid="seller.ad_campaign.pause.button"
          >
            Pause
          </Button>
        )}
        {campaign.status === "paused" && (
          <Button
            type="button"
            size="sm"
            className="text-xs h-7 text-white"
            style={{ backgroundColor: "#006AFF" }}
            onClick={() => onResume(campaign.id)}
            data-ocid="seller.ad_campaign.resume.button"
          >
            Resume
          </Button>
        )}
      </div>
    </motion.div>
  );
}

interface FormState {
  adType: AdType;
  productId: string;
  productName: string;
  bannerImageUrl: string; // base64 preview or upload URL
  bannerImageFile: File | null;
  bannerTitle: string;
  bannerCta: string;
  videoSourceType: VideoSourceType;
  videoUrl: string; // external link
  videoUploadFile: File | null; // file for upload
  videoUploadUrl: string; // local preview URL or stored URL
  videoTitle: string;
  maxBidCpc: number;
  dailyBudget: number;
  targeting: AdTarget;
}

const DEFAULT_FORM: FormState = {
  adType: "product_boost",
  productId: "",
  productName: "",
  bannerImageUrl: "",
  bannerImageFile: null,
  bannerTitle: "",
  bannerCta: "Shop Now",
  videoSourceType: "link",
  videoUrl: "",
  videoUploadFile: null,
  videoUploadUrl: "",
  videoTitle: "",
  maxBidCpc: 5,
  dailyBudget: 300,
  targeting: "all",
};

export default function SellerAdCampaignTab({
  sellerEmail,
  sellerName,
}: Props) {
  const { getSellerCampaigns, createCampaign, pauseCampaign, resumeCampaign } =
    useAdCampaign();
  const { getWallet } = useAdWallet();
  const { products } = useProducts();

  const wallet = getWallet(sellerEmail);
  const campaigns = getSellerCampaigns(sellerEmail);

  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const lowBalance = wallet.balance < 50;
  const sellerProducts = products.filter((p) => p.seller === sellerName);

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      bannerImageFile: file,
      bannerImageUrl: url,
    }));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      videoUploadFile: file,
      videoUploadUrl: url,
    }));
  };

  const handleSubmit = () => {
    if (form.adType === "product_boost" && !form.productName) {
      toast.error("Please select a product to boost.");
      return;
    }
    if (form.adType === "banner_ad" && !form.bannerTitle) {
      toast.error("Please enter a banner title.");
      return;
    }
    if (form.adType === "video_spotlight") {
      if (form.videoSourceType === "link" && !form.videoUrl) {
        toast.error("Please enter a YouTube or Instagram URL.");
        return;
      }
      if (form.videoSourceType === "upload" && !form.videoUploadUrl) {
        toast.error("Please upload a video file.");
        return;
      }
    }

    createCampaign({
      sellerEmail,
      sellerName,
      adType: form.adType,
      productId: form.productId ? Number(form.productId) : undefined,
      productName: form.productName || undefined,
      bannerImageUrl: form.bannerImageUrl || undefined,
      bannerTitle: form.bannerTitle || undefined,
      bannerCta: form.bannerCta || undefined,
      videoUrl:
        form.videoSourceType === "link"
          ? form.videoUrl || undefined
          : undefined,
      videoUploadUrl:
        form.videoSourceType === "upload"
          ? form.videoUploadUrl || undefined
          : undefined,
      videoSourceType:
        form.adType === "video_spotlight" ? form.videoSourceType : undefined,
      videoTitle: form.videoTitle || undefined,
      targeting: form.targeting,
      maxBidCpc: form.maxBidCpc,
      dailyBudget: form.dailyBudget,
      lastResetDate: new Date().toISOString().split("T")[0],
    });
    toast.success("Campaign submitted for review!");
    setCreating(false);
    setStep(1);
    setForm(DEFAULT_FORM);
  };

  const setF = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-5">
      {/* Balance warning */}
      {lowBalance && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3"
          data-ocid="seller.ad_campaign.low_balance.error_state"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium">
            Low Ad Balance (₹{wallet.balance.toFixed(0)}) — top up Ad Wallet to
            run campaigns.
          </p>
        </motion.div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5" style={{ color: "#006AFF" }} />
            My Ad Campaigns
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Ad Wallet: ₹
            {wallet.balance.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <Button
          type="button"
          className="text-white gap-1.5"
          style={{ backgroundColor: "#006AFF" }}
          onClick={() => {
            setCreating(true);
            setStep(1);
          }}
          data-ocid="seller.ad_campaign.create.button"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </Button>
      </div>

      {/* Campaign list */}
      {campaigns.length === 0 && !creating ? (
        <div
          className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center"
          data-ocid="seller.ad_campaign.empty_state"
        >
          <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No campaigns yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first campaign to start reaching more customers.
          </p>
          <Button
            type="button"
            className="mt-4 text-white"
            style={{ backgroundColor: "#006AFF" }}
            onClick={() => setCreating(true)}
            data-ocid="seller.ad_campaign.first.button"
          >
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              onPause={pauseCampaign}
              onResume={resumeCampaign}
            />
          ))}
        </div>
      )}

      {/* Create Campaign Panel */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
              onClick={() => setCreating(false)}
              aria-label="Close campaign creator"
            />
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              data-ocid="seller.ad_campaign.create.modal"
            >
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">
                  New Campaign — Step {step} of 3
                </h3>
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  data-ocid="seller.ad_campaign.create.close_button"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Step 1: Choose Ad Type */}
                {step === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Choose Ad Type
                    </p>
                    {AD_TYPES.map(({ type, label, desc, icon: Icon }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setF("adType", type)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          form.adType === type
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                        data-ocid={`seller.ad_type.${type}.toggle`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor:
                              form.adType === type ? "#dbeafe" : "#f9fafb",
                          }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{
                              color:
                                form.adType === type ? "#006AFF" : "#9ca3af",
                            }}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-semibold text-sm ${
                              form.adType === type
                                ? "text-blue-700"
                                : "text-gray-800"
                            }`}
                          >
                            {label}
                          </p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        {form.adType === type && (
                          <ChevronRight className="w-4 h-4 text-blue-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: Ad content */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-700">
                      Campaign Details
                    </p>

                    {/* Product Boost */}
                    {form.adType === "product_boost" && (
                      <div className="space-y-1.5">
                        <Label>Select Product</Label>
                        <select
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          value={form.productId}
                          onChange={(e) => {
                            const p = sellerProducts.find(
                              (pr) => String(pr.id) === e.target.value,
                            );
                            setF("productId", e.target.value);
                            setF("productName", p?.title ?? "");
                          }}
                          data-ocid="seller.ad_campaign.product.select"
                        >
                          <option value="">-- Choose a product --</option>
                          {sellerProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                          {sellerProducts.length === 0 && (
                            <option value="1">Sample Product (demo)</option>
                          )}
                        </select>
                      </div>
                    )}

                    {/* Banner Ad */}
                    {form.adType === "banner_ad" && (
                      <>
                        <div className="space-y-1.5">
                          <Label>Banner Title</Label>
                          <Input
                            placeholder="e.g. Monsoon Sale — Up to 40% Off"
                            value={form.bannerTitle}
                            onChange={(e) =>
                              setF("bannerTitle", e.target.value)
                            }
                            data-ocid="seller.ad_campaign.banner_title.input"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>CTA Button Text</Label>
                          <Input
                            placeholder="Shop Now"
                            value={form.bannerCta}
                            onChange={(e) => setF("bannerCta", e.target.value)}
                            data-ocid="seller.ad_campaign.banner_cta.input"
                          />
                        </div>
                        {/* Banner Image Upload */}
                        <div className="space-y-1.5">
                          <Label>Banner Image (1200×200 px recommended)</Label>
                          <input
                            type="file"
                            accept="image/*"
                            ref={bannerInputRef}
                            className="hidden"
                            onChange={handleBannerImageChange}
                          />
                          {form.bannerImageUrl ? (
                            <div className="relative">
                              <img
                                src={form.bannerImageUrl}
                                alt="Banner preview"
                                className="w-full h-24 object-cover rounded-xl border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((p) => ({
                                    ...p,
                                    bannerImageUrl: "",
                                    bannerImageFile: null,
                                  }))
                                }
                                className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
                              >
                                <X className="w-3.5 h-3.5 text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => bannerInputRef.current?.click()}
                              className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition-colors text-gray-400"
                              data-ocid="seller.ad_campaign.banner_image.upload_button"
                            >
                              <Upload className="w-5 h-5" />
                              <span className="text-xs">
                                Click to upload banner image
                              </span>
                            </button>
                          )}
                          <p className="text-xs text-gray-400">
                            PNG, JPG · Max 5 MB · Recommended: 1200×200 px
                          </p>
                        </div>
                      </>
                    )}

                    {/* Video Spotlight */}
                    {form.adType === "video_spotlight" && (
                      <>
                        <div className="space-y-1.5">
                          <Label>Video Title</Label>
                          <Input
                            placeholder="Describe your video"
                            value={form.videoTitle}
                            onChange={(e) => setF("videoTitle", e.target.value)}
                            data-ocid="seller.ad_campaign.video_title.input"
                          />
                        </div>

                        {/* Source type toggle */}
                        <div className="space-y-1.5">
                          <Label>Video Source</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                value: "link" as VideoSourceType,
                                label: "External Link",
                                icon: Link,
                                desc: "YouTube / Instagram",
                              },
                              {
                                value: "upload" as VideoSourceType,
                                label: "Upload File",
                                icon: Upload,
                                desc: "MP4, WebM, MOV",
                              },
                            ].map(({ value, label, icon: Icon, desc }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setF("videoSourceType", value)}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                  form.videoSourceType === value
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-100 hover:border-gray-200"
                                }`}
                                data-ocid={`seller.ad_campaign.video_source.${value}.toggle`}
                              >
                                <Icon
                                  className="w-4 h-4"
                                  style={{
                                    color:
                                      form.videoSourceType === value
                                        ? "#006AFF"
                                        : "#9ca3af",
                                  }}
                                />
                                <div>
                                  <p
                                    className={`text-sm font-semibold ${form.videoSourceType === value ? "text-blue-700" : "text-gray-700"}`}
                                  >
                                    {label}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {desc}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* External link input */}
                        {form.videoSourceType === "link" && (
                          <div className="space-y-1.5">
                            <Label>YouTube / Instagram URL</Label>
                            <Input
                              placeholder="https://youtube.com/watch?v=..."
                              value={form.videoUrl}
                              onChange={(e) => setF("videoUrl", e.target.value)}
                              data-ocid="seller.ad_campaign.video_url.input"
                            />
                          </div>
                        )}

                        {/* File upload */}
                        {form.videoSourceType === "upload" && (
                          <div className="space-y-1.5">
                            <Label>Upload Video File</Label>
                            <input
                              type="file"
                              accept="video/*"
                              ref={videoInputRef}
                              className="hidden"
                              onChange={handleVideoFileChange}
                            />
                            {form.videoUploadUrl ? (
                              <div className="relative">
                                <video
                                  src={form.videoUploadUrl}
                                  className="w-full h-32 object-cover rounded-xl border border-gray-200 bg-black"
                                  controls
                                >
                                  {/* biome-ignore lint/a11y/useMediaCaption: video preview only */}
                                  <track kind="captions" />
                                </video>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setForm((p) => ({
                                      ...p,
                                      videoUploadUrl: "",
                                      videoUploadFile: null,
                                    }))
                                  }
                                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow"
                                >
                                  <X className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => videoInputRef.current?.click()}
                                className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-300 transition-colors text-gray-400"
                                data-ocid="seller.ad_campaign.video_upload.button"
                              >
                                <Upload className="w-5 h-5" />
                                <span className="text-xs">
                                  Click to upload video
                                </span>
                                <span className="text-[10px] text-gray-300">
                                  MP4, WebM, MOV · Max 100 MB
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Step 3: Budget + Targeting */}
                {step === 3 && (
                  <div className="space-y-5">
                    <p className="text-sm font-semibold text-gray-700">
                      Budget & Targeting
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Max Bid per Click (CPC)</Label>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#006AFF" }}
                        >
                          ₹{form.maxBidCpc}
                        </span>
                      </div>
                      <Slider
                        min={1}
                        max={50}
                        step={1}
                        value={[form.maxBidCpc]}
                        onValueChange={([v]) => setF("maxBidCpc", v)}
                        className="[&_[role=slider]]:border-[#006AFF] [&_.range]:bg-[#006AFF]"
                        data-ocid="seller.ad_campaign.bid.slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>₹1 (low)</span>
                        <span>₹50 (high)</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Daily Budget (₹)</Label>
                      <Input
                        type="number"
                        min={100}
                        max={5000}
                        value={form.dailyBudget}
                        onChange={(e) =>
                          setF("dailyBudget", Number(e.target.value))
                        }
                        data-ocid="seller.ad_campaign.budget.input"
                      />
                      <p className="text-xs text-gray-400">
                        Min ₹100 / Max ₹5,000 per day
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Targeting</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {TARGET_OPTIONS.map(({ value, label, desc }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setF("targeting", value)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                              form.targeting === value
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                            data-ocid={`seller.ad_campaign.target.${value}.toggle`}
                          >
                            <Zap
                              className="w-4 h-4"
                              style={{
                                color:
                                  form.targeting === value
                                    ? "#006AFF"
                                    : "#9ca3af",
                              }}
                            />
                            <div>
                              <p
                                className={`font-semibold text-sm ${
                                  form.targeting === value
                                    ? "text-blue-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {label}
                              </p>
                              <p className="text-xs text-gray-400">{desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3 pt-2">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep((s) => s - 1)}
                      data-ocid="seller.ad_campaign.prev.button"
                    >
                      Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button
                      type="button"
                      className="flex-1 text-white"
                      style={{ backgroundColor: "#006AFF" }}
                      onClick={() => setStep((s) => s + 1)}
                      data-ocid="seller.ad_campaign.next.button"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="flex-1 text-white"
                      style={{ backgroundColor: "#10B981" }}
                      onClick={handleSubmit}
                      data-ocid="seller.ad_campaign.submit.button"
                    >
                      Submit for Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
