import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Code2,
  Database,
  Globe,
  Key,
  Lock,
  Mail,
  Server,
  Webhook,
  Zap,
} from "lucide-react";

interface ApiPartnersPageProps {
  onBack: () => void;
}

const features = [
  {
    icon: Database,
    title: "Product Catalog API",
    desc: "Full access to 50,000+ products with real-time pricing, inventory, and variants.",
    color: "#006AFF",
    bg: "#EEF4FF",
  },
  {
    icon: Webhook,
    title: "Order Webhooks",
    desc: "Receive live order events (placed, shipped, delivered) via webhooks.",
    color: "#7C3AED",
    bg: "#F5F0FF",
  },
  {
    icon: Globe,
    title: "Affiliate Tracking",
    desc: "Programmatic affiliate link generation with UTM and 30-day cookie tracking.",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    icon: Server,
    title: "Inventory Sync",
    desc: "Real-time stock levels and low-stock alerts for seamless catalog sync.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: Key,
    title: "Secure Auth",
    desc: "OAuth 2.0 and API key authentication with per-key permission scopes.",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    icon: Code2,
    title: "REST + JSON",
    desc: "Clean, well-documented REST API with JSON responses and OpenAPI spec.",
    color: "#EC008C",
    bg: "#FFF0F7",
  },
];

const timeline = [
  {
    icon: BookOpen,
    phase: "Phase 1",
    label: "OpenAPI Documentation",
    eta: "Q3 2026",
  },
  {
    icon: Key,
    phase: "Phase 2",
    label: "Developer API Keys & Portal",
    eta: "Q3 2026",
  },
  {
    icon: Webhook,
    phase: "Phase 3",
    label: "Webhook Events (Orders, Inventory)",
    eta: "Q4 2026",
  },
  {
    icon: Lock,
    phase: "Phase 4",
    label: "OAuth 2.0 + Rate Limiting",
    eta: "Q4 2026",
  },
  { icon: Zap, phase: "Phase 5", label: "Public Beta Launch", eta: "Q1 2027" },
];

export default function ApiPartnersPage({ onBack }: ApiPartnersPageProps) {
  function handleNotify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector("input[type='email']") as HTMLInputElement;
    if (input) {
      alert(
        `Thank you! We'll notify ${input.value} when the AFLINO API is available.`,
      );
      form.reset();
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="py-20 px-6 text-center"
        style={{
          background: "linear-gradient(135deg, #1C1C2E 0%, #0A0A1A 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border"
            style={{
              borderColor: "#006AFF40",
              color: "#60A5FA",
              backgroundColor: "#006AFF10",
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            Coming Soon — Developer Preview
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Build on AFLINO with our{" "}
            <span style={{ color: "#006AFF" }}>Powerful API</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Connect your platforms, apps, and services to India's
            fastest-growing multi-vendor marketplace. Access products, orders,
            affiliates, and more.
          </p>
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="rounded-full px-6 h-10 text-sm font-semibold border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            ← Back to AFLINO
          </Button>
        </div>
      </section>

      {/* What's coming */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Planned API Features
          </h2>
          <p className="text-sm text-gray-500 text-center mb-10">
            A complete developer platform to build powerful integrations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: f.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {f.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Development Roadmap
          </h2>
          <p className="text-sm text-gray-500 text-center mb-10">
            Estimated release timeline
          </p>
          <div className="space-y-4">
            {timeline.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.phase}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-200 shadow-xs"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: i === 0 ? "#EEF4FF" : "#F3F4F6" }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: i === 0 ? "#006AFF" : "#9CA3AF" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {item.phase}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.label}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: i === 0 ? "#EEF4FF" : "#F3F4F6",
                      color: i === 0 ? "#006AFF" : "#6B7280",
                    }}
                  >
                    {item.eta}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Early access signup */}
      <section
        className="py-16 px-6 text-center"
        style={{
          background: "linear-gradient(135deg, #006AFF 0%, #0052CC 100%)",
        }}
      >
        <div className="max-w-xl mx-auto">
          <Mail className="w-10 h-10 text-white mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Get Early Access
          </h2>
          <p className="text-blue-100 text-sm mb-7">
            Be the first to know when the AFLINO Developer API launches. We'll
            send you the docs and a free API key.
          </p>
          <form
            onSubmit={handleNotify}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="your@email.com"
              required
              className="flex-1 rounded-full px-5 py-2.5 text-sm text-gray-900 bg-white outline-none border-2 border-transparent focus:border-yellow-400 transition-colors"
            />
            <Button
              type="submit"
              className="rounded-full px-6 h-10 text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: "#EC008C", color: "white" }}
            >
              Notify Me
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
          <p className="text-xs text-blue-200 mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
