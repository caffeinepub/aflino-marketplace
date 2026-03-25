import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActor } from "@/hooks/useActor";
import { generateAesKeyHex } from "@/utils/qrEncryption";
import {
  CheckCircle2,
  Key,
  Loader2,
  QrCode,
  Shield,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function QRSecuritySection() {
  const { actor, isFetching } = useActor();
  const [generatedKey, setGeneratedKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if AES key is configured on mount
  useEffect(() => {
    if (!actor || isFetching) return;
    const actorAny = actor as any;
    if (typeof actorAny.isAesKeyConfigured !== "function") {
      setCheckingStatus(false);
      setIsConfigured(false);
      return;
    }
    setCheckingStatus(true);
    actorAny
      .isAesKeyConfigured()
      .then((val: boolean) => {
        setIsConfigured(val);
        setCheckingStatus(false);
      })
      .catch(() => {
        setIsConfigured(false);
        setCheckingStatus(false);
      });
  }, [actor, isFetching]);

  function handleGenerateKey() {
    const key = generateAesKeyHex();
    setGeneratedKey(key);
  }

  async function handleSaveKey() {
    if (!generatedKey || generatedKey.length !== 64) {
      toast.error("Please generate a valid 64-character key first");
      return;
    }
    if (!actor) {
      toast.error("Not connected to canister");
      return;
    }
    const actorAny = actor as any;
    if (typeof actorAny.setAesKey !== "function") {
      toast.error("setAesKey function not available");
      return;
    }
    setSaving(true);
    try {
      await actorAny.setAesKey(generatedKey);
      setIsConfigured(true);
      setGeneratedKey("");
      toast.success("AES-256 encryption key saved to canister stable memory");
    } catch (err) {
      toast.error(`Failed to save key: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#006AFF" }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-white" />
          <h3 className="text-base font-semibold text-white">
            QR Encryption Security
          </h3>
        </div>
        {checkingStatus ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
            <Loader2 className="w-3 h-3 animate-spin" />
            Checking...
          </span>
        ) : isConfigured ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
            <XCircle className="w-3.5 h-3.5" />
            Not Set
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Status warning */}
        {!checkingStatus && !isConfigured && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              <strong>No encryption key set.</strong> Shipping label QR codes
              will not encrypt customer phone numbers and addresses until a key
              is configured.
            </p>
          </div>
        )}

        {/* Info box */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 space-y-2">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4" style={{ color: "#006AFF" }} />
            <p className="text-sm font-semibold" style={{ color: "#006AFF" }}>
              AES-256-GCM Encryption
            </p>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed">
            Customer phone numbers and delivery addresses are encrypted inside
            the Tracking QR code on shipping labels. Only authorized AFLINO apps
            or verified partner systems with the secret key can decrypt and read
            the customer data. The key is stored securely in canister stable
            memory — never exposed to the browser.
          </p>
        </div>

        {/* Generate key */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-medium text-gray-700">
              AES-256 Key (64 hex characters)
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              readOnly
              value={generatedKey}
              placeholder="Click 'Generate Key' to create a new encryption key..."
              className="font-mono text-xs flex-1"
              data-ocid="qrsecurity.key_input"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateKey}
              className="shrink-0"
              data-ocid="qrsecurity.generate_button"
            >
              Generate Key
            </Button>
          </div>
          {generatedKey && (
            <p className="text-xs text-amber-600">
              ⚠ Copy and store this key securely before saving. It cannot be
              recovered after saving.
            </p>
          )}
        </div>

        {/* Save button */}
        <Button
          onClick={handleSaveKey}
          disabled={!generatedKey || saving}
          className="text-white w-full sm:w-auto"
          style={{ backgroundColor: "#006AFF" }}
          data-ocid="qrsecurity.save_button"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving to Canister...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Save to Canister
            </>
          )}
        </Button>

        {/* Gatepass info */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Digital Gatepass (Pickup QR)
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Each order's Gatepass QR contains a cryptographically signed
            one-time token stored in the canister. When a courier scans it, the
            canister verifies and consumes the token — preventing reuse — and
            updates the order status to "Shipped" automatically. Tokens expire
            after 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
