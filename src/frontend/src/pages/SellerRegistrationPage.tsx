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
import { useSellerContext } from "@/context/SellerContext";
import { ArrowLeft, CheckCircle2, Store } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

interface Props {
  onBack: () => void;
}

export default function SellerRegistrationPage({ onBack }: Props) {
  const { registerSeller } = useSellerContext();
  const [form, setForm] = useState({
    businessName: "",
    gstin: "",
    pan: "",
    enrollmentId: "",
    taxType: "gstin" as "gstin" | "enrollmentId",
    email: "",
    phone: "",
    fullAddress: "",
    state: "",
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
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone.trim()))
      e.phone = "Enter a valid 10-digit phone number";
    if (!form.fullAddress.trim())
      e.fullAddress = "Business address is required";
    if (!form.state) e.state = "State is required";
    if (form.taxType === "gstin") {
      if (!form.gstin.trim()) e.gstin = "GSTIN is required";
      if (!form.pan.trim()) e.pan = "PAN is required";
    } else {
      if (!form.enrollmentId.trim())
        e.enrollmentId = "Enrolment ID is required";
    }
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
      gstin: form.taxType === "gstin" ? form.gstin : "",
      pan: form.taxType === "gstin" ? form.pan : "",
      email: form.email,
      phone: form.phone,
      fullAddress: form.fullAddress,
      state: form.state,
      sellerType: form.taxType,
      enrollmentId:
        form.taxType === "enrollmentId" ? form.enrollmentId : undefined,
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
          className="w-full max-w-lg"
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
                {/* Business Name */}
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

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    data-ocid="seller_reg.phone.input"
                  />
                  {errors.phone && (
                    <p
                      className="text-xs text-red-500"
                      data-ocid="seller_reg.phone.error_state"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Full Business Address */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fullAddress"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Business Address{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="fullAddress"
                    rows={3}
                    placeholder="Building/Floor, Street, Area, City - PIN Code"
                    value={form.fullAddress}
                    onChange={(e) => set("fullAddress", e.target.value)}
                    data-ocid="seller_reg.full_address.textarea"
                  />
                  {errors.fullAddress && (
                    <p
                      className="text-xs text-red-500"
                      data-ocid="seller_reg.full_address.error_state"
                    >
                      {errors.fullAddress}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.state}
                    onValueChange={(v) => set("state", v)}
                  >
                    <SelectTrigger data-ocid="seller_reg.state.select">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {INDIAN_STATES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p
                      className="text-xs text-red-500"
                      data-ocid="seller_reg.state.error_state"
                    >
                      {errors.state}
                    </p>
                  )}
                </div>

                {/* Tax Registration Toggle */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Tax Registration <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-col gap-2">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.taxType === "gstin" ? "border-[#006AFF] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                      data-ocid="seller_reg.tax_type_gstin.radio"
                    >
                      <input
                        type="radio"
                        name="taxType"
                        value="gstin"
                        checked={form.taxType === "gstin"}
                        onChange={() => set("taxType", "gstin")}
                        className="mt-0.5 accent-[#006AFF]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Yes, I have GSTIN
                        </p>
                        <p className="text-xs text-gray-500">
                          Recommended — Sell Pan-India
                        </p>
                      </div>
                    </label>
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.taxType === "enrollmentId" ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}
                      data-ocid="seller_reg.tax_type_enrollment.radio"
                    >
                      <input
                        type="radio"
                        name="taxType"
                        value="enrollmentId"
                        checked={form.taxType === "enrollmentId"}
                        onChange={() => set("taxType", "enrollmentId")}
                        className="mt-0.5 accent-orange-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          No, I have Enrolment ID
                        </p>
                        <p className="text-xs text-gray-500">
                          Local state selling only
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* GSTIN + PAN (shown when taxType = gstin) */}
                {form.taxType === "gstin" && (
                  <>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="gstin"
                        className="text-sm font-medium text-gray-700"
                      >
                        GSTIN <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="gstin"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={form.gstin}
                        onChange={(e) =>
                          set("gstin", e.target.value.toUpperCase())
                        }
                        data-ocid="seller_reg.gstin.input"
                      />
                      {errors.gstin && (
                        <p
                          className="text-xs text-red-500"
                          data-ocid="seller_reg.gstin.error_state"
                        >
                          {errors.gstin}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="pan"
                        className="text-sm font-medium text-gray-700"
                      >
                        PAN <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="pan"
                        placeholder="e.g. AAAAA0000A"
                        value={form.pan}
                        onChange={(e) =>
                          set("pan", e.target.value.toUpperCase())
                        }
                        data-ocid="seller_reg.pan.input"
                      />
                      {errors.pan && (
                        <p
                          className="text-xs text-red-500"
                          data-ocid="seller_reg.pan.error_state"
                        >
                          {errors.pan}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Enrolment ID (shown when taxType = enrollmentId) */}
                {form.taxType === "enrollmentId" && (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="enrollmentId"
                      className="text-sm font-medium text-gray-700"
                    >
                      Enrolment ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="enrollmentId"
                      placeholder="e.g. ENR-2024-WB-001234"
                      value={form.enrollmentId}
                      onChange={(e) => set("enrollmentId", e.target.value)}
                      data-ocid="seller_reg.enrollment_id.input"
                    />
                    {errors.enrollmentId && (
                      <p
                        className="text-xs text-red-500"
                        data-ocid="seller_reg.enrollment_id.error_state"
                      >
                        {errors.enrollmentId}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Don&apos;t have an ID?{" "}
                      <a
                        href="https://services.gst.gov.in/services/enrolment-details-ucomm"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#006AFF] hover:underline font-medium"
                        data-ocid="seller_reg.gst_portal.link"
                      >
                        Apply on GST Portal
                      </a>
                    </p>
                  </div>
                )}

                {/* Email */}
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

                {/* Password */}
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

                {/* Confirm Password */}
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
