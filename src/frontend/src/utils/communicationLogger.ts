/**
 * Communication Logger
 * Logs emails and WhatsApp messages to localStorage (and backend when available).
 * All functions are fire-and-forget safe.
 */

interface EmailLogEntry {
  id: number;
  emailType: string;
  recipient: string;
  subject: string;
  status: string;
  orderId: string;
  timestamp: number;
}

interface WaLogEntry {
  id: number;
  messageType: string;
  recipient: string;
  orderId: string;
  status: string;
  timestamp: number;
}

function getEmailLogs(): EmailLogEntry[] {
  try {
    const stored = localStorage.getItem("aflino_email_logs");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getWaLogs(): WaLogEntry[] {
  try {
    const stored = localStorage.getItem("aflino_wa_logs");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function logEmail(
  emailType: string,
  recipient: string,
  subject: string,
  orderId: string,
): void {
  try {
    const logs = getEmailLogs();
    const entry: EmailLogEntry = {
      id: Date.now(),
      emailType,
      recipient,
      subject,
      status: "logged",
      orderId,
      timestamp: Date.now() * 1_000_000, // nanoseconds-like for display consistency
    };
    logs.unshift(entry);
    // Keep last 200 logs
    localStorage.setItem(
      "aflino_email_logs",
      JSON.stringify(logs.slice(0, 200)),
    );
  } catch {
    // silently ignore
  }
}

export function logWhatsApp(
  messageType: string,
  recipient: string,
  orderId: string,
): void {
  try {
    const logs = getWaLogs();
    const entry: WaLogEntry = {
      id: Date.now(),
      messageType,
      recipient,
      orderId,
      status: "queued",
      timestamp: Date.now() * 1_000_000,
    };
    logs.unshift(entry);
    localStorage.setItem("aflino_wa_logs", JSON.stringify(logs.slice(0, 200)));
  } catch {
    // silently ignore
  }
}
