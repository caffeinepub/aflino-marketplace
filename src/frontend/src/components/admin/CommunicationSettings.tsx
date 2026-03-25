import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  Send,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Mock backend interface for communication (ICP will wire real calls) ─────
interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  enabled: boolean;
}

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  enabled: boolean;
}

interface EmailLog {
  id: bigint;
  emailType: string;
  recipient: string;
  subject: string;
  status: string;
  orderId: string;
  timestamp: bigint;
}

interface WhatsAppLog {
  id: bigint;
  messageType: string;
  recipient: string;
  orderId: string;
  status: string;
  timestamp: bigint;
}

// Safe backend call wrapper
async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

function formatTs(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms === 0) return "—";
  return new Date(ms).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SubTab = "email-setup" | "whatsapp" | "templates" | "logs";
type LogView = "email" | "whatsapp";

export default function CommunicationSettings() {
  const [subTab, setSubTab] = useState<SubTab>("email-setup");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Communication Settings
        </h2>
        <p className="text-sm text-gray-500">
          Configure Email (SMTP) and WhatsApp notifications for AFLINO Local.
        </p>
      </div>

      {/* Sub-tab nav */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {(
          [
            { key: "email-setup", label: "Email Setup", icon: Settings },
            { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
            { key: "templates", label: "Templates", icon: Eye },
            { key: "logs", label: "Logs", icon: Clock },
          ] as {
            key: SubTab;
            label: string;
            icon: React.ComponentType<{ className?: string }>;
          }[]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSubTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === key
                ? "bg-white shadow-sm text-blue-700"
                : "text-gray-500 hover:text-gray-800"
            }`}
            data-ocid={`comm.${key}.tab`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {subTab === "email-setup" && <SmtpTab />}
      {subTab === "whatsapp" && <WhatsAppTab />}
      {subTab === "templates" && <TemplatesTab />}
      {subTab === "logs" && <LogsTab />}
    </div>
  );
}

// ─── SMTP Tab ─────────────────────────────────────────────────────────────────
function SmtpTab() {
  const [config, setConfig] = useState<SmtpConfig>({
    host: "",
    port: "587",
    username: "",
    password: "",
    fromEmail: "",
    fromName: "AFLINO Local",
    enabled: false,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    // Try real backend, fall back to localStorage demo
    const stored = localStorage.getItem("aflino_smtp_config");
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {}
    }
    setLoaded(true);
  }, []);

  async function handleSave() {
    setSaving(true);
    await safeCall(async () => {
      // backend.setSmtpConfig(config)  ← wire when available
      localStorage.setItem("aflino_smtp_config", JSON.stringify(config));
    }, undefined);
    setSaving(false);
    toast.success("SMTP settings saved!");
  }

  const isConfigured = !!(config.host && config.username && config.fromEmail);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#EBF3FF" }}
          >
            <Mail className="w-5 h-5" style={{ color: "#006AFF" }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">SMTP Configuration</h3>
            <p className="text-xs text-gray-500">SendGrid, Amazon SES, etc.</p>
          </div>
        </div>
        <Badge
          className={`text-xs px-3 py-1 ${
            isConfigured
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }`}
          variant="outline"
          data-ocid="smtp.status_badge"
        >
          {isConfigured ? "✓ SMTP Configured" : "⚠ Not Configured"}
        </Badge>
      </div>

      <div
        className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800"
        data-ocid="smtp.info_panel"
      >
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          When <strong>disabled</strong>, emails are{" "}
          <strong>logged only</strong> — no actual sending. Connect a provider
          like SendGrid or Amazon SES and enable to start delivering emails
          automatically.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">SMTP Host</Label>
          <Input
            placeholder="smtp.sendgrid.net"
            value={config.host}
            onChange={(e) => setConfig((c) => ({ ...c, host: e.target.value }))}
            data-ocid="smtp.host.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Port</Label>
          <Input
            placeholder="587"
            value={config.port}
            onChange={(e) => setConfig((c) => ({ ...c, port: e.target.value }))}
            data-ocid="smtp.port.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Username</Label>
          <Input
            placeholder="apikey or username"
            value={config.username}
            onChange={(e) =>
              setConfig((c) => ({ ...c, username: e.target.value }))
            }
            data-ocid="smtp.username.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Password</Label>
          <div className="relative">
            <Input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={config.password}
              onChange={(e) =>
                setConfig((c) => ({ ...c, password: e.target.value }))
              }
              data-ocid="smtp.password.input"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            From Email
          </Label>
          <Input
            placeholder="noreply@aflino.com"
            value={config.fromEmail}
            onChange={(e) =>
              setConfig((c) => ({ ...c, fromEmail: e.target.value }))
            }
            data-ocid="smtp.from_email.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">From Name</Label>
          <Input
            placeholder="AFLINO Local"
            value={config.fromName}
            onChange={(e) =>
              setConfig((c) => ({ ...c, fromName: e.target.value }))
            }
            data-ocid="smtp.from_name.input"
          />
        </div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-800">
            Enable Email Sending
          </p>
          <p className="text-xs text-gray-500">
            Turn on to start sending; requires SMTP credentials above.
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => setConfig((c) => ({ ...c, enabled: v }))}
          data-ocid="smtp.enabled.switch"
        />
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="text-white font-semibold"
        style={{ background: "#006AFF" }}
        data-ocid="smtp.save.button"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        {saving ? "Saving..." : "Save SMTP Settings"}
      </Button>
    </div>
  );
}

// ─── WhatsApp Tab ─────────────────────────────────────────────────────────────
function WhatsAppTab() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    accessToken: "",
    phoneNumberId: "",
    wabaId: "",
    enabled: false,
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("aflino_wa_config");
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch {}
    }
    setLoaded(true);
  }, []);

  async function handleSave() {
    setSaving(true);
    await safeCall(async () => {
      // backend.setWhatsAppConfig(config)  ← wire when available
      localStorage.setItem("aflino_wa_config", JSON.stringify(config));
    }, undefined);
    setSaving(false);
    toast.success("WhatsApp settings saved!");
  }

  const isConfigured = !!(
    config.accessToken &&
    config.phoneNumberId &&
    config.wabaId
  );

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#F0FDF4" }}
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Meta Cloud API (WhatsApp)
            </h3>
            <p className="text-xs text-gray-500">Official Meta Business API</p>
          </div>
        </div>
        <Badge
          className={`text-xs px-3 py-1 ${
            isConfigured
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }`}
          variant="outline"
          data-ocid="wa.status_badge"
        >
          {isConfigured ? "✓ WhatsApp Configured" : "⚠ Not Configured"}
        </Badge>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 space-y-1">
        <p className="font-medium">📱 Meta Cloud API — Free Tier</p>
        <p>
          First 1,000 service conversations per month are <strong>free</strong>.
          Get your credentials from{" "}
          <a
            href="https://business.facebook.com/"
            target="_blank"
            rel="noreferrer"
            className="underline font-medium"
          >
            Meta Business Suite → WhatsApp → API Setup
          </a>
          .
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Access Token
          </Label>
          <div className="relative">
            <Input
              type={showToken ? "text" : "password"}
              placeholder="EAAxxxxxxxxxxxxxxxx"
              value={config.accessToken}
              onChange={(e) =>
                setConfig((c) => ({ ...c, accessToken: e.target.value }))
              }
              data-ocid="wa.access_token.input"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              onClick={() => setShowToken((v) => !v)}
            >
              {showToken ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Phone Number ID
            </Label>
            <Input
              placeholder="1234567890"
              value={config.phoneNumberId}
              onChange={(e) =>
                setConfig((c) => ({ ...c, phoneNumberId: e.target.value }))
              }
              data-ocid="wa.phone_number_id.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">WABA ID</Label>
            <Input
              placeholder="WABA ID from Meta"
              value={config.wabaId}
              onChange={(e) =>
                setConfig((c) => ({ ...c, wabaId: e.target.value }))
              }
              data-ocid="wa.waba_id.input"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-800">
            Enable WhatsApp Notifications
          </p>
          <p className="text-xs text-gray-500">
            Sends order placed &amp; out-for-delivery alerts to customers.
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => setConfig((c) => ({ ...c, enabled: v }))}
          data-ocid="wa.enabled.switch"
        />
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="text-white font-semibold"
        style={{ background: "#006AFF" }}
        data-ocid="wa.save.button"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        {saving ? "Saving..." : "Save WhatsApp Settings"}
      </Button>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────
function TemplatesTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        These templates are sent automatically when triggered. Configure SMTP
        above to enable actual delivery.
      </p>

      {/* Template 1: Welcome */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <Badge
            className="bg-blue-100 text-blue-700 border-none font-mono text-xs"
            data-ocid="template.welcome.badge"
          >
            welcome
          </Badge>
          <span className="text-sm text-gray-600 font-medium">
            Subject:{" "}
            <span className="text-gray-800">
              Welcome to AFLINO Local - Your account is ready!
            </span>
          </span>
        </div>
        <div className="p-4 flex justify-center">
          <div
            className="w-full max-w-lg rounded-xl border border-gray-200 overflow-hidden"
            style={{ fontFamily: "system-ui" }}
          >
            {/* Email header */}
            <div
              className="px-8 py-5 text-center"
              style={{ background: "#006AFF" }}
            >
              <span className="text-white font-bold text-xl tracking-wide">
                AFLINO Local
              </span>
            </div>
            {/* Body */}
            <div className="bg-white px-8 py-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">
                Welcome, [Customer Name]! 👋
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Thank you for joining{" "}
                <strong style={{ color: "#006AFF" }}>AFLINO Local</strong>.
                Discover thousands of local and national products at the best
                prices — delivered straight to your door.
              </p>
              <div className="pt-2">
                <a
                  href="/"
                  style={{ background: "#006AFF" }}
                  className="inline-block px-6 py-3 rounded-lg text-white text-sm font-semibold no-underline"
                >
                  Start Shopping →
                </a>
              </div>
            </div>
            <div
              className="px-8 py-3 text-center text-xs text-gray-400"
              style={{ background: "#F9FAFB" }}
            >
              © {new Date().getFullYear()} AFLINO Local. All rights reserved.
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          ⚡ Triggered on: New user registration
        </div>
      </div>

      {/* Template 2: Order Confirmation */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <Badge
            className="bg-pink-100 text-pink-700 border-none font-mono text-xs"
            data-ocid="template.order_confirmation.badge"
          >
            order_confirmation
          </Badge>
          <span className="text-sm text-gray-600 font-medium">
            Subject:{" "}
            <span className="text-gray-800">
              Order Confirmed - #[ORDER_ID] | AFLINO Local
            </span>
          </span>
        </div>
        <div className="p-4 flex justify-center">
          <div
            className="w-full max-w-lg rounded-xl border border-gray-200 overflow-hidden"
            style={{ fontFamily: "system-ui" }}
          >
            <div
              className="px-8 py-5 text-center"
              style={{ background: "#006AFF" }}
            >
              <span className="text-white font-bold text-xl tracking-wide">
                AFLINO Local
              </span>
            </div>
            <div className="bg-white px-8 py-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  Order Confirmed!
                </h2>
              </div>
              {/* Order summary table */}
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Order ID", "#ORD-XXXXXX"],
                      ["Items", "[Product Name] × [Qty]"],
                      ["Total Amount", "₹[Amount]"],
                      ["Est. Delivery", "5–7 Business Days"],
                    ].map(([k, v]) => (
                      <tr
                        key={k}
                        className="border-b border-gray-200 last:border-0"
                      >
                        <td className="px-4 py-2.5 text-gray-500 font-medium">
                          {k}
                        </td>
                        <td className="px-4 py-2.5 text-gray-800 font-semibold">
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Related Products cross-sell */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  🛍️ Related Products (based on your purchase category)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center p-2"
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded mb-1" />
                      <span className="text-xs text-gray-500">Product {i}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1 italic">
                  Shown based on purchased category.
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <a
                  href="/"
                  style={{ background: "#EC008C" }}
                  className="flex-1 text-center py-2.5 rounded-lg text-white text-xs font-semibold no-underline"
                >
                  Track Order
                </a>
                <a
                  href="/"
                  style={{ background: "#006AFF" }}
                  className="flex-1 text-center py-2.5 rounded-lg text-white text-xs font-semibold no-underline"
                >
                  Download Invoice
                </a>
              </div>
            </div>
            <div
              className="px-8 py-3 text-center text-xs text-gray-400"
              style={{ background: "#F9FAFB" }}
            >
              © {new Date().getFullYear()} AFLINO Local. All rights reserved.
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          ⚡ Triggered on: Successful order placement
        </div>
      </div>

      {/* Template 3: Seller Welcome */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <Badge
            className="bg-emerald-100 text-emerald-700 border-none font-mono text-xs"
            data-ocid="template.seller_welcome.badge"
          >
            seller_welcome
          </Badge>
          <span className="text-sm text-gray-600 font-medium">
            Subject:{" "}
            <span className="text-gray-800">
              Welcome to AFLINO Local Seller Hub!
            </span>
          </span>
        </div>
        <div className="p-4 flex justify-center">
          <div
            className="w-full max-w-lg rounded-xl border border-gray-200 overflow-hidden"
            style={{ fontFamily: "system-ui" }}
          >
            <div
              className="px-8 py-5 text-center"
              style={{ background: "#006AFF" }}
            >
              <span className="text-white font-bold text-xl tracking-wide">
                AFLINO Local — Seller Hub
              </span>
            </div>
            <div className="bg-white px-8 py-6 space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  Your Seller Account is Approved!
                </h2>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Congratulations! Your{" "}
                <strong style={{ color: "#006AFF" }}>AFLINO Local</strong>{" "}
                seller account has been approved by our team. You can now start
                listing your products and reaching customers across India.
              </p>
              <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800">
                <strong>Next Steps:</strong> Log in → Seller Dashboard → Upload
                Products
              </div>
              <a
                href="/"
                style={{ background: "#006AFF" }}
                className="inline-block px-6 py-3 rounded-lg text-white text-sm font-semibold no-underline"
              >
                Go to Seller Dashboard →
              </a>
            </div>
            <div
              className="px-8 py-3 text-center text-xs text-gray-400"
              style={{ background: "#F9FAFB" }}
            >
              © {new Date().getFullYear()} AFLINO Local. All rights reserved.
            </div>
          </div>
        </div>
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
          ⚡ Triggered on: Seller account approval by admin
        </div>
      </div>
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────
function LogsTab() {
  const [view, setView] = useState<LogView>("email");
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [waLogs, setWaLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadLogs() {
    setLoading(true);
    // Try backend; fall back to localStorage mock
    const stored = localStorage.getItem("aflino_email_logs");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Array<{
          id: number;
          emailType: string;
          recipient: string;
          subject: string;
          status: string;
          orderId: string;
          timestamp: number;
        }>;
        setEmailLogs(
          parsed.map((l) => ({
            ...l,
            id: BigInt(l.id),
            timestamp: BigInt(l.timestamp),
          })),
        );
      } catch {}
    }
    const waStored = localStorage.getItem("aflino_wa_logs");
    if (waStored) {
      try {
        const parsed = JSON.parse(waStored) as Array<{
          id: number;
          messageType: string;
          recipient: string;
          orderId: string;
          status: string;
          timestamp: number;
        }>;
        setWaLogs(
          parsed.map((l) => ({
            ...l,
            id: BigInt(l.id),
            timestamp: BigInt(l.timestamp),
          })),
        );
      } catch {}
    }
    setLoading(false);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadLogs is stable
  useEffect(() => {
    loadLogs();
  }, []);

  function statusBadge(status: string) {
    if (status === "sent")
      return (
        <Badge
          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
          variant="outline"
        >
          sent
        </Badge>
      );
    if (status === "failed")
      return (
        <Badge
          className="bg-red-50 text-red-700 border-red-200 text-xs"
          variant="outline"
        >
          failed
        </Badge>
      );
    return (
      <Badge
        className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
        variant="outline"
      >
        {status || "logged"}
      </Badge>
    );
  }

  return (
    <div className="space-y-5" data-ocid="comm.logs.panel">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setView("email")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === "email"
                ? "bg-white shadow-sm text-blue-700"
                : "text-gray-500 hover:text-gray-800"
            }`}
            data-ocid="comm.logs.email.tab"
          >
            <Mail className="w-3.5 h-3.5 inline mr-1.5" />
            Email Logs
          </button>
          <button
            type="button"
            onClick={() => setView("whatsapp")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === "whatsapp"
                ? "bg-white shadow-sm text-blue-700"
                : "text-gray-500 hover:text-gray-800"
            }`}
            data-ocid="comm.logs.whatsapp.tab"
          >
            <MessageCircle className="w-3.5 h-3.5 inline mr-1.5" />
            WhatsApp Logs
          </button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadLogs}
          disabled={loading}
          className="gap-1.5 text-xs"
          data-ocid="comm.logs.refresh.button"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {view === "email" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {emailLogs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="comm.email_logs.empty_state"
            >
              <Mail className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 font-medium">
                No emails logged yet.
              </p>
              <p className="text-xs text-gray-400">
                Emails will appear here once triggered by registrations or
                orders.
              </p>
            </div>
          ) : (
            <Table data-ocid="comm.email_logs.table">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-600">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Recipient
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Subject
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Order ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Timestamp
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailLogs.map((log, i) => (
                  <TableRow
                    key={String(log.id)}
                    data-ocid={`email_log.item.${i + 1}`}
                  >
                    <TableCell className="text-xs text-gray-500">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-50 text-blue-700 border-none text-xs font-mono">
                        {log.emailType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {log.recipient}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 max-w-48 truncate">
                      {log.subject}
                    </TableCell>
                    <TableCell>{statusBadge(log.status)}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {log.orderId || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTs(log.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {view === "whatsapp" && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {waLogs.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="comm.wa_logs.empty_state"
            >
              <MessageCircle className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 font-medium">
                No WhatsApp messages logged yet.
              </p>
              <p className="text-xs text-gray-400">
                Messages will appear here once orders are placed or dispatched.
              </p>
            </div>
          ) : (
            <Table data-ocid="comm.wa_logs.table">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold text-gray-600">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Recipient
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Order ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600">
                    Timestamp
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waLogs.map((log, i) => (
                  <TableRow
                    key={String(log.id)}
                    data-ocid={`wa_log.item.${i + 1}`}
                  >
                    <TableCell className="text-xs text-gray-500">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-50 text-emerald-700 border-none text-xs font-mono">
                        {log.messageType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700">
                      {log.recipient}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {log.orderId || "—"}
                    </TableCell>
                    <TableCell>{statusBadge(log.status)}</TableCell>
                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTs(log.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
