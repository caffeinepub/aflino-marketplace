import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import IOSInstallBanner from "@/components/IOSInstallBanner";
import LeavesBackground from "@/components/LeavesBackground";
import LocationModal from "@/components/LocationModal";
import PWAInstallPopup from "@/components/PWAInstallPopup";
import ProductGrid from "@/components/ProductGrid";
import { Toaster } from "@/components/ui/sonner";
import { AddressProvider } from "@/context/AddressContext";
import { AffiliateProvider } from "@/context/AffiliateContext";
import { BlacklistProvider } from "@/context/BlacklistContext";
import { CartProvider } from "@/context/CartContext";
import { CustomerCoinProvider } from "@/context/CustomerCoinContext";
import { FlashSaleProvider } from "@/context/FlashSaleContext";
import {
  GeoLocationProvider,
  useGeoLocation,
} from "@/context/GeoLocationContext";
import { HomepageManagerProvider } from "@/context/HomepageManagerContext";
import { I18nProvider } from "@/context/I18nContext";
import { LanguageIconProvider } from "@/context/LanguageIconContext";
import type { Order } from "@/context/OrderTrackingContext";
import { OrderTrackingProvider } from "@/context/OrderTrackingContext";
import { PWABrandingProvider } from "@/context/PWABrandingContext";
import { ProductProvider } from "@/context/ProductContext";
import { RemotePincodeProvider } from "@/context/RemotePincodeContext";
import { ReviewProvider } from "@/context/ReviewContext";
import { RewardSettingsProvider } from "@/context/RewardSettingsContext";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { SellerProvider } from "@/context/SellerContext";
import { WalletProvider } from "@/context/WalletContext";
import { WishlistProvider } from "@/context/WishlistContext";
import AdminDashboard from "@/pages/AdminDashboard";
import AffiliateDashboard from "@/pages/AffiliateDashboard";
import AffiliateRegisterPage from "@/pages/AffiliateRegisterPage";
import CheckoutPage from "@/pages/CheckoutPage";
import CustomerDashboard from "@/pages/CustomerDashboard";
import LoginPage from "@/pages/LoginPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import PickupConfirmationPage from "@/pages/PickupConfirmationPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import RecentlyViewedPage from "@/pages/RecentlyViewedPage";
import SellerDashboard from "@/pages/SellerDashboard";
import SellerRegistrationPage from "@/pages/SellerRegistrationPage";
import TrackOrderPage from "@/pages/TrackOrderPage";
import { useState } from "react";

type View =
  | "home"
  | "login"
  | "seller-register"
  | "history"
  | "checkout"
  | "order-success"
  | "affiliate-register"
  | "affiliate";

// Header is 3 rows: ~52px top bar + ~46px search + ~36px categories = 134px, use 145px for safety
const HEADER_HEIGHT = "pt-[145px]";

function AppContent() {
  const { role } = useRole();
  const { modalShown } = useGeoLocation();
  const [view, setView] = useState<View>("home");
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // 30-day cookie tracking for affiliate referrals
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("affiliateRef", ref);
      localStorage.setItem(
        "affiliateRefExpiry",
        String(Date.now() + 30 * 24 * 60 * 60 * 1000),
      );
    }
  }

  // Handle /pickup/:token URL directly
  if (window.location.pathname.startsWith("/pickup/")) {
    return <PickupConfirmationPage />;
  }

  // Handle /track/:orderId URL directly
  if (window.location.pathname.startsWith("/track/")) {
    const orderId = window.location.pathname.split("/track/")[1];
    return (
      <TrackOrderPage orderId={orderId} onBack={() => window.history.back()} />
    );
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
  if (role === "customer") {
    if (currentProductId !== null) {
      return (
        <div className="min-h-screen bg-white">
          <main>
            <ProductDetailPage
              productId={currentProductId}
              onBack={() => setCurrentProductId(null)}
              onNavigateToProduct={(id) => setCurrentProductId(id)}
            />
          </main>
        </div>
      );
    }
    if (trackingOrderId) {
      return (
        <TrackOrderPage
          orderId={trackingOrderId}
          onBack={() => setTrackingOrderId(null)}
        />
      );
    }
    return (
      <CustomerDashboard
        onCheckout={() => setView("checkout")}
        onTrackOrder={(id) => setTrackingOrderId(id)}
        onNavigateToProduct={(id) => setCurrentProductId(id)}
      />
    );
  }

  if (view === "login") return <LoginPage onBack={() => setView("home")} />;
  if (view === "seller-register")
    return <SellerRegistrationPage onBack={() => setView("home")} />;
  if (view === "affiliate-register")
    return (
      <AffiliateRegisterPage
        onBack={() => setView("home")}
        onLoginClick={() => setView("affiliate")}
      />
    );
  if (view === "affiliate")
    return (
      <AffiliateDashboard
        onBack={() => setView("home")}
        onRegisterClick={() => setView("affiliate-register")}
      />
    );

  if (view === "history")
    return (
      <div className="min-h-screen bg-white">
        <LeavesBackground />
        <Header
          onLoginClick={() => setView("login")}
          onRegisterClick={() => setView("seller-register")}
          onAffiliateClick={() => setView("affiliate-register")}
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
        <LeavesBackground />
        <Header
          onLoginClick={() => setView("login")}
          onRegisterClick={() => setView("seller-register")}
          onAffiliateClick={() => setView("affiliate-register")}
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
      <LeavesBackground />
      <Header
        onLoginClick={() => setView("login")}
        onRegisterClick={() => setView("seller-register")}
        onAffiliateClick={() => setView("affiliate-register")}
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
    <PWABrandingProvider>
      <I18nProvider>
        <LanguageIconProvider>
          <HomepageManagerProvider>
            <GeoLocationProvider>
              <RoleProvider>
                <SellerProvider>
                  <RemotePincodeProvider>
                    <AddressProvider>
                      <WishlistProvider>
                        <RewardSettingsProvider>
                          <CustomerCoinProvider>
                            <BlacklistProvider>
                              <ReviewProvider>
                                <WalletProvider>
                                  <OrderTrackingProvider>
                                    <CartProvider>
                                      <ProductProvider>
                                        <FlashSaleProvider>
                                          <Toaster />
                                          <IOSInstallBanner />
                                          <PWAInstallPopup />
                                          <AppContent />
                                        </FlashSaleProvider>
                                      </ProductProvider>
                                    </CartProvider>
                                  </OrderTrackingProvider>
                                </WalletProvider>
                              </ReviewProvider>
                            </BlacklistProvider>
                          </CustomerCoinProvider>
                        </RewardSettingsProvider>
                      </WishlistProvider>
                    </AddressProvider>
                  </RemotePincodeProvider>
                </SellerProvider>
              </RoleProvider>
            </GeoLocationProvider>
          </HomepageManagerProvider>
        </LanguageIconProvider>
      </I18nProvider>
    </PWABrandingProvider>
  );
}
