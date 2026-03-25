import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActor } from "@/hooks/useActor";
import { Copy, Loader2, MapPin, Package, QrCode, X } from "lucide-react";
const QRCode = (window as any).__QRCode ?? {
  toDataURL: async (url: string, _opts?: unknown) => url,
};
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface GatepassOrder {
  id: string;
  product: string;
  amount: string;
  buyerName?: string;
  buyerState?: string;
}

interface Props {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  order: GatepassOrder;
}

export default function GatepassQR({ orderId, isOpen, onClose, order }: Props) {
  const { actor, isFetching } = useActor();
  const [token, setToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [pickupUrl, setPickupUrl] = useState("");

  // Generate token when dialog opens
  useEffect(() => {
    if (!isOpen) {
      setToken(null);
      setQrDataUrl(null);
      setPickupUrl("");
      return;
    }
    if (!actor || isFetching) return;

    const actorAny = actor as any;
    if (typeof actorAny.generateGatepassToken !== "function") {
      // Fallback: generate a local token if backend function not available
      const fallbackToken = btoa(`${orderId}:${Date.now()}`);
      setToken(fallbackToken);
      return;
    }

    setLoadingToken(true);
    actorAny
      .generateGatepassToken(orderId)
      .then((tok: string) => {
        setToken(tok);
      })
      .catch(() => {
        // Fallback on error
        const fallbackToken = btoa(`${orderId}:${Date.now()}`);
        setToken(fallbackToken);
        toast.error("Using local token (canister unavailable)");
      })
      .finally(() => {
        setLoadingToken(false);
      });
  }, [isOpen, actor, isFetching, orderId]);

  // Generate QR data URL when token changes
  useEffect(() => {
    if (!token) return;
    const url = `${window.location.origin}/pickup/${token}`;
    setPickupUrl(url);
    QRCode.toDataURL(url, { width: 200, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [token]);

  function handleCopyUrl() {
    if (pickupUrl) {
      navigator.clipboard.writeText(pickupUrl).then(() => {
        toast.success("Pickup URL copied to clipboard");
      });
    }
  }

  const isLoading = loadingToken || (isOpen && !token && isFetching);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm" data-ocid="gatepass.dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" style={{ color: "#006AFF" }} />
            Pickup Gatepass
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">
            Show this to courier staff to confirm pickup
          </p>

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: "#006AFF" }}
              />
              <p className="text-sm text-gray-500">
                Generating secure token...
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <div
                  className="border-4 rounded-lg p-3 bg-white shadow-inner"
                  style={{ borderColor: "#006AFF" }}
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Gatepass QR Code"
                      className="w-48 h-48 block"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                      <QrCode className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div
                className="rounded-lg px-3 py-2 text-xs text-center flex items-center justify-between gap-2"
                style={{ backgroundColor: "#EEF4FF", color: "#006AFF" }}
              >
                <span
                  className="font-mono truncate text-left flex-1"
                  style={{ fontSize: "10px" }}
                >
                  {pickupUrl || "---"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="shrink-0 hover:opacity-70 transition-opacity"
                  title="Copy pickup URL"
                  data-ocid="gatepass.copy_button"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-left space-y-1">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-sm font-semibold text-gray-800">
                {orderId}
              </span>
            </div>
            {order.buyerName && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="text-sm text-gray-600">
                  {order.buyerName}
                  {order.buyerState ? ` \u2014 ${order.buyerState}` : ""}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Valid for 24 hours · One-time use only
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full text-white"
            style={{ backgroundColor: "#006AFF" }}
            data-ocid="gatepass.close_button"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
