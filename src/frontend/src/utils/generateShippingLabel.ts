import jsPDFMock from "./jspdf-mock";

const jsPDF: any = (window as any).jspdf?.jsPDF ?? jsPDFMock;

export interface ShippingLabelData {
  orderId: string;
  customerName: string;
  customerCity: string;
  customerState: string;
  customerPincode: string;
  sellerName: string;
  sellerCity: string;
  paymentType: "PREPAID" | "COD";
  items: { name: string; qty: number; weight?: number }[];
  totalAmount: number;
  logoDataUrl?: string;
}

function drawQRPlaceholder(
  doc: any,
  x: number,
  y: number,
  size: number,
  label: string,
) {
  // Outer border — black
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.rect(x, y, size, size);
  // Inner grid lines — light gray
  doc.setLineWidth(0.15);
  doc.setDrawColor(180, 180, 180);
  for (let i = 0; i < 4; i++) {
    doc.line(x + 2 + i * 4, y + 2, x + 2 + i * 4, y + size - 2);
    doc.line(x + 2, y + 2 + i * 4, x + size - 2, y + 2 + i * 4);
  }
  // Corner finder squares — black
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(x + 2, y + 2, 5, 5);
  doc.rect(x + size - 7, y + 2, 5, 5);
  doc.rect(x + 2, y + size - 7, 5, 5);
  // Label below
  doc.setFontSize(5);
  doc.setTextColor(80, 80, 80);
  doc.text(label, x + size / 2, y + size + 4, { align: "center" });
}

export function generateShippingLabel(data: ShippingLabelData): void {
  // 3x5 inches = 76.2mm x 127mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [76.2, 127],
  });

  const W = 76.2;
  let y = 3;

  // ── Header ──────────────────────────────────────
  // Logo / wordmark on left
  if (data.logoDataUrl) {
    try {
      doc.addImage(data.logoDataUrl, "PNG", 3, y, 20, 8);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("AFLINO", 3, y + 6);
    }
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("AFLINO", 3, y + 7);
  }

  // Payment type box — right-aligned, black border, no fill
  const ptLabel = data.paymentType;
  const ptBoxW = 18;
  const ptBoxH = 8;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.6);
  doc.rect(W - ptBoxW - 3, y, ptBoxW, ptBoxH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(ptLabel, W - 3 - ptBoxW / 2, y + 5.5, { align: "center" });
  y += 11;

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(80, 80, 80);
  doc.text("AFLINO LOCAL MARKETPLACE", 3, y);
  y += 3;

  // ── Divider ─────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(0, y, W, y);
  y += 3;

  // ── Logistics / AWB box ─────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  // dashed rect (simulate with short lines)
  const dashLen = 2;
  const gapLen = 1.5;
  const boxX = 3;
  const boxY = y;
  const boxW = W - 6;
  const boxH = 10;
  let cx = boxX;
  while (cx < boxX + boxW) {
    const end = Math.min(cx + dashLen, boxX + boxW);
    doc.line(cx, boxY, end, boxY);
    doc.line(cx, boxY + boxH, end, boxY + boxH);
    cx += dashLen + gapLen;
  }
  let cy = boxY;
  while (cy < boxY + boxH) {
    const end = Math.min(cy + dashLen, boxY + boxH);
    doc.line(boxX, cy, boxX, end);
    doc.line(boxX + boxW, cy, boxX + boxW, end);
    cy += dashLen + gapLen;
  }
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("Logistics Partner: [Pending]", boxX + 2, y + 4);
  doc.text("AWB: ---", boxX + boxW - 2, y + 4, { align: "right" });
  y += boxH + 3;

  // ── Divider ─────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(0, y, W, y);
  y += 3;

  // ── SHIP TO ──────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text("SHIP TO:", 3, y + 3);
  y += 5;

  // Customer name — large bold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(data.customerName.toUpperCase(), 3, y + 6);
  y += 8;

  // Pincode — prominent
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`PINCODE: ${data.customerPincode}`, 3, y + 5);
  y += 7;

  // City, State
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`${data.customerCity}, ${data.customerState}`, 3, y + 4);
  y += 6;

  // Privacy-masked phone & address
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("Phone: **********", 3, y + 3);
  y += 4;
  doc.text("Address: **********", 3, y + 3);
  y += 5;

  // ── Divider ─────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(0, y, W, y);
  y += 3;

  // ── QR Codes ─────────────────────────────────────
  const qrSize = 22;
  drawQRPlaceholder(doc, 3, y, qrSize, "Scan to Track");
  drawQRPlaceholder(doc, W - qrSize - 3, y, qrSize, "Scan for Invoice");
  y += qrSize + 6;

  // ── Divider ─────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(0, y, W, y);
  y += 3;

  // ── SOLD BY ──────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`SOLD BY: ${data.sellerName}, ${data.sellerCity}`, 3, y + 3);
  y += 7;

  // ── Divider ─────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(0, y, W, y);
  y += 3;

  // ── Order Details ────────────────────────────────
  const sku = data.orderId.slice(-6).toUpperCase();
  const weight = data.items.reduce(
    (a, item) => a + (item.weight ?? 0.5) * item.qty,
    0,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  doc.text(`Order: ${data.orderId}`, 3, y + 3);
  doc.setFont("helvetica", "normal");
  doc.text(`SKU: ${sku}  Wt: ${weight.toFixed(2)}kg`, 3, y + 7);
  doc.text(
    `Items: ${data.items
      .map((i) => `${i.name.slice(0, 18)} x${i.qty}`)
      .join(", ")
      .slice(0, 55)}`,
    3,
    y + 11,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Amount: \u20B9${data.totalAmount.toLocaleString("en-IN")}`,
    W - 3,
    y + 7,
    { align: "right" },
  );
  y += 14;

  // ── Footer ───────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(0, 127 - 8, W, 127 - 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor(100, 100, 100);
  doc.text("Handle with care  |  Computer Generated Label", W / 2, 127 - 4, {
    align: "center",
  });

  doc.save(`AFLINO-Label-${data.orderId}.pdf`);
}
