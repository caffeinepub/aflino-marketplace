export interface IThinkConfig {
  username: string;
  password: string;
  clientCode: string;
  ratePer500g: number;
}

export interface ShiprocketConfig {
  email: string;
  password: string;
  ratePer500g: number;
}

export interface LogisticsConfig {
  activePartner: "ithink" | "shiprocket";
  indiaPostApiKey?: string;
  ithink: Partial<IThinkConfig>;
  shiprocket: Partial<ShiprocketConfig>;
}

const DEFAULT_CONFIG: LogisticsConfig = {
  activePartner: "ithink",
  ithink: { ratePer500g: 45 },
  shiprocket: { ratePer500g: 55 },
};

export function useLogisticsConfig(): LogisticsConfig {
  const stored = localStorage.getItem("aflino_logistics_config");
  if (!stored) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function getLogisticsConfig(): LogisticsConfig {
  const stored = localStorage.getItem("aflino_logistics_config");
  if (!stored) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function getActivePartnerName(config: LogisticsConfig): string {
  return config.activePartner === "ithink" ? "iThinkLogistics" : "Shiprocket";
}

export function getActiveRate(config: LogisticsConfig): number {
  return config.activePartner === "ithink"
    ? (config.ithink.ratePer500g ?? 45)
    : (config.shiprocket.ratePer500g ?? 55);
}

export function calcShippingCost(
  weightKg: number,
  ratePer500g: number,
): number {
  return Math.ceil(weightKg / 0.5) * ratePer500g;
}
