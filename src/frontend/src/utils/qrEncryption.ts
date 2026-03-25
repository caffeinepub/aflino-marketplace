/**
 * AES-256-GCM encryption utilities using the browser's Web Crypto API.
 * The AES key is stored in the canister stable memory and retrieved by
 * authenticated sellers before generating shipping labels.
 */

export function generateAesKeyHex(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

export async function encryptTrackingPayload(
  phone: string,
  address: string,
  aesKeyHex: string,
): Promise<string> {
  if (!aesKeyHex || aesKeyHex.length !== 64) {
    throw new Error("AES key must be 64 hex characters (256-bit)");
  }
  const keyBytes = hexToBytes(aesKeyHex);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = JSON.stringify({ phone, address, ts: Date.now() });
  const encoded = new TextEncoder().encode(payload);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as Uint8Array<ArrayBuffer> },
    cryptoKey,
    encoded,
  );
  // Format: ivHex:ciphertextHex
  return `${bytesToHex(iv)}:${bytesToHex(new Uint8Array(ciphertext))}`;
}

export async function decryptTrackingPayload(
  encrypted: string,
  aesKeyHex: string,
): Promise<{ phone: string; address: string }> {
  const colonIdx = encrypted.indexOf(":");
  if (colonIdx === -1) throw new Error("Invalid encrypted data format");
  const ivHex = encrypted.slice(0, colonIdx);
  const ciphertextHex = encrypted.slice(colonIdx + 1);
  const keyBytes = hexToBytes(aesKeyHex);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const ivBytes = hexToBytes(ivHex);
  const cipherBytes = hexToBytes(ciphertextHex);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes as unknown as Uint8Array<ArrayBuffer> },
    cryptoKey,
    cipherBytes.buffer as ArrayBuffer,
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
