const HISTORY_KEY = "aflino_viewed_products";
const MAX_HISTORY = 10;

export function addToHistory(productId: number): void {
  try {
    const existing: number[] = JSON.parse(
      localStorage.getItem(HISTORY_KEY) || "[]",
    );
    const updated = [
      productId,
      ...existing.filter((id) => id !== productId),
    ].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export function getHistory(): number[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}
