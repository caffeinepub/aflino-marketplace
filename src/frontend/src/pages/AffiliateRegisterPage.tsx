import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAffiliate } from "@/context/AffiliateContext";
import {
  CheckCircle2,
  ChevronRight,
  Copy,
  Gift,
  Link2,
  Percent,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  onLoginClick: () => void;
}

const PLATFORMS = ["Instagram", "YouTube", "Blog", "Twitter", "Other"];

export default function AffiliateRegisterPage({ onBack, onLoginClick }: Props) {
  const { registerAffiliate, affiliates } = useAffiliate();
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [socialLinks, setSocialLinks] = useState([
    { platform: "Instagram", url: "" },
  ]);

  // Step 2
  const [idType, setIdType] = useState<"pan" | "aadhaar">("pan");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idSizeKB, setIdSizeKB] = useState(0);
  const [idDataUrl, setIdDataUrl] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");

  function addSocialLink() {
    if (socialLinks.length >= 3) return;
    setSocialLinks((prev) => [...prev, { platform: "Instagram", url: "" }]);
  }

  function removeSocialLink(i: number) {
    setSocialLinks((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateSocialLink(i: number, field: "platform" | "url", val: string) {
    setSocialLinks((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)),
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    const kb = Math.round(file.size / 1024);
    setIdSizeKB(kb);
    const reader = new FileReader();
    reader.onload = (ev) => setIdDataUrl((ev.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    const id = registerAffiliate({
      name,
      email,
      phone,
      socialLinks,
      idProof: {
        name: idFile?.name ?? "document",
        sizeKB: idSizeKB,
        url: idDataUrl,
        type: idType,
      },
      bankDetails: { accountNo, ifsc, bankName },
    });
    const newAffiliate = affiliates.find((a) => a.id === id);
    // Since state is async, generate code from last registered
    const code =
      newAffiliate?.referralCode ??
      `AFF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setReferralCode(code);
    setSubmitted(true);
    toast.success("Application submitted!");
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
          data-ocid="affiliate.success_state"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h2>
          <p className="text-gray-500 mb-6">
            You'll be notified within 24–48 hours after our team reviews your
            KYC documents.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">
              Your Referral Code (available after approval)
            </p>
            <p
              className="text-2xl font-bold tracking-widest"
              style={{ color: "#006AFF" }}
            >
              {referralCode}
            </p>
          </div>
          <Button
            className="w-full rounded-full text-white font-semibold"
            style={{ backgroundColor: "#006AFF" }}
            onClick={onLoginClick}
            data-ocid="affiliate.login.button"
          >
            Go to Affiliate Login
          </Button>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 text-sm text-gray-400 hover:text-gray-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = ((step - 1) / 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-bold">
            <span style={{ color: "#006AFF" }}>AFL</span>
            <span style={{ color: "#EC008C" }}>INO</span>
            <span className="ml-2 text-sm font-normal text-gray-400">
              Affiliate Program
            </span>
          </span>
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-700"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">
                Why Join AFLINO?
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EEF4FF" }}
                  >
                    <Percent className="w-4 h-4" style={{ color: "#006AFF" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      Up to 8% Commission
                    </p>
                    <p className="text-xs text-gray-500">
                      Earn more as a Creator tier affiliate
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "#FFF0F8" }}
                  >
                    <Link2 className="w-4 h-4" style={{ color: "#EC008C" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      30-Day Cookie Tracking
                    </p>
                    <p className="text-xs text-gray-500">
                      Earn on purchases up to 30 days after click
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "#F0FFF4" }}
                  >
                    <Gift className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      Developer API Access
                    </p>
                    <p className="text-xs text-gray-500">
                      High performers unlock product catalog API
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-4 space-y-2">
              {["Personal Info", "KYC Documents", "Review & Submit"].map(
                (label, i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 p-3 rounded-xl ${step === i + 1 ? "bg-white shadow-sm" : ""}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        step > i + 1
                          ? "bg-green-500 text-white"
                          : step === i + 1
                            ? "text-white"
                            : "bg-gray-100 text-gray-400"
                      }`}
                      style={
                        step === i + 1 ? { backgroundColor: "#006AFF" } : {}
                      }
                    >
                      {step > i + 1 ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${step === i + 1 ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {label}
                    </span>
                  </div>
                ),
              )}
            </div>
          </aside>

          {/* Main form */}
          <main className="md:col-span-2">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Step {step} of 3</span>
                <span>{Math.round(progressPercent)}% complete</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: "#006AFF",
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              {step === 1 && (
                <div
                  className="space-y-5"
                  data-ocid="affiliate_register.step1.panel"
                >
                  <h2 className="text-xl font-bold text-gray-900">
                    Personal Information
                  </h2>
                  <div className="grid gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="mt-1"
                        data-ocid="affiliate_register.name.input"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="mt-1"
                          data-ocid="affiliate_register.email.input"
                        />
                      </div>
                      <div>
                        <Label>Phone *</Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="mt-1"
                          data-ocid="affiliate_register.phone.input"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Social Links</Label>
                      {socialLinks.length < 3 && (
                        <button
                          type="button"
                          onClick={addSocialLink}
                          className="text-xs flex items-center gap-1"
                          style={{ color: "#006AFF" }}
                        >
                          <Plus className="w-3 h-3" /> Add Link
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {socialLinks.map((link, i) => (
                        <div
                          key={`${link.platform}-${link.url}-${i}`}
                          className="flex gap-2"
                        >
                          <select
                            value={link.platform}
                            onChange={(e) =>
                              updateSocialLink(i, "platform", e.target.value)
                            }
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white text-gray-700"
                          >
                            {PLATFORMS.map((p) => (
                              <option key={p}>{p}</option>
                            ))}
                          </select>
                          <Input
                            value={link.url}
                            onChange={(e) =>
                              updateSocialLink(i, "url", e.target.value)
                            }
                            placeholder="https://..."
                            className="flex-1"
                            data-ocid={`affiliate_register.social.input.${i + 1}`}
                          />
                          {socialLinks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSocialLink(i)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-full text-white font-semibold"
                    style={{ backgroundColor: "#006AFF" }}
                    onClick={() => {
                      if (!name || !email || !phone) {
                        toast.error("Please fill all required fields");
                        return;
                      }
                      setStep(2);
                    }}
                    data-ocid="affiliate_register.next_step1.button"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div
                  className="space-y-5"
                  data-ocid="affiliate_register.step2.panel"
                >
                  <h2 className="text-xl font-bold text-gray-900">
                    KYC Documents
                  </h2>

                  <div>
                    <Label>ID Type *</Label>
                    <div className="flex gap-3 mt-2">
                      {(["pan", "aadhaar"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setIdType(t)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                            idType === t
                              ? "text-white border-transparent"
                              : "border-gray-200 text-gray-600"
                          }`}
                          style={
                            idType === t ? { backgroundColor: "#006AFF" } : {}
                          }
                        >
                          {t === "pan" ? "PAN Card" : "Aadhaar Card"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>
                      Upload {idType === "pan" ? "PAN" : "Aadhaar"} Image *
                    </Label>
                    <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-blue-400 transition-colors">
                      <Upload className="w-7 h-7 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        Click to upload image
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        JPG, PNG accepted
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        data-ocid="affiliate_register.id_upload.upload_button"
                      />
                    </label>
                    {idFile && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-600">
                          {idFile.name} — {idSizeKB} KB
                        </p>
                        {idSizeKB < 150 && (
                          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <span className="text-amber-600 text-sm">
                              ⚠ Low Quality Document — Admin may request a
                              higher resolution scan
                            </span>
                          </div>
                        )}
                        {idDataUrl && (
                          <img
                            src={idDataUrl}
                            alt="ID Preview"
                            className="w-full max-h-40 object-contain rounded-lg border"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Bank Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <Label>Account Number *</Label>
                        <Input
                          value={accountNo}
                          onChange={(e) => setAccountNo(e.target.value)}
                          placeholder="1234567890"
                          className="mt-1"
                          data-ocid="affiliate_register.account_no.input"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <Label>IFSC Code *</Label>
                          <Input
                            value={ifsc}
                            onChange={(e) => setIfsc(e.target.value)}
                            placeholder="HDFC0001234"
                            className="mt-1"
                            data-ocid="affiliate_register.ifsc.input"
                          />
                        </div>
                        <div>
                          <Label>Bank Name *</Label>
                          <Input
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="HDFC Bank"
                            className="mt-1"
                            data-ocid="affiliate_register.bank_name.input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => setStep(1)}
                      data-ocid="affiliate_register.back_step2.button"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 rounded-full text-white font-semibold"
                      style={{ backgroundColor: "#006AFF" }}
                      onClick={() => {
                        if (!idFile || !accountNo || !ifsc || !bankName) {
                          toast.error("Please complete all fields");
                          return;
                        }
                        setStep(3);
                      }}
                      data-ocid="affiliate_register.next_step2.button"
                    >
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div
                  className="space-y-5"
                  data-ocid="affiliate_register.step3.panel"
                >
                  <h2 className="text-xl font-bold text-gray-900">
                    Review & Submit
                  </h2>

                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Personal Info
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-500">Name</span>
                        <span className="font-medium text-gray-900">
                          {name}
                        </span>
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-900">
                          {email}
                        </span>
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium text-gray-900">
                          {phone}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Social Links
                      </p>
                      {socialLinks
                        .filter((l) => l.url)
                        .map((l) => (
                          <p
                            key={`${l.platform}-${l.url}`}
                            className="text-sm text-gray-700"
                          >
                            {l.platform}: {l.url}
                          </p>
                        ))}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        KYC & Banking
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-500">ID Type</span>
                        <span className="font-medium text-gray-900 uppercase">
                          {idType}
                        </span>
                        <span className="text-gray-500">Document</span>
                        <span className="font-medium text-gray-900">
                          {idFile?.name ?? "—"}
                          {idSizeKB < 150 && idFile && (
                            <span className="ml-2 text-amber-500 text-xs">
                              ⚠ Low Quality
                            </span>
                          )}
                        </span>
                        <span className="text-gray-500">Bank</span>
                        <span className="font-medium text-gray-900">
                          {bankName}
                        </span>
                        <span className="text-gray-500">IFSC</span>
                        <span className="font-medium text-gray-900">
                          {ifsc}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="confirm"
                      checked={confirmed}
                      onCheckedChange={(v) => setConfirmed(!!v)}
                      data-ocid="affiliate_register.confirm.checkbox"
                    />
                    <Label
                      htmlFor="confirm"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      I confirm all details are accurate and agree to AFLINO's
                      affiliate terms.
                    </Label>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => setStep(2)}
                      data-ocid="affiliate_register.back_step3.button"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1 rounded-full text-white font-semibold"
                      style={{ backgroundColor: "#006AFF" }}
                      disabled={!confirmed}
                      onClick={handleSubmit}
                      data-ocid="affiliate_register.submit.button"
                    >
                      Submit Application
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
