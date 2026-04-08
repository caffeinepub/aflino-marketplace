import AuthModal, { type AuthView } from "@/components/AuthModal";
import DeliveryETAWidget from "@/components/DeliveryETAWidget";
import Viewer360 from "@/components/Viewer360";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PINCODE_MAP, useAddresses } from "@/context/AddressContext";
import { useCart } from "@/context/CartContext";
import { useOrderTracking } from "@/context/OrderTrackingContext";
import { useProducts } from "@/context/ProductContext";
import { useReviews } from "@/context/ReviewContext";
import { useRewardSettings } from "@/context/RewardSettingsContext";
import { useRole } from "@/context/RoleContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product, ProductVariant } from "@/data/products";
import { addToHistory, getHistory } from "@/utils/browsingHistory";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  Heart,
  MapPin,
  Package,
  Play,
  Plus,
  Send,
  Shield,
  ShoppingCart,
  Star,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const AFLINO_BLUE = "#006AFF";
const AFLINO_PINK = "#FF1B8D";

const COMBOS: Record<number, number[]> = {
  11: [11, 3, 2],
  5: [5, 6, 7],
  12: [12, 8, 9],
};

function isSpecSize(size: string): boolean {
  return (
    size.includes("+") ||
    size.toLowerCase().includes("gb") ||
    size.toLowerCase().includes("tb") ||
    size.toLowerCase().includes("inch") ||
    (size.toLowerCase().includes("l") && size.length > 2) ||
    size.includes('"') ||
    size.length > 5
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="w-4 h-4"
          fill={s <= Math.round(rating) ? AFLINO_BLUE : "none"}
          stroke={s <= Math.round(rating) ? AFLINO_BLUE : "#d1d5db"}
        />
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function PillRow({
  labelColor,
  label,
  scrollRef,
  children,
}: {
  labelColor: string;
  label: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  function scroll(dir: "left" | "right") {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += dir === "right" ? 200 : -200;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        borderRadius: 50,
        border: `2px solid ${labelColor}`,
        background: "#fff",
        minHeight: 72,
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: labelColor,
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 88,
          borderRadius: 50,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              padding: 0,
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              padding: 0,
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div
        style={{
          overflow: "hidden",
          flex: 1,
          minWidth: 0,
          borderRadius: "0 50px 50px 0",
        }}
      >
        <div
          ref={scrollRef}
          style={{
            overflowX: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            height: "100%",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch" as never,
            touchAction: "pan-x",
            scrollbarWidth: "none" as never,
          }}
          className="hide-scrollbar"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function ProductMiniCard({
  product,
  onNavigate,
}: {
  product: Product;
  onNavigate: (id: number) => void;
}) {
  const displayPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price))
    : product.price;
  const emoji =
    product.category === "Electronics"
      ? "💻"
      : product.category === "Fashion"
        ? "👗"
        : product.category === "Home & Kitchen"
          ? "🏠"
          : product.category === "Beauty"
            ? "✨"
            : "📦";

  return (
    <button
      type="button"
      className="flex-shrink-0 w-40 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden text-left"
      onClick={() => onNavigate(product.id)}
      data-ocid="product.related.card"
    >
      <div
        className="h-28 flex items-center justify-center text-3xl"
        style={{
          background: "linear-gradient(135deg, #f0f6ff 0%, #e8f0ff 100%)",
        }}
      >
        {emoji}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">
          {product.title}
        </p>
        <p className="text-sm font-bold" style={{ color: AFLINO_BLUE }}>
          ₹{displayPrice.toLocaleString("en-IN")}
        </p>
        <button
          type="button"
          className="mt-1.5 w-full text-xs font-semibold py-1 rounded-lg text-white"
          style={{ backgroundColor: AFLINO_PINK }}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(product.id);
          }}
        >
          View
        </button>
      </div>
    </button>
  );
}

interface Props {
  productId: number;
  onBack: () => void;
  onNavigateToProduct: (id: number) => void;
}

function StarPicker({
  value,
  onChange,
}: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <fieldset className="flex gap-1" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
        >
          <Star
            className="w-6 h-6"
            fill={(hover || value) >= s ? AFLINO_BLUE : "none"}
            stroke={(hover || value) >= s ? AFLINO_BLUE : "#d1d5db"}
          />
        </button>
      ))}
    </fieldset>
  );
}

function CustomerReviewSection({
  productId,
  productName,
  role,
}: { productId: string; productName: string; role: string | null }) {
  const {
    getApprovedReviews,
    getProductAverageRating,
    submitReview,
    getSubmissionCount,
    getCoinsEarned,
    isUserBlocked,
  } = useReviews();
  const { orders } = useOrderTracking()!;
  const { settings: rewardSettings } = useRewardSettings();

  // --- Anti-fraud checks ---
  // 1. Has a delivered order for this product?
  const hasDeliveredOrder = orders.some(
    (o) =>
      o.status === "Delivered" &&
      o.product?.toLowerCase().includes(productName.toLowerCase().slice(0, 10)),
  );

  // Use a stable userId derived from demo-customer for the logged-in user
  const currentUserId = "demo-customer";

  const submissionCount = getSubmissionCount(currentUserId, productId);
  const coinsAlreadyEarned = getCoinsEarned(currentUserId, productId);
  const coinCap = rewardSettings.textPoints + rewardSettings.photoPoints;
  const capReached = coinsAlreadyEarned >= coinCap;
  const maxSubmissionsReached = submissionCount >= 3;
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const approvedReviews = getApprovedReviews(productId);
  const { averageRating, reviewCount } = getProductAverageRating(productId);
  const allPhotos = approvedReviews.flatMap((r) => r.photoUrls);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    const toAdd = files.slice(0, remaining);
    for (const file of toAdd) {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, { file, url }]);
    }
    if (e.target) e.target.value = "";
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    const photoUrls = photos.map((p) => p.url);

    submitReview({
      productId,
      userId: currentUserId,
      userName: "You",
      rating,
      reviewText: reviewText.trim(),
      photoUrls,
      isVerifiedPurchase: hasDeliveredOrder,
    });

    // Coins are credited ONLY after review is published (auto or manual approval)
    toast.success(
      "Review submitted! 🪙 Coins will be credited once your review is published.",
    );

    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    setRating(0);
    setReviewText("");
    setPhotos([]);
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <section className="border-t border-gray-100 py-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: AFLINO_BLUE }}>
          Customer Reviews
        </h2>
        {reviewCount > 0 && (
          <span
            className="text-sm font-semibold"
            style={{ color: AFLINO_BLUE }}
          >
            {averageRating.toFixed(1)} ★ · {reviewCount} review
            {reviewCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Customer Photos */}
      {allPhotos.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Customer Photos
          </p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {allPhotos.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setExpandedPhoto(url)}
                className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {approvedReviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {approvedReviews.map((review) => (
            <div
              key={review.reviewId}
              className="rounded-xl border border-gray-100 p-4 bg-white shadow-xs flex-shrink-0"
              style={{ width: 280 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #006AFF, #EC008C)",
                  }}
                >
                  {review.userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {review.userName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                {review.isVerifiedPurchase && (
                  <span className="ml-auto flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              {/* Stars */}
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-3.5 h-3.5"
                    fill={s <= review.rating ? AFLINO_BLUE : "none"}
                    stroke={s <= review.rating ? AFLINO_BLUE : "#d1d5db"}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {review.reviewText}
              </p>
              {/* Review photos */}
              {review.photoUrls.length > 0 && (
                <div className="flex gap-1.5 mt-3">
                  {review.photoUrls.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setExpandedPhoto(url)}
                      className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Review */}
      <div className="mt-5">
        {isUserBlocked(currentUserId) ? (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl p-3 border border-red-200">
            <Shield className="w-4 h-4 flex-shrink-0" />
            Your account has been restricted from posting reviews.
          </div>
        ) : !role ? (
          <p className="text-sm text-gray-400 text-center py-4">
            <span className="font-medium" style={{ color: AFLINO_BLUE }}>
              Login
            </span>{" "}
            to write a review and earn AFLINO Coins 🪙
          </p>
        ) : !hasDeliveredOrder ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-200">
            <Package className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>
              <span className="font-semibold">Verified Purchase Required.</span>{" "}
              The "Write a Review" option will be enabled after your order is{" "}
              <span className="font-semibold text-green-700">Delivered</span>.
            </span>
          </div>
        ) : maxSubmissionsReached ? (
          <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 rounded-xl p-3 border border-orange-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            You have reached the maximum of 3 review submissions for this
            product.
          </div>
        ) : submitted ? (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl p-3 border border-green-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Review submitted for moderation! You'll be notified once approved.
            {submissionCount > 0 && (
              <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                {submissionCount}/3 submissions used
              </span>
            )}
          </div>
        ) : !showForm ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: AFLINO_BLUE }}
              data-ocid="product.write_review.button"
            >
              <Star className="w-4 h-4" />
              {submissionCount === 0
                ? "Write a Review · Earn Coins 🪙"
                : `Update Review (${submissionCount}/3)`}
            </button>
            <p className="text-xs text-amber-700 font-medium">
              💡 Write a review to earn {rewardSettings.textPoints} coin
              {rewardSettings.textPoints !== 1 ? "s" : ""}, or add a photo to
              get {rewardSettings.textPoints + rewardSettings.photoPoints}{" "}
              coins! Coins are awarded after your review is published.
              {coinsAlreadyEarned > 0 &&
                ` · Already earned: ${coinsAlreadyEarned}/${coinCap} coins`}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4"
            data-ocid="review.form"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">Your Review</p>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {/* Star picker */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Rating *
              </p>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            {/* Text */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Your Experience *
              </p>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your honest experience with this product..."
                className="resize-none text-sm"
                rows={3}
                data-ocid="review.textarea"
              />
            </div>
            {/* Photo upload */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Add Photos (1–3) ·{" "}
                <span className="text-amber-600 font-bold">
                  +{rewardSettings.photoPoints} bonus coin
                  {rewardSettings.photoPoints !== 1 ? "s" : ""} for adding a
                  photo!
                </span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {photos.map((p) => (
                  <div
                    key={p.url}
                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                  >
                    <img
                      src={p.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photos.indexOf(p))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-blue-400 transition-colors flex-shrink-0"
                    data-ocid="review.upload_button"
                  >
                    <Camera className="w-5 h-5 text-gray-400" />
                    <span className="text-[10px] text-gray-400">Add</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
            {/* Coin reminder */}
            {(() => {
              const remaining = coinCap - coinsAlreadyEarned;
              const hasP = photos.length >= 1;
              let toEarn = 0;
              if (remaining > 0) {
                const textAlready =
                  coinsAlreadyEarned >= rewardSettings.textPoints;
                if (!textAlready)
                  toEarn += Math.min(rewardSettings.textPoints, remaining);
                if (hasP) {
                  const photoAlready =
                    coinsAlreadyEarned >=
                    rewardSettings.textPoints + rewardSettings.photoPoints;
                  if (!photoAlready) {
                    toEarn += Math.min(
                      rewardSettings.photoPoints,
                      remaining -
                        Math.min(rewardSettings.textPoints, remaining),
                    );
                  }
                }
              }
              if (capReached)
                return (
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                    <Coins className="w-3.5 h-3.5 flex-shrink-0" />
                    You have already earned the maximum {coinCap} coins for this
                    product.
                  </div>
                );
              if (toEarn > 0)
                return (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                    <Coins className="w-3.5 h-3.5 flex-shrink-0" />
                    You'll earn {toEarn} AFLINO Coin{toEarn !== 1 ? "s" : ""}{" "}
                    for this review!
                  </div>
                );
              return null;
            })()}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full text-white font-semibold text-sm"
              style={{ backgroundColor: AFLINO_BLUE }}
              data-ocid="review.submit_button"
            >
              {submitting ? (
                <span className="flex items-center gap-2">Uploading...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Review
                </span>
              )}
            </Button>
          </form>
        )}
      </div>

      {/* Photo lightbox */}
      {expandedPhoto && (
        <dialog
          open
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 border-0 max-w-none w-full h-full m-0"
          aria-modal="true"
          data-ocid="review.photo.modal"
        >
          <button
            type="button"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            onClick={() => setExpandedPhoto(null)}
            data-ocid="review.photo.close_button"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={expandedPhoto}
            alt=""
            className="max-w-full max-h-[85vh] rounded-xl object-contain"
          />
        </dialog>
      )}
    </section>
  );
}

function DeliverToWidget() {
  const { addresses } = useAddresses();
  const defaultAddr = addresses.find((a) => a.isDefault);
  const [showChange, setShowChange] = useState(false);
  const [customPin, setCustomPin] = useState("");

  const displayPin = customPin || defaultAddr?.pincode || "Enter pincode";
  const lookupCity =
    customPin.length === 6 ? PINCODE_MAP[customPin]?.city : defaultAddr?.city;
  const lookupState =
    customPin.length === 6 ? PINCODE_MAP[customPin]?.state : defaultAddr?.state;

  return (
    <div className="border border-gray-100 rounded-xl p-3 my-3 bg-gray-50">
      <div className="flex items-center gap-2">
        <MapPin
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "#006AFF" }}
        />
        <span className="text-sm text-gray-700">
          Deliver to{" "}
          <span className="font-semibold text-gray-900">{displayPin}</span>
        </span>
        <button
          type="button"
          onClick={() => setShowChange(!showChange)}
          className="ml-1 text-xs font-semibold"
          style={{ color: "#006AFF" }}
          data-ocid="product.deliver_to.button"
        >
          Change
        </button>
      </div>
      {(lookupCity || lookupState) && (
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Delivering to: {lookupCity}
          {lookupState ? `, ${lookupState}` : ""}
        </p>
      )}
      {showChange && (
        <div className="mt-2 ml-6 space-y-2">
          {addresses.length > 0 && (
            <div className="space-y-1">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => {
                    setCustomPin(addr.pincode);
                    setShowChange(false);
                  }}
                  className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 w-full text-left"
                >
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {addr.label}: {addr.city}, {addr.pincode}
                  {addr.isDefault ? " (Default)" : ""}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              maxLength={6}
              value={customPin}
              onChange={(e) => setCustomPin(e.target.value)}
              placeholder="Enter pincode"
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:border-blue-400"
              data-ocid="product.deliver_to.input"
            />
            <button
              type="button"
              onClick={() => setShowChange(false)}
              className="text-xs px-2 py-1 rounded-lg text-white font-semibold"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="product.deliver_to.primary_button"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage({
  productId,
  onBack,
  onNavigateToProduct,
}: Props) {
  const { addToCart } = useCart();
  const { role } = useRole();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [authView, setAuthView] = useState<AuthView>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"photos" | "360">(
    "photos",
  );

  const colorScrollRef = useRef<HTMLDivElement>(null);
  const sizeScrollRef = useRef<HTMLDivElement>(null);
  const mainButtonsRef = useRef<HTMLDivElement>(null);

  const { products } = useProducts();
  const product = products.find((p) => p.id === productId);

  useEffect(() => {
    addToHistory(productId);
    setSelectedSize(null);
    setSelectedColor(null);
    setDescExpanded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  useEffect(() => {
    function handleScroll() {
      if (mainButtonsRef.current) {
        const rect = mainButtonsRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Product not found</p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 text-blue-600 underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const hasVariants = !!product.variants && product.variants.length > 0;
  const uniqueSizes = hasVariants
    ? [...new Set(product.variants!.map((v) => v.size))]
    : [];
  const uniqueAllColors: ProductVariant[] = hasVariants
    ? [...new Map(product.variants!.map((v) => [v.color, v])).values()]
    : [];

  const sizesForColor: string[] =
    hasVariants && selectedColor
      ? [
          ...new Set(
            product
              .variants!.filter((v) => v.color === selectedColor)
              .map((v) => v.size),
          ),
        ]
      : uniqueSizes;

  function priceForSize(size: string): number {
    if (!hasVariants) return product!.price;
    const candidates = selectedColor
      ? product!.variants!.filter(
          (v) => v.size === size && v.color === selectedColor,
        )
      : product!.variants!.filter((v) => v.size === size);
    return candidates.length > 0
      ? Math.min(...candidates.map((v) => v.price))
      : product!.price;
  }

  function priceForColor(color: string): number {
    if (!hasVariants) return product!.price;
    const candidates = product!.variants!.filter((v) => v.color === color);
    return candidates.length > 0
      ? Math.min(...candidates.map((v) => v.price))
      : product!.price;
  }

  function sizesHaveDifferentPrices(): boolean {
    if (!hasVariants || uniqueSizes.length === 0) return false;
    const prices = uniqueSizes.map((s) => priceForSize(s));
    return new Set(prices).size > 1;
  }

  const showPriceInSizeBox =
    isSpecSize(uniqueSizes[0] ?? "") || sizesHaveDifferentPrices();

  const selectedVariant: ProductVariant | null =
    hasVariants && selectedSize && selectedColor
      ? (product.variants!.find(
          (v) => v.size === selectedSize && v.color === selectedColor,
        ) ?? null)
      : null;

  const displayPrice = selectedVariant
    ? selectedVariant.price
    : hasVariants
      ? Math.min(...product.variants!.map((v) => v.price))
      : product.price;

  const displayStock = selectedVariant
    ? selectedVariant.stock
    : hasVariants
      ? null
      : product.stock;

  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : false;
  const canAddToCart = hasVariants
    ? !!selectedVariant && !isOutOfStock
    : product.stock > 0;

  function handleAddToCart() {
    addToCart({
      productId: product!.id,
      productTitle: product!.title,
      price: displayPrice,
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            size: selectedVariant.size,
            color: selectedVariant.color,
            colorHex: selectedVariant.colorHex,
          }
        : undefined,
    });
    toast.success(`"${product!.title}" added to cart!`, {
      description: selectedVariant
        ? `${selectedVariant.size} · ${selectedVariant.color}`
        : undefined,
    });
  }

  const categoryEmoji =
    product.category === "Electronics"
      ? "💻"
      : product.category === "Fashion"
        ? "👗"
        : product.category === "Home & Kitchen"
          ? "🏠"
          : product.category === "Beauty"
            ? "✨"
            : "📦";

  const leftLabel = isOutOfStock
    ? "Out of Stock"
    : hasVariants && !selectedVariant
      ? "Select Options"
      : "Add to Cart";

  // Related products
  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );

  // Browsing history "You might also like"
  const history = getHistory();
  const historyProducts = history
    .filter((id) => id !== product.id)
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p)
    .slice(0, 6);

  // Frequently bought together
  const comboIds = COMBOS[product.id] ?? [];
  const comboProducts = comboIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);
  const comboTotal = comboProducts.reduce((sum, p) => {
    const price = p.variants?.length
      ? Math.min(...p.variants.map((v) => v.price))
      : p.price;
    return sum + price;
  }, 0);

  const isElectronics = product.category === "Electronics";
  const isHomeKitchen = product.category === "Home & Kitchen";

  function handleNavigate(id: number) {
    addToHistory(id);
    onNavigateToProduct(id);
  }

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="min-h-screen bg-white"
        data-ocid="product.page"
      >
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-[72px] z-10">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors"
              data-ocid="product.back.button"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
            <span className="text-gray-300">›</span>
            <span style={{ color: AFLINO_PINK }} className="font-medium">
              {product.category}
            </span>
            <span className="text-gray-300">›</span>
            <span className="text-gray-700 line-clamp-1 font-medium">
              {product.title}
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Image / 360° Media column */}
            <div className="flex flex-col gap-3">
              {/* Tab switcher — only render when 360 data is available */}
              {product.folder360Url && (product.frameCount360 ?? 36) >= 24 && (
                <div
                  className="flex gap-1 p-1 rounded-xl"
                  style={{ background: "#f0f6ff", width: "fit-content" }}
                  data-ocid="product.media.tab_switcher"
                >
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab("photos")}
                    data-ocid="product.media.tab.photos"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor:
                        activeMediaTab === "photos"
                          ? AFLINO_BLUE
                          : "transparent",
                      color: activeMediaTab === "photos" ? "#fff" : "#6b7280",
                    }}
                  >
                    <Camera size={14} />
                    Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab("360")}
                    data-ocid="product.media.tab.360"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor:
                        activeMediaTab === "360" ? AFLINO_BLUE : "transparent",
                      color: activeMediaTab === "360" ? "#fff" : "#6b7280",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>↻</span>
                    360° View
                  </button>
                </div>
              )}

              {/* 360° Viewer */}
              {activeMediaTab === "360" &&
                product.folder360Url &&
                (product.frameCount360 ?? 36) >= 24 && (
                  <Viewer360
                    frames={Array.from(
                      { length: product.frameCount360 ?? 36 },
                      (_, i) =>
                        `${product.folder360Url}/frame_${String(i + 1).padStart(3, "0")}.jpg`,
                    )}
                    highResFrames={
                      product.highRes360FolderUrl
                        ? Array.from(
                            { length: product.frameCount360 ?? 36 },
                            (_, i) =>
                              `${product.highRes360FolderUrl}/frame_${String(i + 1).padStart(3, "0")}.jpg`,
                          )
                        : undefined
                    }
                    productName={product.title}
                  />
                )}

              {/* Standard photo gallery — shown when Photos tab is active (or no 360 data) */}
              {(activeMediaTab === "photos" ||
                !product.folder360Url ||
                (product.frameCount360 ?? 36) < 24) && (
                <>
                  <div
                    className="rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, #f0f6ff 0%, #deeaff 100%)",
                      minHeight: 320,
                    }}
                  >
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={
                          product.images[activeImageIdx] ?? product.images[0]
                        }
                        alt={product.title}
                        className="w-full h-80 object-cover rounded-2xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://picsum.photos/seed/fallback0/400/400";
                        }}
                      />
                    ) : (
                      <span className="text-8xl">{categoryEmoji}</span>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl">
                        <span className="bg-red-500 text-white font-bold px-5 py-2 rounded-full">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {hasVariants && (
                      <div className="absolute top-3 right-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: AFLINO_BLUE }}
                        >
                          {product.variants!.length} variants
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const isLoggedIn = role !== null;
                        toggleWishlist(product!.id, isLoggedIn, () =>
                          setAuthView("login"),
                        );
                      }}
                      data-ocid="product.wishlist.toggle"
                      className="absolute bottom-3 right-3 z-10 p-2 rounded-full shadow-md transition-all"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.85)",
                        border: "none",
                        cursor: "pointer",
                      }}
                      title={
                        isWishlisted(product!.id)
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                    >
                      <Heart
                        size={20}
                        style={
                          isWishlisted(product!.id)
                            ? { fill: "#EC008C", color: "#EC008C" }
                            : { fill: "none", color: "#9ca3af" }
                        }
                      />
                    </button>
                  </div>
                  {/* Thumbnail Strip */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                      {product.images.map((imgUrl, idx) => (
                        <button
                          key={imgUrl}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className="flex-shrink-0"
                          style={{
                            padding: 0,
                            border:
                              activeImageIdx === idx
                                ? `2.5px solid ${AFLINO_BLUE}`
                                : "2px solid #e5e7eb",
                            borderRadius: 10,
                            overflow: "hidden",
                            background: "none",
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-16 h-16 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                `https://picsum.photos/seed/thumb${idx}/64/64`;
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                    style={{
                      backgroundColor: "#f0f6ff",
                      color: AFLINO_BLUE,
                      borderColor: "#cce0ff",
                    }}
                  >
                    {product.category}
                  </span>
                  {isElectronics && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                      ⚡ Electronics
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-1">
                  {product.title}
                </h1>
                <p className="text-sm text-gray-400">
                  by{" "}
                  <span className="font-medium text-gray-600">
                    {product.seller}
                  </span>
                </p>
              </div>

              <StarRating rating={product.rating} />

              {/* Variant Selectors */}
              {hasVariants && (
                <div className="space-y-3">
                  {/* Colours */}
                  <PillRow
                    labelColor={AFLINO_BLUE}
                    label="Colours"
                    scrollRef={colorScrollRef}
                  >
                    {uniqueAllColors.map((variant) => {
                      const isSelected = selectedColor === variant.color;
                      const isWhite =
                        variant.colorHex.toUpperCase() === "#FFFFFF" ||
                        variant.colorHex.toUpperCase() === "#F5F5F0";
                      const colorPrice = priceForColor(variant.color);
                      return (
                        <button
                          key={variant.color}
                          type="button"
                          onClick={() => setSelectedColor(variant.color)}
                          data-ocid="product.color.toggle"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 3,
                            padding: "6px",
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            border: isSelected
                              ? `3px solid ${AFLINO_BLUE}`
                              : isWhite
                                ? "1.5px solid #e5e7eb"
                                : "none",
                            boxShadow: isSelected
                              ? "0 0 0 2px rgba(0,106,255,0.18)"
                              : "0 1px 3px rgba(0,0,0,0.06)",
                            background: variant.swatchImage
                              ? `url(${variant.swatchImage}) center/cover`
                              : variant.colorHex,
                            cursor: "pointer",
                            flexShrink: 0,
                            transition: "all 0.15s ease",
                            position: "relative",
                          }}
                          title={`${variant.color}${colorPrice ? ` — ₹${colorPrice.toLocaleString("en-IN")}` : ""}`}
                        >
                          {isSelected && (
                            <span
                              style={{
                                position: "absolute",
                                bottom: 2,
                                right: 2,
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                background: AFLINO_BLUE,
                                border: "2px solid #fff",
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </PillRow>

                  {/* Sizes */}
                  <PillRow
                    labelColor={AFLINO_PINK}
                    label="Sizes"
                    scrollRef={sizeScrollRef}
                  >
                    {sizesForColor.map((size) => {
                      const isSelected = selectedSize === size;
                      const sizePrice = priceForSize(size);
                      const spec = isSpecSize(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          data-ocid="product.size.toggle"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: spec ? 3 : 0,
                            padding: spec ? "10px 14px" : "0",
                            width: spec ? undefined : 52,
                            height: spec ? undefined : 52,
                            minWidth: spec ? 90 : undefined,
                            borderRadius: spec ? 12 : "50%",
                            border: isSelected
                              ? `3px solid ${AFLINO_BLUE}`
                              : "1.5px solid #e5e7eb",
                            boxShadow: isSelected
                              ? "0 0 0 2px rgba(0,106,255,0.18)"
                              : "0 1px 3px rgba(0,0,0,0.06)",
                            background: "#fff",
                            cursor: "pointer",
                            flexShrink: 0,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span
                            style={{
                              fontSize: spec ? 11 : 13,
                              fontWeight: 700,
                              color: isSelected ? AFLINO_BLUE : "#1f2937",
                              whiteSpace: "nowrap",
                              textAlign: "center",
                            }}
                          >
                            {size}
                          </span>
                          {(spec || showPriceInSizeBox) && (
                            <span
                              style={{
                                fontSize: 10,
                                color: isSelected ? AFLINO_BLUE : "#6b7280",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                              }}
                            >
                              ₹{sizePrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </PillRow>
                </div>
              )}

              {/* Price */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">
                    {hasVariants && !selectedVariant
                      ? "Starting from"
                      : "Price"}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{displayPrice.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  {displayStock !== null ? (
                    <span
                      className={`text-sm font-medium ${
                        displayStock > 10
                          ? "text-emerald-600"
                          : displayStock > 0
                            ? "text-orange-500"
                            : "text-red-500"
                      }`}
                    >
                      {displayStock > 0
                        ? `${displayStock} in stock`
                        : "Out of Stock"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Select size &amp; colour
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 items-center" ref={mainButtonsRef}>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  data-ocid="product.add_to_cart.primary_button"
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: canAddToCart ? AFLINO_PINK : "#e5e7eb",
                    color: "#fff",
                    border: "none",
                    cursor: canAddToCart ? "pointer" : "not-allowed",
                    fontWeight: 600,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    opacity: canAddToCart ? 1 : 0.5,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  <ShoppingCart size={18} />
                  {leftLabel}
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  data-ocid="product.buy_now.primary_button"
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: canAddToCart ? AFLINO_BLUE : "#e5e7eb",
                    color: "#fff",
                    border: "none",
                    cursor: canAddToCart ? "pointer" : "not-allowed",
                    fontWeight: 600,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    opacity: canAddToCart ? 1 : 0.5,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  <Zap size={18} />
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* ── Delivery ETA Widget ── */}
          <DeliveryETAWidget
            sellerState={product.sellerState}
            sellerPincode={product.warehousePincode}
          />

          {/* u2014u2014 Deliver To Widget u2014u2014 */}
          <DeliverToWidget />

          {/* ── Product Video Player ── */}
          {product.videoUrl &&
            (() => {
              const videoUrl = product.videoUrl;
              const ytMatch = videoUrl.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
              );
              const youtubeId = ytMatch?.[1];
              const isYoutube = !!youtubeId;
              const isInstagram = videoUrl.includes("instagram.com");
              const isFacebook = videoUrl.includes("facebook.com");

              return (
                <section className="border-t border-gray-100 py-6 mb-2">
                  <h2
                    className="text-lg font-bold mb-4"
                    style={{ color: AFLINO_BLUE }}
                  >
                    Product Video
                  </h2>
                  {isYoutube ? (
                    <div
                      className="relative w-full"
                      style={{ paddingBottom: "56.25%" }}
                    >
                      <iframe
                        className="absolute inset-0 w-full h-full rounded-xl"
                        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        allowFullScreen
                        title="Product video"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded font-bold tracking-widest pointer-events-none z-10">
                        AFLINO
                      </div>
                    </div>
                  ) : isInstagram || isFacebook ? (
                    <div
                      className="relative w-full rounded-xl overflow-hidden bg-gray-100 flex flex-col items-center justify-center"
                      style={{ minHeight: 200 }}
                    >
                      <div className="flex flex-col items-center gap-3 p-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                          <Play className="text-white w-7 h-7" fill="white" />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">
                          {isInstagram ? "Instagram Reel" : "Facebook Video"}
                        </p>
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button
                            type="button"
                            className="text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: AFLINO_BLUE }}
                            data-ocid="product.watch_video.primary_button"
                          >
                            Watch Video
                          </button>
                        </a>
                        <p className="text-gray-400 text-xs">
                          Opens in {isInstagram ? "Instagram" : "Facebook"}
                        </p>
                      </div>
                      <div className="absolute bottom-2 right-3 text-xs text-gray-400 font-bold tracking-widest">
                        AFLINO
                      </div>
                    </div>
                  ) : null}
                </section>
              );
            })()}

          {/* ── Smart Description Accordion ── */}
          {product.description && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left group"
                onClick={() => setDescExpanded((v) => !v)}
                data-ocid="product.description.toggle"
              >
                <h2
                  className="text-lg font-bold"
                  style={{ color: AFLINO_BLUE }}
                >
                  Product Description
                </h2>
                <ChevronDown
                  className="w-5 h-5 text-gray-400 transition-transform duration-300"
                  style={{
                    transform: descExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              <div
                style={{
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                  maxHeight: descExpanded ? "600px" : "80px",
                }}
              >
                <p
                  className="text-gray-600 text-sm leading-relaxed mt-3"
                  style={
                    descExpanded
                      ? { lineHeight: 1.8 }
                      : {
                          lineHeight: 1.8,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                        }
                  }
                >
                  {product.description}
                </p>
              </div>
              {!descExpanded && (
                <button
                  type="button"
                  onClick={() => setDescExpanded(true)}
                  className="text-xs font-semibold mt-1"
                  style={{ color: AFLINO_BLUE }}
                >
                  Read more…
                </button>
              )}
            </section>
          )}

          {/* ── Product Detail Images ── */}
          {product.images && product.images.length > 0 && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: "#006AFF" }}
              >
                Product Details
              </h2>
              <div
                className="flex gap-3 hide-scrollbar pb-2"
                style={{
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  marginLeft: "-1rem",
                  marginRight: "-1rem",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                }}
              >
                {product.images.map((imgUrl, idx) => (
                  <img
                    key={imgUrl}
                    src={imgUrl}
                    alt={`${product.title} view ${idx + 1}`}
                    className="w-28 h-28 rounded-xl flex-shrink-0 object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://picsum.photos/seed/fallback${idx}/112/112`;
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Customer Reviews ── */}
          <CustomerReviewSection
            productId={String(product.id)}
            productName={product.title}
            role={role}
          />

          {/* ── Technical Specifications ── */}
          {product.specifications && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: AFLINO_BLUE }}
              >
                {isHomeKitchen ? "Technical Specifications" : "Specifications"}
              </h2>
              {isHomeKitchen ? (
                // Highlighted grid for home appliances
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl p-3.5 border"
                        style={{
                          backgroundColor: "#f0f6ff",
                          borderColor: "#cce0ff",
                        }}
                      >
                        <p className="text-xs font-semibold text-gray-500 mb-0.5">
                          {key}
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {value}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                // Table for electronics & fashion
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  {Object.entries(product.specifications).map(
                    ([key, value], idx) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 text-sm"
                        style={{
                          backgroundColor:
                            idx % 2 === 0 ? "#ffffff" : "#f8faff",
                        }}
                      >
                        <div className="px-4 py-3 font-semibold text-gray-600 border-r border-gray-100">
                          {key}
                        </div>
                        <div className="px-4 py-3 text-gray-800">{value}</div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── Frequently Bought Together ── */}
          {comboProducts.length > 1 && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: AFLINO_BLUE }}
              >
                Frequently Bought Together
              </h2>
              <div className="flex items-center flex-wrap gap-3 mb-4">
                {comboProducts.map((p, idx) => {
                  const price = p.variants?.length
                    ? Math.min(...p.variants.map((v) => v.price))
                    : p.price;
                  const emoji =
                    p.category === "Electronics"
                      ? "💻"
                      : p.category === "Fashion"
                        ? "👗"
                        : p.category === "Home & Kitchen"
                          ? "🏠"
                          : p.category === "Beauty"
                            ? "✨"
                            : "📦";
                  return (
                    <>
                      {idx > 0 && (
                        <Plus
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          key={`plus-${p.id}`}
                        />
                      )}
                      <button
                        key={p.id}
                        type="button"
                        className="flex flex-col items-center gap-1.5 cursor-pointer group bg-transparent border-0 p-0"
                        onClick={() => handleNavigate(p.id)}
                      >
                        <div
                          className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl group-hover:scale-105 transition-transform"
                          style={{
                            background:
                              "linear-gradient(135deg, #f0f6ff, #deeaff)",
                            border:
                              p.id === product.id
                                ? `2px solid ${AFLINO_BLUE}`
                                : "2px solid transparent",
                          }}
                        >
                          {emoji}
                        </div>
                        <p className="text-xs font-medium text-gray-700 text-center w-20 line-clamp-2 leading-snug">
                          {p.title}
                        </p>
                        <p
                          className="text-xs font-bold"
                          style={{ color: AFLINO_BLUE }}
                        >
                          ₹{price.toLocaleString("en-IN")}
                        </p>
                      </button>
                    </>
                  );
                })}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total for combo</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{comboTotal.toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
                  style={{ backgroundColor: AFLINO_PINK }}
                  onClick={() => {
                    for (const p of comboProducts) {
                      const price = p.variants?.length
                        ? Math.min(...p.variants.map((v) => v.price))
                        : p.price;
                      addToCart({
                        productId: p.id,
                        productTitle: p.title,
                        price,
                      });
                    }
                    toast.success("Combo added to cart!");
                  }}
                  data-ocid="product.combo.primary_button"
                >
                  <ShoppingCart size={16} />
                  Add All to Cart
                </button>
              </div>
            </section>
          )}

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: AFLINO_BLUE }}
              >
                Related Products
              </h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {relatedProducts.map((p) => (
                  <ProductMiniCard
                    key={p.id}
                    product={p}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── You Might Also Like ── */}
          {historyProducts.length > 0 && (
            <section className="border-t border-gray-100 py-6 mb-6">
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: AFLINO_BLUE }}
              >
                You Might Also Like
              </h2>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {historyProducts.map((p) => (
                  <ProductMiniCard
                    key={p.id}
                    product={p}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </motion.div>

      {/* ── Sticky Mobile Bar ── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 md:hidden"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{product.title}</p>
              <p className="text-base font-bold text-gray-900">
                ₹{displayPrice.toLocaleString("en-IN")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white flex-shrink-0"
              style={{
                backgroundColor: canAddToCart ? AFLINO_PINK : "#e5e7eb",
              }}
              data-ocid="product.sticky_add_to_cart.button"
            >
              <ShoppingCart size={16} />
              {leftLabel}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {authView && (
        <AuthModal
          view={authView}
          onClose={() => setAuthView(null)}
          onSwitchView={(v) => setAuthView(v)}
        />
      )}
    </>
  );
}
