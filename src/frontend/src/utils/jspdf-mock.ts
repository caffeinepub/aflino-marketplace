// Lightweight PDF stub so the build doesn't fail without jspdf installed.
// The InvoiceButton and generateInvoice.ts will gracefully handle the case.
export default class jsPDF {
  internal = { pageSize: { getWidth: () => 210 }, pages: [] };
  // biome-ignore lint/suspicious/noExplicitAny: stub
  lastAutoTable: any = { finalY: 100 };
  setFont(_: string, __: string) {
    return this;
  }
  setFontSize(_: number) {
    return this;
  }
  setTextColor(..._: number[]) {
    return this;
  }
  setFillColor(..._: number[]) {
    return this;
  }
  setDrawColor(..._: number[]) {
    return this;
  }
  setLineWidth(_: number) {
    return this;
  }
  text(_: string, __: number, ___: number, ____?: object) {
    return this;
  }
  rect(_: number, __: number, ___: number, ____: number, _____?: string) {
    return this;
  }
  line(_: number, __: number, ___: number, ____: number) {
    return this;
  }
  save(_: string) {
    console.warn("jsPDF not installed – invoice download skipped.");
  }
}

// biome-ignore lint/suspicious/noExplicitAny: stub
export function autoTable(_doc: jsPDF, _opts: any) {
  // stub
}
