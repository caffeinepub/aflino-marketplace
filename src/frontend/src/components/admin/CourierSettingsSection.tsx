import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRemotePincode } from "@/context/RemotePincodeContext";
import type { LogisticsConfig } from "@/hooks/useLogisticsConfig";
import {
  getActivePartnerName,
  getActiveRate,
} from "@/hooks/useLogisticsConfig";
import {
  CheckCircle,
  Circle,
  Eye,
  EyeOff,
  IndianRupee,
  Info,
  Package,
  Plus,
  Trash2,
  Truck,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "aflino_logistics_config";

const DEFAULT_CONFIG: LogisticsConfig = {
  activePartner: "ithink",
  ithink: { username: "", password: "", clientCode: "", ratePer500g: 45 },
  shiprocket: { email: "", password: "", ratePer500g: 55 },
  indiaPostApiKey: "",
};

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  "data-ocid": ocid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  "data-ocid"?: string;
}) {
  const [show, setShow] = useState(false);
  const id = useId();
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium text-gray-600">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? label}
          className="pr-9 text-sm"
          data-ocid={ocid}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function RateSummary({ config }: { config: LogisticsConfig }) {
  const name = getActivePartnerName(config);
  const rate = getActiveRate(config);
  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <IndianRupee className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">
          Rate Summary
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-medium">
          Active: <span className="text-blue-600">{name}</span>
        </span>
        <span className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-medium">
          Rate: ₹{rate}/500g
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[0.5, 1, 2].map((kg) => {
          const units = Math.ceil(kg / 0.5);
          const cost = units * rate;
          return (
            <div
              key={kg}
              className="bg-white border border-gray-200 rounded-lg p-2 text-center"
            >
              <p className="text-gray-400">{kg * 1000}g order</p>
              <p className="font-semibold text-gray-800">₹{cost}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RateField({
  value,
  onChange,
  ocid,
}: {
  value: number;
  onChange: (v: number) => void;
  ocid: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-medium text-gray-600">
        Rate per 500g (₹)
      </Label>
      <Input
        id={id}
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="text-sm"
        data-ocid={ocid}
      />
    </div>
  );
}

type ExtendedLogisticsConfig = LogisticsConfig & { indiaPostApiKey?: string };

export default function CourierSettingsSection() {
  const [config, setConfig] = useState<ExtendedLogisticsConfig>(DEFAULT_CONFIG);
  const [showIndiaPostKey, setShowIndiaPostKey] = useState(false);
  const { ranges, addRange, removeRange } = useRemotePincode();
  const [newRangeLabel, setNewRangeLabel] = useState("");
  const [newRangeStart, setNewRangeStart] = useState("");
  const [newRangeEnd, setNewRangeEnd] = useState("");
  const [rangeError, setRangeError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<LogisticsConfig>;
        setConfig((prev) => ({
          activePartner: parsed.activePartner ?? prev.activePartner,
          ithink: { ...prev.ithink, ...parsed.ithink },
          shiprocket: { ...prev.shiprocket, ...parsed.shiprocket },
          indiaPostApiKey:
            (parsed as any).indiaPostApiKey ?? prev.indiaPostApiKey,
        }));
      } catch {
        // ignore
      }
    }
  }, []);

  function setActivePartner(partner: "ithink" | "shiprocket") {
    setConfig((prev) => ({ ...prev, activePartner: partner }));
  }

  function setIThink(field: string, value: string | number) {
    setConfig((prev) => ({
      ...prev,
      ithink: { ...prev.ithink, [field]: value },
    }));
  }

  function setShiprocket(field: string, value: string | number) {
    setConfig((prev) => ({
      ...prev,
      shiprocket: { ...prev.shiprocket, [field]: value },
    }));
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    toast.success("Logistics settings saved successfully!");
  }

  const { activePartner } = config;
  const ithink = config.ithink as Record<string, string | number>;
  const shiprocket = config.shiprocket as Record<string, string | number>;

  return (
    <div className="space-y-5" data-ocid="logistics.section">
      <div>
        <h3 className="text-base font-bold text-gray-800">
          Logistics Partners
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Only one partner can be Active at a time. API keys are preserved when
          switching.
        </p>
      </div>

      {/* Partner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* iThinkLogistics */}
        <div
          className={`rounded-xl border-2 bg-white p-5 space-y-4 transition-colors ${
            activePartner === "ithink"
              ? "border-blue-500 shadow-sm"
              : "border-gray-200"
          }`}
          data-ocid="logistics.ithink.card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  iThinkLogistics
                </p>
                <p className="text-xs text-gray-400">Primary partner</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePartner("ithink")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors focus:outline-none"
              style={{
                backgroundColor:
                  activePartner === "ithink" ? "#006AFF" : "#f3f4f6",
                color: activePartner === "ithink" ? "#fff" : "#6b7280",
              }}
              data-ocid="logistics.ithink.toggle"
            >
              {activePartner === "ithink" ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              {activePartner === "ithink" ? "ACTIVE" : "INACTIVE"}
            </button>
          </div>

          <div className="space-y-3">
            <PasswordField
              label="Username"
              value={String(ithink.username ?? "")}
              onChange={(v) => setIThink("username", v)}
              data-ocid="logistics.ithink.username.input"
            />
            <PasswordField
              label="Password"
              value={String(ithink.password ?? "")}
              onChange={(v) => setIThink("password", v)}
              data-ocid="logistics.ithink.password.input"
            />
            <PasswordField
              label="Client Code"
              value={String(ithink.clientCode ?? "")}
              onChange={(v) => setIThink("clientCode", v)}
              data-ocid="logistics.ithink.clientcode.input"
            />
            <RateField
              value={Number(ithink.ratePer500g ?? 45)}
              onChange={(v) => setIThink("ratePer500g", v)}
              ocid="logistics.ithink.rate.input"
            />
          </div>
        </div>

        {/* Shiprocket */}
        <div
          className={`rounded-xl border-2 bg-white p-5 space-y-4 transition-colors ${
            activePartner === "shiprocket"
              ? "border-blue-500 shadow-sm"
              : "border-gray-200"
          }`}
          data-ocid="logistics.shiprocket.card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Shiprocket</p>
                <p className="text-xs text-gray-400">Backup partner</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePartner("shiprocket")}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors focus:outline-none"
              style={{
                backgroundColor:
                  activePartner === "shiprocket" ? "#006AFF" : "#f3f4f6",
                color: activePartner === "shiprocket" ? "#fff" : "#6b7280",
              }}
              data-ocid="logistics.shiprocket.toggle"
            >
              {activePartner === "shiprocket" ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              {activePartner === "shiprocket" ? "ACTIVE" : "INACTIVE"}
            </button>
          </div>

          <div className="space-y-3">
            <PasswordField
              label="Email"
              value={String(shiprocket.email ?? "")}
              onChange={(v) => setShiprocket("email", v)}
              data-ocid="logistics.shiprocket.email.input"
            />
            <PasswordField
              label="Password"
              value={String(shiprocket.password ?? "")}
              onChange={(v) => setShiprocket("password", v)}
              data-ocid="logistics.shiprocket.password.input"
            />
            <RateField
              value={Number(shiprocket.ratePer500g ?? 55)}
              onChange={(v) => setShiprocket("ratePer500g", v)}
              ocid="logistics.shiprocket.rate.input"
            />
          </div>
        </div>
      </div>

      {/* India Post Fallback */}
      <div
        className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 space-y-3"
        data-ocid="logistics.indiapost.section"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">
              India Post — Manual Fallback
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Permanent backup. Triggered automatically if active partner
              returns Non-Serviceable for a pincode.
            </p>
          </div>
        </div>
        <div className="text-xs text-amber-700 space-y-1 pl-11">
          <p>• No API keys required</p>
          <p>• Seller manually drops parcel at nearest Post Office</p>
          <p>• Uses Registered Post / Speed Post service</p>
          <p>• Seller enters India Post tracking ID after drop-off</p>
        </div>
      </div>

      {/* India Post API Key */}
      <div
        className="rounded-xl border border-gray-200 bg-white p-5 space-y-3"
        data-ocid="logistics.indiapost_apikey.section"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <Info className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">
              India Post API Key
            </p>
            <p className="text-xs text-gray-400">
              Used for AWB generation on Non-Returnable labels.
            </p>
          </div>
        </div>
        <div className="relative">
          <input
            type={showIndiaPostKey ? "text" : "password"}
            value={(config as any).indiaPostApiKey ?? ""}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                indiaPostApiKey: e.target.value,
              }))
            }
            placeholder="Enter India Post API Key"
            className="w-full pr-10 pl-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-ocid="logistics.indiapost.apikey.input"
          />
          <button
            type="button"
            onClick={() => setShowIndiaPostKey((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showIndiaPostKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Remote Pincode List */}
      <div
        className="rounded-xl border border-gray-200 bg-white p-5 space-y-4"
        data-ocid="logistics.remote_pincodes.section"
      >
        <div>
          <h4 className="text-sm font-bold text-gray-800">
            Remote Pincode List (India Post Only)
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Add pincode ranges that your private courier cannot service. Orders
            to these pincodes will automatically use India Post.
          </p>
        </div>

        {/* Existing ranges */}
        {ranges.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-500 font-medium">
                    Label
                  </th>
                  <th className="text-left px-3 py-2 text-gray-500 font-medium">
                    Start
                  </th>
                  <th className="text-left px-3 py-2 text-gray-500 font-medium">
                    End
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {ranges.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-700">
                      {r.label || "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-700">
                      {r.start}
                    </td>
                    <td className="px-3 py-2 font-mono text-gray-700">
                      {r.end}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeRange(r.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        data-ocid="logistics.remote_pincode.delete_button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add new range form */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Label (optional)"
              value={newRangeLabel}
              onChange={(e) => setNewRangeLabel(e.target.value)}
              className="col-span-3 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-ocid="logistics.remote_pincode.label_input"
            />
            <input
              type="text"
              placeholder="Start (e.g. 744000)"
              value={newRangeStart}
              maxLength={6}
              onChange={(e) => {
                setNewRangeStart(e.target.value);
                setRangeError("");
              }}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              data-ocid="logistics.remote_pincode.start_input"
            />
            <input
              type="text"
              placeholder="End (e.g. 744999)"
              value={newRangeEnd}
              maxLength={6}
              onChange={(e) => {
                setNewRangeEnd(e.target.value);
                setRangeError("");
              }}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              data-ocid="logistics.remote_pincode.end_input"
            />
            <button
              type="button"
              onClick={() => {
                if (
                  !/^[0-9]{6}$/.test(newRangeStart) ||
                  !/^[0-9]{6}$/.test(newRangeEnd)
                ) {
                  setRangeError("Both start and end must be 6-digit numbers.");
                  return;
                }
                if (Number(newRangeEnd) < Number(newRangeStart)) {
                  setRangeError("End pincode must be >= start pincode.");
                  return;
                }
                addRange(
                  newRangeStart,
                  newRangeEnd,
                  newRangeLabel || undefined,
                );
                setNewRangeStart("");
                setNewRangeEnd("");
                setNewRangeLabel("");
                toast.success("Pincode range added!");
              }}
              className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-white rounded-lg transition-colors"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="logistics.remote_pincode.add_button"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
          {rangeError && <p className="text-xs text-red-600">{rangeError}</p>}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
          💡 Tip: Add ranges like 744000–744999 (Andaman & Nicobar) or
          797000–797999 (Nagaland) to test immediately.
        </div>
      </div>

      {/* Rate Summary */}
      <RateSummary config={config} />

      <Button
        onClick={handleSave}
        className="w-full text-white"
        style={{ backgroundColor: "#006AFF" }}
        data-ocid="logistics.save_button"
      >
        Save Logistics Settings
      </Button>
    </div>
  );
}
