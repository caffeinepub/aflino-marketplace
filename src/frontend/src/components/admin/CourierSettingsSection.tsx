import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Save, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CourierSettingsSection() {
  const [delhivery, setDelhivery] = useState("");
  const [bluedart, setBluedart] = useState("");
  const [shiprocket, setShiprocket] = useState("");
  const [show, setShow] = useState({
    delhivery: false,
    bluedart: false,
    shiprocket: false,
  });
  const [saved, setSaved] = useState(false);

  // Load persisted keys on mount
  useEffect(() => {
    const stored = localStorage.getItem("aflino_courier_keys");
    if (stored) {
      try {
        const keys = JSON.parse(stored) as Record<string, string>;
        if (keys.delhivery) setDelhivery(keys.delhivery);
        if (keys.bluedart) setBluedart(keys.bluedart);
        if (keys.shiprocket) setShiprocket(keys.shiprocket);
        setSaved(true);
      } catch {
        // ignore
      }
    }
  }, []);

  const isConfigured = delhivery || bluedart || shiprocket;

  function handleSave() {
    localStorage.setItem(
      "aflino_courier_keys",
      JSON.stringify({ delhivery, bluedart, shiprocket }),
    );
    setSaved(true);
    toast.success("Courier API keys saved successfully");
  }

  type FieldId = "delhivery" | "bluedart" | "shiprocket";

  const fields: {
    id: FieldId;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }[] = [
    {
      id: "delhivery",
      label: "Delhivery API Key",
      value: delhivery,
      onChange: setDelhivery,
      placeholder: "Enter Delhivery API key...",
    },
    {
      id: "bluedart",
      label: "BlueDart License Key",
      value: bluedart,
      onChange: setBluedart,
      placeholder: "Enter BlueDart License key...",
    },
    {
      id: "shiprocket",
      label: "Shiprocket API Token",
      value: shiprocket,
      onChange: setShiprocket,
      placeholder: "Enter Shiprocket API token...",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5" style={{ color: "#006AFF" }} />
          <h3 className="text-base font-semibold" style={{ color: "#006AFF" }}>
            Logistics Partners
          </h3>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isConfigured && saved
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isConfigured && saved ? "Configured" : "Not Configured"}
        </span>
      </div>

      <p className="text-sm text-gray-500">
        Enter your courier API keys to enable automatic AWB generation and
        logistics partner branding on shipping labels.
      </p>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1.5">
            <Label
              htmlFor={field.id}
              className="text-sm font-medium text-gray-700"
            >
              {field.label}
            </Label>
            <div className="relative">
              <Input
                id={field.id}
                type={show[field.id] ? "text" : "password"}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="pr-10"
                data-ocid={`courier.${field.id}.input`}
              />
              <button
                type="button"
                onClick={() =>
                  setShow((prev) => ({ ...prev, [field.id]: !prev[field.id] }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show[field.id] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSave}
        className="text-white"
        style={{ backgroundColor: "#006AFF" }}
        data-ocid="courier.save_button"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Courier Keys
      </Button>
    </div>
  );
}
