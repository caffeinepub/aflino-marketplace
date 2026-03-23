import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSellerContext } from "@/context/SellerContext";
import { ArrowLeft, CheckCircle2, Store } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onBack: () => void;
}

export default function SellerRegistrationPage({ onBack }: Props) {
  const { registerSeller } = useSellerContext();
  const [form, setForm] = useState({
    businessName: "",
    gst: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.businessName.trim()) e.businessName = "Business name is required";
    if (!form.gst.trim()) e.gst = "GST number is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.password) e.password = "Password is required";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    registerSeller({
      businessName: form.businessName,
      gst: form.gst,
      email: form.email,
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            data-ocid="seller_reg.back.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-2xl font-bold tracking-tight">
            <span style={{ color: "#006AFF" }}>AFL</span>
            <span style={{ color: "#FF1B8D" }}>INO</span>
          </span>
          <span className="text-sm text-gray-400">/ Seller Registration</span>
        </div>
      </header>

      <main className="pt-[72px] flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center"
              data-ocid="seller_reg.success_state"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Registration Submitted!
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Your application is pending admin approval. You'll be notified
                once approved.
              </p>
              <Button
                type="button"
                onClick={onBack}
                className="rounded-full px-8 text-white font-semibold"
                style={{ backgroundColor: "#006AFF" }}
                data-ocid="seller_reg.back_home.button"
              >
                Back to Home
              </Button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#EEF4FF" }}
                >
                  <Store className="w-5 h-5" style={{ color: "#006AFF" }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Become a Seller
                  </h1>
                  <p className="text-xs text-gray-400">
                    Fill in your business details
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="businessName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="e.g. TechZone Store"
                    value={form.businessName}
                    onChange={(e) => set("businessName", e.target.value)}
                    data-ocid="seller_reg.business_name.input"
                  />
                  {errors.businessName && (
                    <p
                      className="text-xs text-red-500"
                      data-ocid="seller_reg.business_name.error_state"
                    >
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="gst"
                    className="text-sm font-medium text-gray-700"
                  >
                    GST Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="gst"
                    placeholder="e.g. 27ABCDE1234F1Z5"
                    value={form.gst}
                    onChange={(e) => set("gst", e.target.value)}
                    data-ocid="seller_reg.gst.input"
                  />
                  {errors.gst && (
                    <p
                      className="text-xs text-red-500"
                      data-ocid="seller_reg.gst.error_state"
                    >
                      {errors.gst}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@email.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    data-ocid="seller_reg.email.input"
                  />
                  {errors.email && (
                    <p
                      className="text-xs text-red-500"
                      data-ocid="seller_reg.email.error_state"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    data-ocid="seller_reg.password.input"
                  />
                  {errors.password && (
                    <p
                      className="text-xs text-red-500"
                      data-ocid="seller_reg.password.error_state"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    data-ocid="seller_reg.confirm_password.input"
                  />
                  {errors.confirmPassword && (
                    <p
                      className="text-xs text-red-500"
                      data-ocid="seller_reg.confirm_password.error_state"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2 rounded-full text-white font-semibold"
                  style={{ backgroundColor: "#006AFF" }}
                  data-ocid="seller_reg.submit_button"
                >
                  Submit Registration
                </Button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Already a seller?{" "}
                <button
                  type="button"
                  onClick={onBack}
                  className="text-blue-500 hover:underline"
                >
                  Login here
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
