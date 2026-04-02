import { Button } from "@/components/ui/button";
import {
  Award,
  BarChart3,
  CheckCircle,
  ChevronRight,
  DollarSign,
  Globe,
  Link,
  Share2,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface AffiliateLandingPageProps {
  onRegisterClick: () => void;
  onLoginClick: () => void;
  onBack: () => void;
}

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Up to 20% Commission",
    desc: "Category-based tiered commissions, paid directly to your wallet.",
    color: "#006AFF",
    bg: "#EEF4FF",
  },
  {
    icon: Globe,
    title: "30-Day Cookie Tracking",
    desc: "Every referral is tracked for 30 days — you earn even if they buy later.",
    color: "#EC008C",
    bg: "#FFF0F7",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Track clicks, conversions, and earnings from your personal dashboard.",
    color: "#7C3AED",
    bg: "#F5F0FF",
  },
  {
    icon: Zap,
    title: "Instant Link Generation",
    desc: "One-click affiliate links for every product on AFLINO.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payouts",
    desc: "Verified commissions are auto-released after a 10-day return window.",
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    icon: Award,
    title: "Creator Tier Bonuses",
    desc: "Reach Creator status for higher commission rates and exclusive perks.",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
];

const steps = [
  { icon: Users, label: "Register & Get KYC Approved", num: "01" },
  { icon: Link, label: "Copy Affiliate Links for Products", num: "02" },
  { icon: Share2, label: "Share on Social Media / YouTube", num: "03" },
  { icon: DollarSign, label: "Earn Commission on Every Sale", num: "04" },
];

const stats = [
  { label: "Active Affiliates", value: "12,000+" },
  { label: "Products to Promote", value: "50,000+" },
  { label: "Avg Monthly Earnings", value: "₹18,000" },
  { label: "Commission Rate", value: "Up to 20%" },
];

export default function AffiliateLandingPage({
  onRegisterClick,
  onLoginClick,
  onBack,
}: AffiliateLandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="py-20 px-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, #006AFF 0%, #0052CC 50%, #003D99 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Star className="w-3.5 h-3.5" />
            India's Fastest Growing Affiliate Program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Earn Money by Promoting{" "}
            <span style={{ color: "#FFD700" }}>AFLINO Products</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 12,000+ creators, bloggers, and influencers who earn passive
            income by sharing products they love. No investment required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              onClick={onRegisterClick}
              className="rounded-full px-8 h-12 text-base font-bold text-white shadow-lg"
              style={{ backgroundColor: "#EC008C" }}
            >
              Join as Affiliate — Free
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              type="button"
              onClick={onLoginClick}
              variant="outline"
              className="rounded-full px-8 h-12 text-base font-semibold bg-white/10 border-white/40 text-white hover:bg-white/20"
            >
              Already an Affiliate? Login
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "#006AFF" }}
              >
                {s.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Why Affiliates Choose AFLINO
          </h2>
          <p className="text-sm text-gray-500 text-center mb-10">
            Transparent, high-paying, and simple to use
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: b.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: b.color }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {b.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            How It Works
          </h2>
          <p className="text-sm text-gray-500 text-center mb-10">
            Start earning in 4 simple steps
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: "#EEF4FF" }}
                    >
                      <Icon className="w-6 h-6" style={{ color: "#006AFF" }} />
                    </div>
                    <span
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: "#EC008C" }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 leading-snug">
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commission table */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Commission Rates
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            Higher tier = higher earnings
          </p>
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-700">
                    Normal
                  </th>
                  <th
                    className="text-right px-5 py-3 font-semibold"
                    style={{ color: "#006AFF" }}
                  >
                    Creator
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["Electronics", "5%", "8%"],
                  ["Fashion", "10%", "15%"],
                  ["Beauty", "12%", "18%"],
                  ["Home & Kitchen", "8%", "12%"],
                  ["Sports", "7%", "10%"],
                  ["Books & Education", "6%", "10%"],
                ].map(([cat, normal, creator]) => (
                  <tr key={cat} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-800 font-medium">
                      {cat}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {normal}
                    </td>
                    <td
                      className="px-5 py-3 text-right font-bold"
                      style={{ color: "#006AFF" }}
                    >
                      {creator}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            * Commissions hold for 10 days (return window) before becoming
            withdrawable.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-16 px-6 text-center"
        style={{
          background: "linear-gradient(135deg, #EC008C 0%, #c2006f 100%)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <TrendingUp className="w-10 h-10 text-white mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Start Earning?
          </h2>
          <p className="text-pink-100 text-sm mb-7">
            Join AFLINO's Affiliate Program today. Free to join, no minimum
            payout.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              onClick={onRegisterClick}
              className="rounded-full px-8 h-11 text-sm font-bold bg-white hover:bg-gray-50"
              style={{ color: "#EC008C" }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Create Free Account
            </Button>
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="rounded-full px-8 h-11 text-sm font-semibold bg-transparent border-white/40 text-white hover:bg-white/10"
            >
              Back to AFLINO
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
