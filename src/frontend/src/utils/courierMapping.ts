export interface CourierPartner {
  id: string;
  name: string;
  shortName: string;
  awbPrefix: string;
  // Placeholder for logo — will be loaded from /assets/courier/{id}-logo.png
  // when API keys are configured in Admin Panel
  logoPlaceholder: string;
}

const COURIER_PARTNERS: Record<string, CourierPartner> = {
  delhivery: {
    id: "delhivery",
    name: "Delhivery",
    shortName: "DEL",
    awbPrefix: "DEL",
    logoPlaceholder: "DELHIVERY",
  },
  bluedart: {
    id: "bluedart",
    name: "BlueDart Express",
    shortName: "BDT",
    awbPrefix: "BDT",
    logoPlaceholder: "BLUEDART",
  },
  shiprocket: {
    id: "shiprocket",
    name: "Shiprocket",
    shortName: "SRC",
    awbPrefix: "SRC",
    logoPlaceholder: "SHIPROCKET",
  },
};

export function getConfiguredCourier(): CourierPartner | null {
  const saved = localStorage.getItem("aflino_courier_keys");
  if (!saved) return null;
  try {
    const keys = JSON.parse(saved) as Record<string, string>;
    for (const [id, key] of Object.entries(keys)) {
      if (key?.trim() && COURIER_PARTNERS[id]) {
        return COURIER_PARTNERS[id];
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function generateAWBPlaceholder(
  partner: CourierPartner,
  orderId: string,
): string {
  // Placeholder AWB — replaced with real API-generated AWB when keys are active
  const digits = orderId.replace(/\D/g, "").slice(-10).padStart(10, "0");
  return `${partner.awbPrefix}${digits}`;
}
