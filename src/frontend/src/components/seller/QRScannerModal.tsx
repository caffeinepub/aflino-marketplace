import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQRScanner } from "@/qr-code/useQRScanner";
import { QrCode, SwitchCamera } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onOrderScanned?: (orderId: string) => void;
}

const IS_MOBILE =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : "",
  );

export default function QRScannerModal({
  open,
  onClose,
  onOrderScanned,
}: QRScannerModalProps) {
  const {
    qrResults,
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 200,
    maxResults: 5,
  });

  const [lastProcessed, setLastProcessed] = useState<string | null>(null);

  // Auto-process new QR results
  useEffect(() => {
    if (qrResults.length === 0) return;
    const latest = qrResults[0];
    if (latest.data === lastProcessed) return;
    setLastProcessed(latest.data);

    if (latest.data.startsWith("ORD-")) {
      onOrderScanned?.(latest.data);
      toast.success(`Order ${latest.data} scanned! Ready to update status.`);
      stopScanning();
    }
  }, [qrResults, lastProcessed, onOrderScanned, stopScanning]);

  function handleClose() {
    stopScanning();
    clearResults();
    setLastProcessed(null);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="max-w-sm mx-auto p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" style={{ color: "#006AFF" }} />
            Scan Order QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-3">
          {/* Camera Preview */}
          <div
            className="rounded-xl overflow-hidden border-2 bg-black relative"
            style={{
              height: 256,
              borderColor: isScanning ? "#006AFF" : "#e5e7eb",
            }}
          >
            <video
              ref={videoRef}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-40 h-40 rounded-xl border-2 opacity-80"
                  style={{
                    borderColor: "#006AFF",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
                  }}
                />
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 text-white text-sm text-center p-4">
                <QrCode className="w-8 h-8 text-red-400" />
                <p>{error.message}</p>
              </div>
            )}

            {!isActive && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
                <QrCode className="w-10 h-10 text-gray-500" />
                {isSupported === false && (
                  <p className="text-xs text-gray-400 text-center px-4">
                    Camera not supported in this browser.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isScanning ? (
              <Button
                type="button"
                className="flex-1 text-white"
                style={{ backgroundColor: "#006AFF" }}
                onClick={startScanning}
                disabled={!canStartScanning || isLoading}
                data-ocid="qrscanner.start.primary_button"
              >
                {isLoading ? "Starting…" : "Start Scanning"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={stopScanning}
                disabled={isLoading}
                data-ocid="qrscanner.stop.secondary_button"
              >
                Stop
              </Button>
            )}
            {IS_MOBILE && isActive && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={switchCamera}
                disabled={isLoading}
                data-ocid="qrscanner.switch.toggle"
              >
                <SwitchCamera className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          {qrResults.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">
                  Scanned Results
                </p>
                <button
                  type="button"
                  onClick={clearResults}
                  className="text-xs text-gray-400 hover:text-gray-600"
                  data-ocid="qrscanner.clear.secondary_button"
                >
                  Clear
                </button>
              </div>
              {qrResults.map((r) => (
                <div
                  key={r.timestamp}
                  className="rounded-lg border px-3 py-2 text-sm"
                  style={{
                    borderColor: r.data.startsWith("ORD-")
                      ? "#006AFF"
                      : "#e5e7eb",
                    backgroundColor: r.data.startsWith("ORD-")
                      ? "#eff6ff"
                      : "#f9fafb",
                  }}
                >
                  <p className="font-mono text-xs text-gray-500">
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="font-medium text-gray-800 break-all">
                    {r.data}
                  </p>
                  {r.data.startsWith("ORD-") && (
                    <p className="text-xs mt-0.5" style={{ color: "#006AFF" }}>
                      ✓ Order ID detected
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleClose}
            data-ocid="qrscanner.close_button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
