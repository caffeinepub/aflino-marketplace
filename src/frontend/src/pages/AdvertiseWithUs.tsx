import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BarChart2,
  CheckCircle,
  Grid3X3,
  Languages,
  Layout,
  MapPin,
  Monitor,
  Package,
  Search,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  onBrandLoginClick: () => void;
  onBrandRegisterClick: () => void;
}

const AD_SLOTS = [
  {
    name: "Homepage Hero Banner",
    placement: "Top of Homepage",
    dimensions: "1200×200 px",
    impressions: "~8,00,000 / month",
    cpm: "₹180",
    icon: Monitor,
  },
  {
    name: "Search Sidebar",
    placement: "Search Results Page",
    dimensions: "300×600 px",
    impressions: "~3,50,000 / month",
    cpm: "₹220",
    icon: Search,
  },
  {
    name: "Category Top Banner",
    placement: "Category Listing",
    dimensions: "970×90 px",
    impressions: "~4,20,000 / month",
    cpm: "₹150",
    icon: Grid3X3,
  },
  {
    name: "Cart Page Promo",
    placement: "Checkout / Cart",
    dimensions: "600×100 px",
    impressions: "~2,10,000 / month",
    cpm: "₹260",
    icon: ShoppingCart,
  },
  {
    name: "Product Detail Sidebar",
    placement: "Product Pages",
    dimensions: "300×250 px",
    impressions: "~5,60,000 / month",
    cpm: "₹200",
    icon: Package,
  },
  {
    name: "Mobile App Banner",
    placement: "PWA / Mobile",
    dimensions: "360×80 px",
    impressions: "~6,30,000 / month",
    cpm: "₹170",
    icon: Smartphone,
  },
];

const REACH_STATS = [
  { value: "10M+", label: "Monthly Visitors", icon: Users },
  { value: "500K+", label: "Daily Orders", icon: ShoppingCart },
  { value: "2,000+", label: "Pin Codes Served", icon: MapPin },
  { value: "28", label: "Languages Supported", icon: Languages },
];

const WHY_CARDS = [
  {
    icon: BarChart2,
    title: "Targeted Reach",
    desc: "Reach millions of active shoppers segmented by category, location, and purchase intent. Your ads appear when buyers are most ready to convert.",
  },
  {
    icon: Layout,
    title: "Premium Placement",
    desc: "Occupy high-visibility real estate — hero banners, search sidebars, product pages. Placements designed for maximum brand recall.",
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    desc: "Track impressions, clicks, and conversions live. Optimize campaigns with full visibility into every rupee spent.",
  },
];

export default function AdvertiseWithUs({
  onBack,
  onBrandLoginClick,
  onBrandRegisterClick,
}: Props) {
  const [form, setForm] = useState({
    brandName: "",
    website: "",
    contactName: "",
    email: "",
    phone: "",
    budget: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const scrollToForm = () => {
    document
      .getElementById("contact-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.brandName.trim()) e.brandName = "Brand name is required";
    if (!form.contactName.trim()) e.contactName = "Contact name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = "Invalid email";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    const leads: object[] = JSON.parse(
      localStorage.getItem("brandLeads") || "[]",
    );
    leads.push({
      id: `BL-${Date.now()}`,
      brandName: form.brandName,
      website: form.website,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      budget: form.budget,
      message: form.message,
      submittedAt: new Date().toISOString(),
      status: "new",
    });
    localStorage.setItem("brandLeads", JSON.stringify(leads));
    setTimeout(() => {
      setSubmitting(false);
      setForm({
        brandName: "",
        website: "",
        contactName: "",
        email: "",
        phone: "",
        budget: "",
        message: "",
      });
      setErrors({});
      toast.success(
        "Your inquiry has been submitted! We'll contact you within 24 hours.",
      );
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #006AFF 0%, #0045CC 60%, #EC008C 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <button
            type="button"
            onClick={onBack}
            className="absolute top-6 left-6 flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
            data-ocid="advertise.back.button"
          >
            <ArrowLeft className="w-4 h-4" /> Back to AFLINO
          </button>
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" /> India's Fastest Growing Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Reach <span className="text-yellow-300">10M+</span> Shoppers
            <br />
            on AFLINO
          </h1>
          <p className="text-white/85 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Put your brand in front of millions of active buyers across India.
            Premium ad placements, real-time analytics, and dedicated campaign
            support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="button"
              onClick={scrollToForm}
              className="px-8 py-3 text-base font-semibold bg-white text-blue-700 hover:bg-yellow-300 hover:text-blue-900 transition-all shadow-lg"
              data-ocid="advertise.start_advertising.button"
            >
              Start Advertising
            </Button>
            <Button
              type="button"
              onClick={onBrandLoginClick}
              variant="outline"
              className="px-8 py-3 text-base font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-700 transition-all bg-transparent"
              data-ocid="advertise.brand_login.button"
            >
              Brand Login
            </Button>
          </div>
        </div>
      </section>

      {/* Reach Stats */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {REACH_STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#EBF3FF" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#006AFF" }} />
                  </div>
                </div>
                <p
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: "#006AFF" }}
                >
                  {value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Advertise */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Why Advertise on AFLINO?
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Partner with India's most trusted multi-vendor marketplace and grow
            your brand with precision.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: "#EBF3FF" }}
              >
                <Icon className="w-6 h-6" style={{ color: "#006AFF" }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ad Slots Gallery */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Ad Slot Gallery
            </h2>
            <p className="text-gray-500">
              Choose the placement that best fits your campaign objectives.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AD_SLOTS.map(
              ({
                name,
                placement,
                dimensions,
                impressions,
                cpm,
                icon: Icon,
              }) => (
                <div
                  key={name}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "#EBF3FF" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "#006AFF" }} />
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs text-gray-600"
                    >
                      {placement}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-3">
                    {name}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium text-white"
                        style={{ backgroundColor: "#006AFF" }}
                      >
                        {dimensions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Impressions</span>
                      <span className="font-semibold text-gray-800">
                        {impressions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Floor CPM</span>
                      <span
                        className="font-bold text-lg"
                        style={{ color: "#006AFF" }}
                      >
                        {cpm}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={scrollToForm}
                    variant="outline"
                    className="w-full text-sm font-semibold group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                    style={{ borderColor: "#006AFF", color: "#006AFF" }}
                    data-ocid="advertise.get_slot.button"
                  >
                    Get This Slot
                  </Button>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <CheckCircle className="w-3.5 h-3.5" /> Get a Custom Quote
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Start Your Campaign
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Fill in your details and our ad sales team will reach out within
              24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="brandName"
                  className="text-sm font-medium text-gray-700"
                >
                  Brand Name *
                </Label>
                <Input
                  id="brandName"
                  value={form.brandName}
                  onChange={(e) =>
                    setForm({ ...form, brandName: e.target.value })
                  }
                  placeholder="e.g. Mamaearth"
                  className="mt-1"
                  data-ocid="advertise.brandname.input"
                />
                {errors.brandName && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="advertise.brandname.error_state"
                  >
                    {errors.brandName}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="website"
                  className="text-sm font-medium text-gray-700"
                >
                  Website URL
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  placeholder="https://yourbrand.com"
                  className="mt-1"
                  data-ocid="advertise.website.input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="contactName"
                  className="text-sm font-medium text-gray-700"
                >
                  Contact Person *
                </Label>
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) =>
                    setForm({ ...form, contactName: e.target.value })
                  }
                  placeholder="Full Name"
                  className="mt-1"
                  data-ocid="advertise.contactname.input"
                />
                {errors.contactName && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="advertise.contactname.error_state"
                  >
                    {errors.contactName}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-1"
                  data-ocid="advertise.phone.input"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Official Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="mt-1"
                data-ocid="advertise.email.input"
              />
              {errors.email && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="advertise.email.error_state"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Expected Monthly Budget
              </Label>
              <Select
                value={form.budget}
                onValueChange={(v) => setForm({ ...form, budget: v })}
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="advertise.budget.select"
                >
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-25k">Under ₹25,000</SelectItem>
                  <SelectItem value="25k-1l">₹25K – ₹1L</SelectItem>
                  <SelectItem value="1l-5l">₹1L – ₹5L</SelectItem>
                  <SelectItem value="5l-plus">₹5L+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="message"
                className="text-sm font-medium text-gray-700"
              >
                Message / Campaign Goals
              </Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your campaign objectives, target audience, preferred ad slots..."
                rows={3}
                className="mt-1 resize-none"
                data-ocid="advertise.message.textarea"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-base font-semibold text-white"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="advertise.submit.button"
            >
              {submitting ? "Submitting..." : "Send Inquiry"}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        }}
        className="py-14"
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to grow your brand?
          </h2>
          <p className="text-white/60 mb-8">
            Join hundreds of brands already advertising on AFLINO.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="button"
              onClick={onBrandRegisterClick}
              className="px-8 py-3 font-semibold text-white"
              style={{ backgroundColor: "#EC008C" }}
              data-ocid="advertise.register_brand.button"
            >
              Register as Brand Partner
            </Button>
            <Button
              type="button"
              onClick={scrollToForm}
              variant="outline"
              className="px-8 py-3 font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all bg-transparent"
              data-ocid="advertise.contact_sales.button"
            >
              Contact Sales Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
