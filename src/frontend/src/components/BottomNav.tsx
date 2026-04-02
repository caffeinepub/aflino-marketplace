import { useCart } from "@/context/CartContext";
import {
  Banknote,
  Home,
  LayoutGrid,
  Package,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLoginRequired: () => void;
  isLoggedIn: boolean;
}

const navItems = [
  { id: "home", label: "Home", icon: Home, requiresAuth: false },
  {
    id: "categories",
    label: "Category",
    icon: LayoutGrid,
    requiresAuth: false,
  },
  {
    id: "affiliate-landing",
    label: "Earn",
    icon: Banknote,
    requiresAuth: false,
    highlight: true,
  },
  { id: "orders", label: "Orders", icon: Package, requiresAuth: true },
  {
    id: "checkout",
    label: "Cart",
    icon: ShoppingCart,
    requiresAuth: false,
    isCart: true,
  },
  { id: "account", label: "Account", icon: UserCircle, requiresAuth: true },
];

export default function BottomNav({
  currentView,
  onNavigate,
  onLoginRequired,
  isLoggedIn,
}: BottomNavProps) {
  const { cartCount } = useCart();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const current = window.scrollY;
        if (current > lastScrollY.current && current > 50) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        lastScrollY.current = current;
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleClick(itemId: string, requiresAuth: boolean) {
    if (requiresAuth && !isLoggedIn) {
      onLoginRequired();
      return;
    }
    onNavigate(itemId);
  }

  const isActive = (itemId: string) => {
    if (itemId === "home") return currentView === "home" || currentView === "";
    return currentView === itemId;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300"
      style={{
        transform: visible ? "translateY(0)" : "translateY(100%)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.4)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      data-ocid="bottom_nav.panel"
    >
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const active = isActive(item.id);
          const Icon = item.icon;
          const count = item.isCart ? cartCount : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id, item.requiresAuth ?? false)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors"
              data-ocid={`bottom_nav.${item.id}.button`}
            >
              {/* Earn highlight glow */}
              {item.highlight && (
                <span
                  className="absolute inset-1 rounded-xl opacity-70"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,106,255,0.12), rgba(236,0,140,0.12))",
                  }}
                />
              )}

              {/* Icon + cart badge */}
              <span className="relative">
                <Icon
                  className="w-5 h-5"
                  style={{ color: active ? "#006AFF" : "#6b7280" }}
                />
                {count > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5"
                    style={{ background: "#EC008C" }}
                    data-ocid="bottom_nav.cart.badge"
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </span>

              {/* Label */}
              <span
                className="hidden min-[360px]:block text-[10px] font-medium leading-none"
                style={{ color: active ? "#006AFF" : "#6b7280" }}
              >
                {item.label}
              </span>

              {/* Active dot */}
              {active && (
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: "#006AFF" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
