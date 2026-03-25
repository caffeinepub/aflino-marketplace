import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, CheckCircle, MapPin, Truck } from "lucide-react";
import { useState } from "react";

export interface IndiaPostFallbackModalProps {
  type: "customer" | "seller";
  isOpen: boolean;
  onClose: () => void;
  onAccept: (trackingId?: string) => void;
  onReject?: () => void;
  pincode?: string;
  partnerName?: string;
  orderId?: string;
}

const SELLER_STEPS = [
  "Pack the item securely in a waterproof bag or box.",
  "Print the AFLINO shipping label from the dashboard.",
  "Visit your nearest Post Office with the parcel.",
  "Use Registered Post or Speed Post service.",
  "Enter the India Post tracking number below after drop-off.",
];

export default function IndiaPostFallbackModal({
  type,
  isOpen,
  onClose,
  onAccept,
  onReject,
  pincode,
  partnerName,
  orderId,
}: IndiaPostFallbackModalProps) {
  const [trackingId, setTrackingId] = useState("");

  if (type === "customer") {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="max-w-md rounded-2xl"
          data-ocid="india_post_customer.dialog"
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Delivery via India Post
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 leading-relaxed">
                The pincode <span className="font-bold">{pincode ?? "—"}</span>{" "}
                is not serviceable by{" "}
                <span className="font-bold">
                  {partnerName ?? "our partner"}
                </span>
                . Your order will be shipped via{" "}
                <span className="font-bold">India Post</span> (5–7 business
                days).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <Truck className="w-4 h-4 text-gray-400" />
              Estimated delivery: 5–7 business days via Speed Post
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-ocid="india_post_customer.cancel_button"
            >
              Cancel Order
            </Button>
            <Button
              onClick={() => onAccept()}
              className="flex-1 text-white"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="india_post_customer.confirm_button"
            >
              Accept India Post Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Seller modal
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-lg rounded-2xl"
        data-ocid="india_post_seller.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                India Post Manual Dispatch Required
              </DialogTitle>
              {orderId && (
                <p className="text-xs text-gray-400 mt-0.5">Order: {orderId}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm font-semibold text-amber-800">
                Yeh India Post order hai. Aapko ise khud pack karke nazdiki Post
                Office mein drop karna hoga. Kya aap agree hain?
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Manual Dispatch Instructions
            </p>
            <div className="space-y-2">
              {SELLER_STEPS.map((step, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static list, no reorder
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="india-post-tracking"
              className="text-xs font-semibold text-gray-700"
            >
              India Post Tracking ID
            </Label>
            <Input
              id="india-post-tracking"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter India Post tracking number (e.g. EX123456789IN)"
              className="font-mono text-sm"
              data-ocid="india_post_seller.input"
            />
            <p className="text-xs text-gray-400">
              Enter this after you drop the parcel at the Post Office.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="flex-1"
            data-ocid="india_post_seller.cancel_button"
            onClick={() => {
              onReject?.();
              onClose();
            }}
          >
            Reject
          </Button>
          <Button
            onClick={() => onAccept(trackingId || undefined)}
            className="flex-1 text-white gap-2"
            style={{ backgroundColor: "#006AFF" }}
            data-ocid="india_post_seller.confirm_button"
          >
            <CheckCircle className="w-4 h-4" />
            Accept & Process
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
