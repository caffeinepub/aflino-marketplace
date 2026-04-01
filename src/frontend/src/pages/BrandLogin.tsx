import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  onRegisterClick: () => void;
  onLoginSuccess: (brandId: string) => void;
}

export default function BrandLogin({
  onBack,
  onRegisterClick,
  onLoginSuccess,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    const accounts: Array<{ id: string; email: string; passwordHash: string }> =
      JSON.parse(localStorage.getItem("brandAccounts") || "[]");
    const brand = accounts.find(
      (a) => a.email === email && a.passwordHash === btoa(password),
    );
    setTimeout(() => {
      setLoading(false);
      if (brand) {
        toast.success("Welcome back to AFLINO Brand Portal!");
        onLoginSuccess(brand.id);
      } else {
        setError("Invalid email or password. Please try again.");
        toast.error("Login failed. Check your credentials.");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            data-ocid="brandlogin.back.button"
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
          onClick={onRegisterClick}
          className="text-sm font-medium hover:underline"
          style={{ color: "#006AFF" }}
          data-ocid="brandlogin.register_link.button"
        >
          Register your brand
        </button>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "#EBF3FF" }}
            >
              <ShieldCheck className="w-7 h-7" style={{ color: "#006AFF" }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Brand Partner Login
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Securely access your Brand Dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label
                htmlFor="loginEmail"
                className="text-sm font-medium text-gray-700"
              >
                Official Email
              </Label>
              <Input
                id="loginEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="mt-1"
                data-ocid="brandlogin.email.input"
              />
            </div>
            <div>
              <Label
                htmlFor="loginPassword"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  data-ocid="brandlogin.password.input"
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
            </div>

            {error && (
              <div
                className="bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 text-sm text-red-600"
                data-ocid="brandlogin.error_state"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-semibold text-white"
              style={{ backgroundColor: "#006AFF" }}
              data-ocid="brandlogin.submit.button"
            >
              {loading ? "Signing In..." : "Sign In to Brand Portal"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              New to AFLINO Brands?{" "}
              <button
                type="button"
                onClick={onRegisterClick}
                className="font-semibold hover:underline"
                style={{ color: "#006AFF" }}
                data-ocid="brandlogin.register.button"
              >
                Register as Brand Partner
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
