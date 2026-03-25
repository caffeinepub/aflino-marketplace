import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LocationModal from "@/components/LocationModal";
import ProductGrid from "@/components/ProductGrid";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import { CustomerCoinProvider } from "@/context/CustomerCoinContext";
import { FlashSaleProvider } from "@/context/FlashSaleContext";
import {
  GeoLocationProvider,
  useGeoLocation,
} from "@/context/GeoLocationContext";
import { HomepageManagerProvider } from "@/context/HomepageManagerContext";
import type { Order } from "@/context/OrderTrackingContext";
import { OrderTrackingProvider } from "@/context/OrderTrackingContext";
import { ProductProvider } from "@/context/ProductContext";
import { ReviewProvider } from "@/context/ReviewContext";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { SellerProvider } from "@/context/SellerContext";
import { WalletProvider } from "@/context/WalletContext";
import { WishlistProvider } from "@/context/WishlistContext";
import AdminDashboard from "@/pages/AdminDashboard";
import CheckoutPage from "@/pages/CheckoutPage";
import CustomerDashboard from "@/pages/CustomerDashboard";
import LoginPage from "@/pages/LoginPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import PickupConfirmationPage from "@/pages/PickupConfirmationPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import RecentlyViewedPage from "@/pages/RecentlyViewedPage";
import SellerDashboard from "@/pages/SellerDashboard";
import SellerRegistrationPage from "@/pages/SellerRegistrationPage";
import { useState } from "react";

type View =
  | "home"
  | "login"
  | "seller-register"
  | "history"
  | "checkout"
  | "order-success";

// Header is 2 rows: ~52px top bar + ~46px search = 98px
const HEADER_HEIGHT = "pt-[98px]";

function AppContent() {
  const { role } = useRole();
  const { modalShown } = useGeoLocation();
  const [view, setView] = useState<View>("home");
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // Handle /pickup/:token URL directly
  if (window.location.pathname.startsWith("/pickup/")) {
    return <PickupConfirmationPage />;
  }
  // Checkout view - accessible to logged-in customers
  if (view === "checkout") {
    return (
      <CheckoutPage
        onBack={() => setView(role === "customer" ? "home" : "home")}
        onSuccess={(order) => {
          setSuccessOrder(order);
          setView("order-success");
        }}
      />
    );
  }

  // Order success view
  if (view === "order-success" && successOrder) {
    return (
      <OrderSuccessPage
        order={successOrder}
        onViewOrders={() => {
          setSuccessOrder(null);
          setView("home");
        }}
        onContinueShopping={() => {
          setSuccessOrder(null);
          setView("home");
        }}
      />
    );
  }

  if (role === "admin") return <AdminDashboard />;
  if (role === "seller") return <SellerDashboard />;
  if (role === "customer")
    return <CustomerDashboard onCheckout={() => setView("checkout")} />;

  if (view === "login") return <LoginPage onBack={() => setView("home")} />;
  if (view === "seller-register")
    return <SellerRegistrationPage onBack={() => setView("home")} />;

  if (view === "history")
    return (
      <div className="min-h-screen bg-white">
        <Header
          onLoginClick={() => setView("login")}
          onRegisterClick={() => setView("seller-register")}
        />
        <main className={HEADER_HEIGHT}>
          <RecentlyViewedPage
            onBack={() => setView("home")}
            onViewProduct={(id) => {
              setView("home");
              setCurrentProductId(id);
            }}
          />
        </main>
        <Footer />
        {modalShown && <LocationModal />}
      </div>
    );

  if (currentProductId !== null) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          onLoginClick={() => setView("login")}
          onRegisterClick={() => setView("seller-register")}
        />
        <main className={HEADER_HEIGHT}>
          <ProductDetailPage
            productId={currentProductId}
            onBack={() => setCurrentProductId(null)}
            onNavigateToProduct={(id) => setCurrentProductId(id)}
          />
        </main>
        <Footer />
        {modalShown && <LocationModal />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onLoginClick={() => setView("login")}
        onRegisterClick={() => setView("seller-register")}
      />
      <main className={HEADER_HEIGHT}>
        <Hero
          onShopClick={() => setView("login")}
          onViewAll={() => setView("history")}
          onViewProduct={(id) => setCurrentProductId(id)}
        />
        <ProductGrid onViewProduct={(id) => setCurrentProductId(id)} />
      </main>
      <Footer />
      {modalShown && <LocationModal />}
    </div>
  );
}

export default function App() {
  return (
    <HomepageManagerProvider>
      <GeoLocationProvider>
        <RoleProvider>
          <SellerProvider>
            <WishlistProvider>
              <ReviewProvider>
                <CustomerCoinProvider>
                  <WalletProvider>
                    <OrderTrackingProvider>
                      <CartProvider>
                        <ProductProvider>
                          <FlashSaleProvider>
                            <Toaster />
                            <AppContent />
                          </FlashSaleProvider>
                        </ProductProvider>
                      </CartProvider>
                    </OrderTrackingProvider>
                  </WalletProvider>
                </CustomerCoinProvider>
              </ReviewProvider>
            </WishlistProvider>
          </SellerProvider>
        </RoleProvider>
      </GeoLocationProvider>
    </HomepageManagerProvider>
  );
}
