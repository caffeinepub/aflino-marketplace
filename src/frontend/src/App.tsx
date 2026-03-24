import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import { OrderTrackingProvider } from "@/context/OrderTrackingContext";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { SellerProvider } from "@/context/SellerContext";
import { WalletProvider } from "@/context/WalletContext";
import AdminDashboard from "@/pages/AdminDashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import LoginPage from "@/pages/LoginPage";
import SellerDashboard from "@/pages/SellerDashboard";
import SellerRegistrationPage from "@/pages/SellerRegistrationPage";
import { useState } from "react";

type View = "home" | "login" | "seller-register";

function AppContent() {
  const { role } = useRole();
  const [view, setView] = useState<View>("home");

  if (role === "admin") return <AdminDashboard />;
  if (role === "seller") return <SellerDashboard />;
  if (role === "customer") return <CustomerDashboard />;

  if (view === "login") return <LoginPage onBack={() => setView("home")} />;
  if (view === "seller-register")
    return <SellerRegistrationPage onBack={() => setView("home")} />;

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={() => setView("login")}
        onRegisterClick={() => setView("seller-register")}
      />
      <main className="pt-[72px]">
        <Hero onShopClick={() => setView("login")} />
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RoleProvider>
      <SellerProvider>
        <WalletProvider>
          <OrderTrackingProvider>
            <CartProvider>
              <Toaster />
              <AppContent />
            </CartProvider>
          </OrderTrackingProvider>
        </WalletProvider>
      </SellerProvider>
    </RoleProvider>
  );
}
