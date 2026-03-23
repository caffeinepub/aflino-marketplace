import { Badge } from "@/components/ui/badge";
import { useRole } from "@/context/RoleContext";
import { ArrowLeft, Shield, ShoppingBag, User } from "lucide-react";
import { motion } from "motion/react";

interface LoginPageProps {
  onBack: () => void;
}

const roles = [
  {
    key: "admin" as const,
    title: "Admin",
    description: "Manage vendors, users, and platform settings",
    icon: Shield,
    badge: "Full Access",
    borderColor: "border-blue-500",
    badgeStyle: { backgroundColor: "#006AFF", color: "white" },
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    hoverBg: "hover:bg-blue-50",
  },
  {
    key: "seller" as const,
    title: "Seller",
    description: "Upload products and manage your store",
    icon: ShoppingBag,
    badge: "Seller Portal",
    borderColor: "border-pink-500",
    badgeStyle: { backgroundColor: "#FF1B8D", color: "white" },
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    hoverBg: "hover:bg-pink-50",
  },
  {
    key: "customer" as const,
    title: "Customer",
    description: "Browse products and track your orders",
    icon: User,
    badge: "Buyer Portal",
    borderColor: "border-emerald-500",
    badgeStyle: { backgroundColor: "#059669", color: "white" },
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    hoverBg: "hover:bg-emerald-50",
  },
];

export default function LoginPage({ onBack }: LoginPageProps) {
  const { setRole } = useRole();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      {/* Back Link */}
      <div className="p-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          data-ocid="login.back.button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="text-4xl font-bold tracking-tight mb-3">
            <span style={{ color: "#006AFF" }}>AFL</span>
            <span style={{ color: "#FF1B8D" }}>INO</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Select Your Role
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Choose how you want to access the platform
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-2xl">
          {roles.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.key}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                onClick={() => setRole(role.key)}
                className={`group flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border-2 ${role.borderColor} shadow-sm ${role.hoverBg} transition-all duration-200 cursor-pointer text-center`}
                data-ocid={`login.${role.key}.button`}
              >
                <div
                  className={`w-14 h-14 rounded-full ${role.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-7 h-7 ${role.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {role.title}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {role.description}
                  </p>
                </div>
                <Badge
                  style={role.badgeStyle}
                  className="text-xs border-0 font-medium"
                >
                  {role.badge}
                </Badge>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
