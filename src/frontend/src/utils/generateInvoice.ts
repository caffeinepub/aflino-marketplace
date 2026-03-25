import jsPDFMock, { autoTable as autoTableMock } from "./jspdf-mock";

// Use real jspdf if available (injected via CDN at runtime), otherwise use mock
// biome-ignore lint/suspicious/noExplicitAny: runtime conditional
const jsPDF: any = (window as any).jspdf?.jsPDF ?? jsPDFMock;
// biome-ignore lint/suspicious/noExplicitAny: runtime conditional
const autoTable: any = (window as any).jspdf?.autoTable ?? autoTableMock;

// Indian number-to-words (pure JS, supports Lakhs/Crores)
function numberToWords(num: number): string {
  if (num === 0) return "Zero Rupees Only";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function twoDigits(n: number): string {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]}${n % 10 !== 0 ? ` ${ones[n % 10]}` : ""}`.trim();
  }

  function threeDigits(n: number): string {
    if (n === 0) return "";
    if (n < 100) return twoDigits(n);
    const h = Math.floor(n / 100);
    const r = n % 100;
    return `${ones[h]} Hundred${r !== 0 ? ` ${twoDigits(r)}` : ""}`.trim();
  }

  let result = "";
  let remaining = Math.floor(num);

  // Crores (1,00,00,000)
  const crores = Math.floor(remaining / 10000000);
  remaining = remaining % 10000000;
  if (crores > 0) result += `${threeDigits(crores)} Crore `;

  // Lakhs (1,00,000)
  const lakhs = Math.floor(remaining / 100000);
  remaining = remaining % 100000;
  if (lakhs > 0) result += `${twoDigits(lakhs)} Lakh `;

  // Thousands
  const thousands = Math.floor(remaining / 1000);
  remaining = remaining % 1000;
  if (thousands > 0) result += `${twoDigits(thousands)} Thousand `;

  // Hundreds and below
  if (remaining > 0) result += `${threeDigits(remaining)} `;

  return `${result.trim()} Rupees Only`;
}

export interface InvoiceData {
  // seller
  sellerName: string;
  sellerAddress: string;
  sellerState: string;
  sellerGstin: string;
  sellerPan: string;
  // buyer
  buyerName: string;
  buyerAddress: string;
  buyerState: string;
  buyerPincode: string;
  // order
  orderId: string;
  orderDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  // product
  productName: string;
  hsnCode: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  gstRate: number;
  isLocalSeller?: boolean;
}

export function generateInvoicePDF(data: InvoiceData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Local (Enrolment ID) sellers have 0% GST - Bill of Supply
  const effectiveGstRate = data.isLocalSeller ? 0 : data.gstRate;

  // Determine CGST/SGST or IGST
  const isSameState =
    data.sellerState.toLowerCase().trim() ===
    data.buyerState.toLowerCase().trim();

  // Calculate amounts
  const grossAmount = data.unitPrice * data.quantity;
  const discountedAmount = grossAmount - (data.discount || 0);
  const taxableAmount = discountedAmount;
  const totalGst = (taxableAmount * effectiveGstRate) / 100;
  const grandTotal = taxableAmount + totalGst;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (!data.isLocalSeller) {
    if (isSameState) {
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igst = totalGst;
    }
  }

  // --- HEADER ---
  doc.setFillColor(0, 106, 255);
  doc.rect(0, 0, pageWidth, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("AFLINO", 14, 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("www.aflino.com", 14, 17);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    data.isLocalSeller
      ? "Bill of Supply"
      : "Tax Invoice / Bill of Supply / Cash Memo",
    pageWidth - 14,
    10,
    {
      align: "right",
    },
  );
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("(Original for Recipient)", pageWidth - 14, 16, { align: "right" });

  // --- ADDRESS SECTION (Two columns) ---
  doc.setTextColor(0, 0, 0);
  let y = 24;

  doc.setDrawColor(200, 200, 200);
  doc.rect(10, y, pageWidth - 20, 44);
  doc.line(pageWidth / 2, y, pageWidth / 2, y + 44);

  // Sold By (left)
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(120, 120, 120);
  doc.text("SOLD BY", 13, y + 7);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(data.sellerName, 13, y + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const sellerAddrLines = doc.splitTextToSize(data.sellerAddress, 82);
  doc.text(sellerAddrLines, 13, y + 19);
  doc.text(`State: ${data.sellerState}`, 13, y + 30);
  doc.text(`GSTIN: ${data.sellerGstin || "N/A"}`, 13, y + 36);
  doc.text(`PAN: ${data.sellerPan || "N/A"}`, 13, y + 41);

  // Ship To (right)
  const rx = pageWidth / 2 + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text("BILLING & SHIPPING ADDRESS", rx, y + 7);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.text(data.buyerName, rx, y + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  const buyerAddrLines = doc.splitTextToSize(data.buyerAddress, 82);
  doc.text(buyerAddrLines, rx, y + 19);
  doc.text(
    `State: ${data.buyerState}   |   PIN: ${data.buyerPincode}`,
    rx,
    y + 30,
  );

  // --- ORDER DETAILS ---
  y += 50;
  doc.setFillColor(245, 247, 255);
  doc.rect(10, y, pageWidth - 20, 10, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);

  const c1 = 14;
  const c2 = 62;
  const c3 = 112;
  const c4 = 158;

  doc.setFont("helvetica", "bold");
  doc.text("Order ID:", c1, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(data.orderId, c1 + 18, y + 7);
  doc.setFont("helvetica", "bold");
  doc.text("Order Date:", c2, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(data.orderDate, c2 + 22, y + 7);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice No:", c3, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceNumber, c3 + 21, y + 7);
  doc.setFont("helvetica", "bold");
  doc.text("Date:", c4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(data.invoiceDate, c4 + 10, y + 7);

  // --- PRODUCT TABLE ---
  y += 14;

  const taxTypeLabel = isSameState
    ? `CGST ${effectiveGstRate / 2}% + SGST ${effectiveGstRate / 2}%`
    : `IGST ${effectiveGstRate}%`;

  const tableBody: string[][] = [
    [
      "1",
      `${data.productName}\nHSN: ${data.hsnCode}`,
      `Rs.${data.unitPrice.toFixed(2)}`,
      `${data.quantity}`,
      `Rs.${grossAmount.toFixed(2)}`,
      `${effectiveGstRate}%`,
      taxTypeLabel,
      `Rs.${totalGst.toFixed(2)}`,
      `Rs.${grandTotal.toFixed(2)}`,
    ],
  ];

  if (data.discount > 0) {
    tableBody.push([
      "",
      "Discount Applied",
      "",
      "",
      `-Rs.${data.discount.toFixed(2)}`,
      "",
      "",
      "",
      "",
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [
      [
        "Sl.",
        "Description",
        "Unit Price",
        "Qty",
        "Net Amt",
        "Tax %",
        "Tax Type",
        "Tax Amt",
        "Total",
      ],
    ],
    body: tableBody,
    margin: { left: 10, right: 10 },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      font: "helvetica",
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [0, 106, 255],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 48 },
      2: { cellWidth: 21 },
      3: { cellWidth: 10 },
      4: { cellWidth: 22 },
      5: { cellWidth: 14 },
      6: { cellWidth: 28 },
      7: { cellWidth: 22 },
      8: { cellWidth: 22 },
    },
    alternateRowStyles: { fillColor: [250, 251, 255] },
  });

  // --- FINANCIAL SUMMARY ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableEndY = (doc as any).lastAutoTable.finalY + 6;
  const summaryX = pageWidth - 80;
  let sy = tableEndY;
  const summaryHeight = isSameState ? 44 : 36;

  doc.setDrawColor(200, 200, 200);
  doc.rect(summaryX, sy, 70, summaryHeight);

  const addSummaryRow = (
    label: string,
    value: string,
    bold = false,
    color?: [number, number, number],
  ) => {
    if (bold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    if (color) doc.setTextColor(color[0], color[1], color[2]);
    else doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text(label, summaryX + 4, sy + 7);
    doc.text(value, summaryX + 66, sy + 7, { align: "right" });
    sy += 9;
  };

  addSummaryRow("Taxable Amount:", `Rs.${taxableAmount.toFixed(2)}`);
  if (isSameState) {
    addSummaryRow(`CGST (${data.gstRate / 2}%):`, `Rs.${cgst.toFixed(2)}`);
    addSummaryRow(`SGST (${data.gstRate / 2}%):`, `Rs.${sgst.toFixed(2)}`);
  } else {
    addSummaryRow(`IGST (${data.gstRate}%):`, `Rs.${igst.toFixed(2)}`);
  }
  addSummaryRow(
    "Grand Total:",
    `Rs.${grandTotal.toFixed(2)}`,
    true,
    [0, 106, 255],
  );

  // Amount in Words
  const wordsY = tableEndY + summaryHeight + 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const words = numberToWords(Math.round(grandTotal));
  doc.text(`Amount in Words: ${words}`, 10, wordsY);

  // --- LEGAL FOOTER ---
  const footerY = wordsY + 12;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(10, footerY, pageWidth - 10, footerY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "Declaration: The goods sold are intended for end-user consumption and not for resale.",
    10,
    footerY + 6,
  );
  doc.text(
    "Return Policy: Items eligible for return within 15 days of delivery. Subject to AFLINO Return Policy.",
    10,
    footerY + 12,
  );

  // Digital signature box
  doc.setDrawColor(0, 106, 255);
  doc.setLineWidth(0.5);
  doc.rect(pageWidth - 65, footerY + 2, 55, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 106, 255);
  doc.text("Digitally Signed by AFLINO", pageWidth - 37.5, footerY + 10, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text("Computer Generated Invoice", pageWidth - 37.5, footerY + 15, {
    align: "center",
  });
  doc.text("No signature required", pageWidth - 37.5, footerY + 19, {
    align: "center",
  });

  doc.save(`Invoice_${data.invoiceNumber}.pdf`);
}
