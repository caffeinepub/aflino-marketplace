import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { logEmail } from "@/utils/communicationLogger";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type AuthView = "login" | "register" | null;

interface AuthModalProps {
  view: AuthView;
  onClose: () => void;
  onSwitchView: (v: AuthView) => void;
}

export default function AuthModal({
  view,
  onClose,
  onSwitchView,
}: AuthModalProps) {
  const { login, loginStatus } = useInternetIdentity();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLoggingIn = loginStatus === "logging-in";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login();
      if (view === "register") {
        logEmail(
          "welcome",
          email || "new.user@aflino.com",
          "Welcome to AFLINO Local - Your account is ready!",
          "",
        );
      }
      toast.success(
        view === "login" ? "Logged in successfully!" : "Account created!",
      );
      onClose();
    } catch {
      toast.error("Authentication failed. Please try again.");
    }
  };

  return (
    <Dialog open={view !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden rounded-2xl"
        data-ocid="auth.dialog"
      >
        <div
          className="h-1.5"
          style={{ background: "linear-gradient(to right, #006AFF, #FF1B8D)" }}
        />

        <div className="px-8 py-6">
          <DialogHeader className="mb-6">
            <div className="text-center mb-2">
              <span className="text-2xl font-bold">
                <span style={{ color: "#006AFF" }}>AFL</span>
                <span style={{ color: "#FF1B8D" }}>INO</span>
              </span>
            </div>
            <DialogTitle className="text-xl font-bold text-center text-gray-900">
              {view === "login" ? "Welcome Back" : "Create Account"}
            </DialogTitle>
            <p className="text-sm text-gray-500 text-center">
              {view === "login"
                ? "Sign in to continue shopping"
                : "Join thousands of happy shoppers"}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === "register" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 rounded-xl"
                    required
                    data-ocid="auth.input"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 rounded-xl"
                  required
                  data-ocid="auth.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 rounded-xl"
                  required
                  data-ocid="auth.input"
                />
              </div>
            </div>

            {view === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs font-medium"
                  style={{ color: "#006AFF" }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-full h-11 text-sm font-semibold text-white mt-2"
              style={{
                backgroundColor: view === "register" ? "#FF1B8D" : "#006AFF",
              }}
              data-ocid="auth.submit_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait…
                </>
              ) : view === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            {view === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="font-semibold"
                  style={{ color: "#FF1B8D" }}
                  onClick={() => onSwitchView("register")}
                  data-ocid="auth.link"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-semibold"
                  style={{ color: "#006AFF" }}
                  onClick={() => onSwitchView("login")}
                  data-ocid="auth.link"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
