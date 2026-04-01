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
import { ArrowLeft, Building2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  onLoginClick: () => void;
}

export default function BrandRegister({ onBack, onLoginClick }: Props) {
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
    website: "",
    industry: "",
    budget: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.contactName.trim()) e.contactName = "Contact name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
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
    const accounts: object[] = JSON.parse(
      localStorage.getItem("brandAccounts") || "[]",
    );
    // Check duplicate email
    const existing = (accounts as Array<{ email: string }>).find(
      (a) => a.email === form.email,
    );
    if (existing) {
      setErrors({ email: "An account with this email already exists." });
      setSubmitting(false);
      return;
    }
    accounts.push({
      id: `BRAND-${Date.now()}`,
      companyName: form.companyName,
      contactName: form.contactName,
      email: form.email,
      passwordHash: btoa(form.password),
      website: form.website,
      industry: form.industry,
      budget: form.budget,
      status: "pending",
      registeredAt: new Date().toISOString(),
      campaigns: [],
    });
    localStorage.setItem("brandAccounts", JSON.stringify(accounts));
    setTimeout(() => {
      setSubmitting(false);
      toast.success(
        "Registration successful! Please log in to access your Brand Portal.",
      );
      onLoginClick();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col">
      {/* Brand Portal Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            data-ocid="brandregister.back.button"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span style={{ color: "#006AFF" }}>AFL</span>
              <span style={{ color: "#EC008C" }}>INO</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" style={{ color: "#006AFF" }} />
              Brand Partner Portal
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLoginClick}
          className="text-sm font-medium hover:underline"
          style={{ color: "#006AFF" }}
          data-ocid="brandregister.login_link.button"
        >
          Already registered? Log in
        </button>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-10 w-full max-w-lg">
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#EBF3FF" }}
            >
              <Building2 className="w-7 h-7" style={{ color: "#006AFF" }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Brand Account
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Join AFLINO's brand partner network and start reaching millions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="companyName"
                  className="text-sm font-medium text-gray-700"
                >
                  Company / Brand Name *
                </Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  placeholder="Mamaearth"
                  className="mt-1"
                  data-ocid="brandregister.companyname.input"
                />
                {errors.companyName && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="brandregister.companyname.error_state"
                  >
                    {errors.companyName}
                  </p>
                )}
              </div>
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
                  data-ocid="brandregister.contactname.input"
                />
                {errors.contactName && (
                  <p
                    className="text-xs text-red-500 mt-1"
                    data-ocid="brandregister.contactname.error_state"
                  >
                    {errors.contactName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label
                htmlFor="regEmail"
                className="text-sm font-medium text-gray-700"
              >
                Official Email *
              </Label>
              <Input
                id="regEmail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                className="mt-1"
                data-ocid="brandregister.email.input"
              />
              {errors.email && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="brandregister.email.error_state"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="regPassword"
                className="text-sm font-medium text-gray-700"
              >
                Password *
              </Label>
              <div className="relative mt-1">
                <Input
                  id="regPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Min. 8 characters"
                  className="pr-10"
                  data-ocid="brandregister.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="brandregister.password.error_state"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="regWebsite"
                className="text-sm font-medium text-gray-700"
              >
                Website URL
              </Label>
              <Input
                id="regWebsite"
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yourbrand.com"
                className="mt-1"
                data-ocid="brandregister.website.input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Industry
                </Label>
                <Select
                  value={form.industry}
                  onValueChange={(v) => setForm({ ...form, industry: v })}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="brandregister.industry.select"
                  >
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fmcg">FMCG</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="health">Health & Wellness</SelectItem>
                    <SelectItem value="beauty">
                      Beauty & Personal Care
                    </SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="financial">
                      Financial Services
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Monthly Ad Budget
                </Label>
                <Select
                  value={form.budget}
                  onValueChange={(v) => setForm({ ...form, budget: v })}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="brandregister.budget.select"
                  >
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-25k">Under ₹25K</SelectItem>
                    <SelectItem value="25k-1l">₹25K – ₹1L</SelectItem>
                    <SelectItem value="1l-5l">₹1L – ₹5L</SelectItem>
                    <SelectItem value="5l-plus">₹5L+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-base font-semibold text-white mt-2"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="brandregister.submit.button"
            >
              {submitting ? "Creating Account..." : "Create Brand Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
