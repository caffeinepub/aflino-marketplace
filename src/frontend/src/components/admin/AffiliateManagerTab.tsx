import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  type Affiliate,
  type AffiliateVideo,
  type TierCommission,
  useAffiliate,
} from "@/context/AffiliateContext";
import { CheckCircle2, ChevronDown, ExternalLink, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const SUB_TABS = [
  { id: "kyc", label: "KYC Review" },
  { id: "commission", label: "Commission Settings" },
  { id: "videos", label: "Video Approvals" },
  { id: "payouts", label: "Payout Manager" },
  { id: "api", label: "API Access" },
];

function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tier === "creator" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}
    >
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

function KYCModal({
  affiliate,
  onClose,
}: { affiliate: Affiliate; onClose: () => void }) {
  const { approveAffiliate, rejectAffiliate } = useAffiliate();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const isLowQuality = affiliate.idProof.sizeKB < 150;

  return (
    <DialogContent
      className="max-w-3xl w-full"
      data-ocid="affiliate.kyc.dialog"
    >
      <DialogHeader>
        <DialogTitle>KYC Review — {affiliate.name}</DialogTitle>
      </DialogHeader>
      <div className="grid md:grid-cols-2 gap-6 mt-2">
        {/* Left: Profile */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Profile Details
            </p>
            {[
              ["Name", affiliate.name],
              ["Email", affiliate.email],
              ["Phone", affiliate.phone],
              ["ID Type", affiliate.idProof.type.toUpperCase()],
              ["Bank", affiliate.bankDetails.bankName],
              ["IFSC", affiliate.bankDetails.ifsc],
              ["Account", affiliate.bankDetails.accountNo],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2 text-sm">
                <span className="text-gray-400 w-20 flex-shrink-0">{k}</span>
                <span className="font-medium text-gray-800">{v}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Social Links
            </p>
            {affiliate.socialLinks.map((l, i) => (
              <div
                key={`${l.platform}-${i}`}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-gray-400">{l.platform}:</span>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {l.url.slice(0, 30)}... <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right: ID Document */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            ID Document
          </p>
          {isLowQuality && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-600">
                ⚠ LOW QUALITY — {affiliate.idProof.sizeKB}KB (min 150KB
                required)
              </span>
            </div>
          )}
          <p className="text-xs text-gray-500 mb-2">
            {affiliate.idProof.name} — {affiliate.idProof.sizeKB} KB
          </p>
          {affiliate.idProof.url ? (
            <img
              src={affiliate.idProof.url}
              alt="ID Document"
              className="w-full max-h-64 object-contain rounded-xl border border-gray-200"
            />
          ) : (
            <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
              <p className="text-sm text-gray-400">No image uploaded</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {affiliate.status === "pending" && !rejecting && (
        <div className="flex gap-3 mt-4">
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-full"
            onClick={() => {
              approveAffiliate(affiliate.id);
              toast.success("Affiliate approved!");
              onClose();
            }}
            data-ocid="affiliate.kyc.confirm_button"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-full border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setRejecting(true)}
            data-ocid="affiliate.kyc.reject_button"
          >
            <XCircle className="w-4 h-4 mr-2" /> Reject
          </Button>
        </div>
      )}
      {rejecting && (
        <div className="mt-4 space-y-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason (visible to affiliate)..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            rows={3}
            data-ocid="affiliate.kyc.reject_reason.textarea"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => setRejecting(false)}
              data-ocid="affiliate.kyc.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-full text-white"
              style={{ backgroundColor: "#EF4444" }}
              onClick={() => {
                rejectAffiliate(affiliate.id, reason);
                toast.success("Affiliate rejected.");
                onClose();
              }}
              data-ocid="affiliate.kyc.confirm_reject.button"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
}

export default function AffiliateManagerTab() {
  const {
    affiliates,
    commissions,
    videos,
    tierCommissions,
    toggleApiAccess,
    setAffiliateTier,
    approveVideo,
    rejectVideo,
    markCommissionPaid,
    updateTierCommissions,
  } = useAffiliate();

  const [subTab, setSubTab] = useState("kyc");
  const [kycAffiliate, setKycAffiliate] = useState<Affiliate | null>(null);
  const [localRates, setLocalRates] =
    useState<TierCommission[]>(tierCommissions);

  const pendingAffiliates = affiliates.filter((a) => a.status === "pending");
  const approvedAffiliates = affiliates.filter((a) => a.status === "approved");
  const rejectedAffiliates = affiliates.filter((a) => a.status === "rejected");
  const pendingVideos = videos.filter((v) => v.status === "pending");
  const withdrawableCommissions = commissions.filter(
    (c) => c.status === "withdrawable",
  );

  function saveRates() {
    updateTierCommissions(localRates);
    toast.success("Commission rates saved!");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Affiliate Manager</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage affiliates, KYC, commissions, and video approvals.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-100">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              subTab === t.id
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            data-ocid={`affiliate_admin.${t.id}.tab`}
          >
            {t.label}
            {t.id === "kyc" && pendingAffiliates.length > 0 && (
              <span className="ml-1.5 bg-yellow-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingAffiliates.length}
              </span>
            )}
            {t.id === "videos" && pendingVideos.length > 0 && (
              <span className="ml-1.5 bg-orange-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingVideos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* KYC Review */}
      {subTab === "kyc" && (
        <div className="space-y-6" data-ocid="affiliate_admin.kyc.panel">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Pending KYC ({pendingAffiliates.length})
            </h3>
            {pendingAffiliates.length === 0 ? (
              <p
                className="text-sm text-gray-400"
                data-ocid="affiliate_admin.kyc.empty_state"
              >
                No pending applications.
              </p>
            ) : (
              <div className="space-y-2">
                {pendingAffiliates.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3"
                    data-ocid={`affiliate_admin.kyc.item.${i + 1}`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{a.name}</p>
                      <p className="text-sm text-gray-500">{a.email}</p>
                      {a.idProof.sizeKB < 150 && (
                        <span className="text-xs text-red-600 font-medium">
                          ⚠ Low Quality Doc ({a.idProof.sizeKB}KB)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-gray-400">
                        {new Date(a.joinedAt).toLocaleDateString("en-IN")}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => setKycAffiliate(a)}
                        data-ocid={`affiliate_admin.kyc.review.button.${i + 1}`}
                      >
                        Review KYC
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {approvedAffiliates.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Approved ({approvedAffiliates.length})
              </h3>
              <div className="space-y-2">
                {approvedAffiliates.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3"
                    data-ocid={`affiliate_admin.approved.item.${i + 1}`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{a.name}</p>
                      <p className="text-sm text-gray-500">{a.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TierBadge tier={a.tier} />
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rejectedAffiliates.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Rejected ({rejectedAffiliates.length})
              </h3>
              <div className="space-y-2">
                {rejectedAffiliates.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                    data-ocid={`affiliate_admin.rejected.item.${i + 1}`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{a.name}</p>
                      <p className="text-sm text-red-600 text-xs mt-0.5">
                        {a.rejectionReason}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Commission Settings */}
      {subTab === "commission" && (
        <div className="space-y-4" data-ocid="affiliate_admin.commission.panel">
          <h3 className="font-semibold text-gray-800">
            Category Commission Rates
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Category
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Normal Rate (%)
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Creator Rate (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {localRates.map((row, i) => (
                  <tr
                    key={row.category}
                    className="border-t border-gray-50"
                    data-ocid={`affiliate_admin.commission.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {row.category}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={row.normalRate}
                        onChange={(e) =>
                          setLocalRates((prev) =>
                            prev.map((r, idx) =>
                              idx === i
                                ? { ...r, normalRate: Number(e.target.value) }
                                : r,
                            ),
                          )
                        }
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                        data-ocid={`affiliate_admin.commission.normal_rate.input.${i + 1}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={row.creatorRate}
                        onChange={(e) =>
                          setLocalRates((prev) =>
                            prev.map((r, idx) =>
                              idx === i
                                ? { ...r, creatorRate: Number(e.target.value) }
                                : r,
                            ),
                          )
                        }
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm"
                        data-ocid={`affiliate_admin.commission.creator_rate.input.${i + 1}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            className="rounded-full text-white"
            style={{ backgroundColor: "#006AFF" }}
            onClick={saveRates}
            data-ocid="affiliate_admin.commission.save.button"
          >
            Save Commission Rates
          </Button>
        </div>
      )}

      {/* Video Approvals */}
      {subTab === "videos" && (
        <div className="space-y-4" data-ocid="affiliate_admin.videos.panel">
          <h3 className="font-semibold text-gray-800">
            Pending Video Approvals ({pendingVideos.length})
          </h3>
          {pendingVideos.length === 0 ? (
            <p
              className="text-sm text-gray-400"
              data-ocid="affiliate_admin.videos.empty_state"
            >
              No pending videos.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingVideos.map((v, i) => (
                <div
                  key={v.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                  data-ocid={`affiliate_admin.videos.item.${i + 1}`}
                >
                  {v.platform === "youtube" && extractYouTubeId(v.url) ? (
                    <div className="aspect-video rounded-t-xl overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeId(v.url)}`}
                        className="w-full h-full"
                        allowFullScreen
                        title={v.title}
                      />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-t-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <span className="text-pink-600 font-bold text-sm">
                          IG
                        </span>
                      </div>
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        View on Instagram <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{v.title}</p>
                      <p className="text-sm text-gray-500">
                        {v.affiliateName} ·{" "}
                        <span
                          className={`${v.platform === "youtube" ? "text-red-500" : "text-pink-500"}`}
                        >
                          {v.platform}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-full bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => {
                          approveVideo(v.id);
                          toast.success("Video approved!");
                        }}
                        data-ocid={`affiliate_admin.video.approve.button.${i + 1}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          rejectVideo(v.id);
                          toast.success("Video rejected.");
                        }}
                        data-ocid={`affiliate_admin.video.reject.button.${i + 1}`}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payout Manager */}
      {subTab === "payouts" && (
        <div className="space-y-4" data-ocid="affiliate_admin.payouts.panel">
          <h3 className="font-semibold text-gray-800">
            Withdrawable Commissions
          </h3>
          {withdrawableCommissions.length === 0 ? (
            <p
              className="text-sm text-gray-400"
              data-ocid="affiliate_admin.payouts.empty_state"
            >
              No withdrawable commissions.
            </p>
          ) : (
            (() => {
              const grouped: Record<string, typeof withdrawableCommissions> =
                {};
              for (const c of withdrawableCommissions) {
                if (!grouped[c.affiliateId]) grouped[c.affiliateId] = [];
                grouped[c.affiliateId].push(c);
              }
              return Object.entries(grouped).map(([affiliateId, items], gi) => {
                const aff = affiliates.find((a) => a.id === affiliateId);
                const total = items.reduce((s, c) => s + c.commissionAmount, 0);
                return (
                  <div
                    key={affiliateId}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                    data-ocid={`affiliate_admin.payout.item.${gi + 1}`}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {aff?.name ?? affiliateId}
                        </p>
                        <p className="text-sm text-gray-500">
                          {items.length} commission(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p
                          className="text-lg font-bold"
                          style={{ color: "#006AFF" }}
                        >
                          ₹{total}
                        </p>
                        <Button
                          size="sm"
                          className="rounded-full bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => {
                            for (const c of items) {
                              markCommissionPaid(c.id);
                            }
                            toast.success(`Paid ₹${total} to ${aff?.name}`);
                          }}
                          data-ocid={`affiliate_admin.payout.mark_paid.button.${gi + 1}`}
                        >
                          Mark All Paid
                        </Button>
                      </div>
                    </div>
                    <table className="w-full">
                      <tbody>
                        {items.map((c) => (
                          <tr key={c.id} className="border-t border-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {c.orderId}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {c.productName}
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold text-green-600">
                              ₹{c.commissionAmount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              });
            })()
          )}
        </div>
      )}

      {/* API Access */}
      {subTab === "api" && (
        <div className="space-y-4" data-ocid="affiliate_admin.api.panel">
          <h3 className="font-semibold text-gray-800">API Access Control</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Affiliate
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Tier
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Total Earned
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    API Access
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">
                    Tier Control
                  </th>
                </tr>
              </thead>
              <tbody>
                {approvedAffiliates.map((a, i) => {
                  const earned = commissions
                    .filter(
                      (c) => c.affiliateId === a.id && c.status !== "pending",
                    )
                    .reduce((s, c) => s + c.commissionAmount, 0);
                  return (
                    <tr
                      key={a.id}
                      className="border-t border-gray-50"
                      data-ocid={`affiliate_admin.api.item.${i + 1}`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {a.name}
                        </p>
                        <p className="text-xs text-gray-500">{a.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <TierBadge tier={a.tier} />
                      </td>
                      <td
                        className="px-4 py-3 text-sm font-semibold"
                        style={{ color: "#006AFF" }}
                      >
                        ₹{earned}
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={a.apiEnabled}
                          onCheckedChange={() => {
                            toggleApiAccess(a.id);
                            toast.success(
                              `API ${a.apiEnabled ? "disabled" : "enabled"} for ${a.name}`,
                            );
                          }}
                          data-ocid={`affiliate_admin.api.toggle.${i + 1}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={a.tier}
                          onChange={(e) => {
                            setAffiliateTier(
                              a.id,
                              e.target.value as "normal" | "creator",
                            );
                            toast.success("Tier updated!");
                          }}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white"
                          data-ocid={`affiliate_admin.tier.select.${i + 1}`}
                        >
                          <option value="normal">Normal</option>
                          <option value="creator">Creator</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      <Dialog
        open={!!kycAffiliate}
        onOpenChange={(o) => !o && setKycAffiliate(null)}
      >
        {kycAffiliate && (
          <KYCModal
            affiliate={kycAffiliate}
            onClose={() => setKycAffiliate(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
