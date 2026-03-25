import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Package, QrCode, X } from "lucide-react";

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
  const token = btoa(`${orderId}:${Date.now()}`);
  const pickupUrl = `https://aflino.in/pickup/${token}`;

  const cells = 10;
  const cellSize = 20;
  const svgSize = cells * cellSize;

  function getCell(row: number, col: number): boolean {
    const hash = (orderId.charCodeAt(row % orderId.length) * 31 + col * 17) % 7;
    if (
      (row < 3 && col < 3) ||
      (row < 3 && col >= cells - 3) ||
      (row >= cells - 3 && col < 3)
    )
      return true;
    return hash < 4;
  }

  const cellRects: { row: number; col: number }[] = [];
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      cellRects.push({ row, col });
    }
  }

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

          <div className="flex justify-center">
            <div
              className="border-4 rounded-lg p-3 bg-white shadow-inner"
              style={{ borderColor: "#006AFF" }}
            >
              <svg
                width={svgSize}
                height={svgSize}
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                className="block"
                role="img"
                aria-label="Pickup gatepass QR code"
              >
                <title>Pickup Gatepass QR Code</title>
                {cellRects.map(({ row, col }) => (
                  <rect
                    key={`cell-${row}-${col}`}
                    x={col * cellSize}
                    y={row * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill={getCell(row, col) ? "#006AFF" : "white"}
                  />
                ))}
              </svg>
            </div>
          </div>

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
                  {order.buyerState ? ` — ${order.buyerState}` : ""}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400 truncate mt-1">
              Token: {token.slice(0, 24)}...
            </p>
          </div>

          <div
            className="rounded-lg p-3 text-xs text-center"
            style={{ backgroundColor: "#EEF4FF", color: "#006AFF" }}
          >
            Pickup URL:{" "}
            <span className="font-mono break-all">
              {pickupUrl.slice(0, 50)}...
            </span>
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
