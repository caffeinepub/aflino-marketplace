declare global {
  interface Window {
    Razorpay: any;
  }
}

import {
  PINCODE_MAP,
  type SavedAddress,
  useAddresses,
} from "@/context/AddressContext";
import { useCOD } from "@/context/CODContext";
import { useCart } from "@/context/CartContext";
import { useCustomerCoins } from "@/context/CustomerCoinContext";
import { useDeliveryETA } from "@/context/DeliveryETAContext";
import { type Order, useOrderTracking } from "@/context/OrderTrackingContext";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Gift,
  Globe,
  Home,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Star,
  Trash2,
  Truck,
  Wifi,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import IndiaPostNonReturnableModal from "../components/IndiaPostNonReturnableModal";
import { useRemotePincode } from "../context/RemotePincodeContext";
import { logEmail, logWhatsApp } from "../utils/communicationLogger";
import { razorpayBackend } from "../utils/razorpayBackend";

const MIN_COINS_TO_REDEEM = 5;
const PREPAID_DISCOUNT = 30;

// ─── Razorpay script loader ────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Address form state ────────────────────────────────────────────────────
interface AddressForm {
  firstName: string;
  middleName: string;
  lastName: string;
  mobile: string;
  pincode: string;
  city: string;
  state: string;
  fullAddress: string;
  landmark: string;
  country: string;
  label: "Home" | "Office" | "Other";
  isDefault: boolean;
}

const EMPTY_ADDR_FORM: AddressForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  mobile: "",
  pincode: "",
  city: "",
  state: "",
  fullAddress: "",
  landmark: "",
  country: "India",
  label: "Home",
  isDefault: false,
};

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Singapore",
  "Germany",
  "France",
  "Japan",
  "Bangladesh",
  "Nepal",
  "Sri Lanka",
  "Pakistan",
  "Malaysia",
];

// ─── Payment method type ───────────────────────────────────────────────────
type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

interface Props {
  onBack: () => void;
  onSuccess: (order: Order) => void;
}

export default function CheckoutPage({ onBack, onSuccess }: Props) {
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrderTracking();
  const { addresses, addAddress, updateAddress, deleteAddress, setDefault } =
    useAddresses();
  const { getETA, setUserPincode } = useDeliveryETA();
  const { isCODAvailable, getCODFee } = useCOD();
  const { getCoinBalance, redeemCoins } = useCustomerCoins();
  const { isPincodeRemote } = useRemotePincode();

  // ─── Selected address ──────────────────────────────────────────────────
  const defaultAddr =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddr?.id ?? null,
  );
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

  // ─── Address form state ────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(addresses.length === 0);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState<AddressForm>(EMPTY_ADDR_FORM);
  const [addrErrors, setAddrErrors] = useState<
    Partial<Record<keyof AddressForm, string>>
  >({});

  // ─── Payment ───────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [loading, setLoading] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failMessage, setFailMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [razorpayConfigured, setRazorpayConfigured] = useState<boolean | null>(
    null,
  );

  // ─── Coins & coupon ────────────────────────────────────────────────────
  const [applyCoins, setApplyCoins] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // ─── India Post ────────────────────────────────────────────────────────
  const [showIndiaPostWarning, setShowIndiaPostWarning] = useState(false);
  const [userAcceptedNonReturnable, setUserAcceptedNonReturnable] =
    useState(false);

  const userId = "demo-customer";
  const coinBalance = getCoinBalance(userId);
  const canUseCoins = coinBalance >= MIN_COINS_TO_REDEEM;

  // ─── Sync pincode to ETA when address changes ──────────────────────────
  useEffect(() => {
    if (selectedAddress?.pincode) {
      setUserPincode(selectedAddress.pincode);
    }
  }, [selectedAddress?.pincode, setUserPincode]);

  // ─── Check razorpay config ─────────────────────────────────────────────
  useEffect(() => {
    razorpayBackend
      .getRazorpayKeyId()
      .then((key) => setRazorpayConfigured(!!key && key.length > 0))
      .catch(() => setRazorpayConfigured(false));
  }, []);

  // ─── Calculations (live, no API) ───────────────────────────────────────
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const mrpTotal = cartItems.reduce(
    (sum, item) => sum + item.price * 1.2 * item.quantity,
    0,
  ); // estimate MRP as 20% above sale
  const productDiscount = Math.round(mrpTotal - itemTotal);
  const isPrepaid = paymentMethod !== "cod";
  const prepaidDiscount = isPrepaid && itemTotal > 0 ? PREPAID_DISCOUNT : 0;
  const codFeeAmount = paymentMethod === "cod" ? getCODFee(itemTotal) : 0;
  const eta = getETA();
  const deliveryCharge = eta?.isFree ? 0 : 40;
  const coinDiscount =
    applyCoins && canUseCoins ? Math.min(coinBalance, itemTotal) : 0;
  const totalSavings =
    productDiscount + couponDiscount + prepaidDiscount + coinDiscount;
  const finalTotal = Math.max(
    0,
    itemTotal -
      couponDiscount -
      prepaidDiscount -
      coinDiscount +
      codFeeAmount +
      deliveryCharge,
  );

  // ─── Pincode auto-detect in address form ──────────────────────────────
  const handleAddrPincodeChange = useCallback((val: string) => {
    setAddrForm((f) => {
      const update: Partial<AddressForm> = { pincode: val };
      if (val.length === 6 && PINCODE_MAP[val]) {
        update.city = PINCODE_MAP[val].city;
        update.state = PINCODE_MAP[val].state;
      }
      return { ...f, ...update };
    });
    setUserAcceptedNonReturnable(false);
  }, []);

  // ─── Address form validation ───────────────────────────────────────────
  function validateAddrForm(): boolean {
    const errs: Partial<Record<keyof AddressForm, string>> = {};
    if (!addrForm.firstName.trim()) errs.firstName = "First name is required";
    if (!addrForm.lastName.trim()) errs.lastName = "Last name is required";
    if (!addrForm.mobile.trim() || !/^[0-9]{10}$/.test(addrForm.mobile))
      errs.mobile = "Valid 10-digit number required";
    if (!addrForm.pincode.trim() || !/^[0-9]{6}$/.test(addrForm.pincode))
      errs.pincode = "Valid 6-digit pincode required";
    if (!addrForm.city.trim()) errs.city = "City is required";
    if (!addrForm.fullAddress.trim()) errs.fullAddress = "Address is required";
    setAddrErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSaveAddress() {
    if (!validateAddrForm()) return;
    const fullName = [
      addrForm.firstName,
      addrForm.middleName,
      addrForm.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    const addrPayload: Omit<SavedAddress, "id"> = {
      label: addrForm.label,
      name: fullName,
      phone: addrForm.mobile,
      addressLine1: addrForm.fullAddress,
      addressLine2: addrForm.landmark || undefined,
      city: addrForm.city,
      state: addrForm.state,
      pincode: addrForm.pincode,
      isDefault: addrForm.isDefault,
    };
    if (editingAddressId) {
      updateAddress(editingAddressId, addrPayload);
      toast.success("Address updated");
    } else {
      addAddress(addrPayload);
      toast.success("Address saved");
    }
    setShowAddForm(false);
    setEditingAddressId(null);
    setAddrForm(EMPTY_ADDR_FORM);
    setAddrErrors({});
  }

  function handleEditAddress(addr: SavedAddress) {
    const nameParts = addr.name.split(" ");
    setAddrForm({
      firstName: nameParts[0] ?? "",
      middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "",
      lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : "",
      mobile: addr.phone,
      pincode: addr.pincode,
      city: addr.city,
      state: addr.state,
      fullAddress: addr.addressLine1,
      landmark: addr.addressLine2 ?? "",
      country: "India",
      label: addr.label,
      isDefault: addr.isDefault,
    });
    setEditingAddressId(addr.id);
    setShowAddForm(true);
    setAddrErrors({});
  }

  // ─── Coupon apply ──────────────────────────────────────────────────────
  function handleApplyCoupon() {
    if (couponCode.trim().toUpperCase() === "AFLINO50") {
      setAppliedCoupon("AFLINO50");
      setCouponDiscount(50);
      toast.success("Coupon applied! ₹50 discount");
    } else if (couponCode.trim().toUpperCase() === "NEWUSER") {
      setAppliedCoupon("NEWUSER");
      setCouponDiscount(100);
      toast.success("Welcome offer applied! ₹100 discount");
    } else {
      toast.error("Invalid coupon code");
    }
  }

  // ─── Place order ───────────────────────────────────────────────────────
  async function handlePlaceOrder() {
    if (!selectedAddress) {
      toast.error("Please select or add a delivery address.");
      return;
    }
    if (
      isPincodeRemote(selectedAddress.pincode) &&
      !userAcceptedNonReturnable
    ) {
      setShowIndiaPostWarning(true);
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const productNames = cartItems.map((i) => i.productTitle).join(", ");
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // COD flow
    if (paymentMethod === "cod") {
      setLoading(true);
      const newOrder: Order = buildOrder(
        orderId,
        productNames,
        today,
        "Confirmed (COD)",
      );
      addOrder(newOrder);
      clearCart();
      if (applyCoins && canUseCoins && coinDiscount > 0) {
        redeemCoins(userId, coinDiscount, orderId);
      }
      logWhatsApp("order_placed", selectedAddress.phone, orderId);
      logEmail(
        "order_confirmation",
        selectedAddress.phone,
        `Order ${orderId} Confirmed`,
        orderId,
      );
      setLoading(false);
      onSuccess(newOrder);
      return;
    }

    // Online payment (UPI / Card / Net Banking) via Razorpay
    setLoading(true);
    setPaymentFailed(false);

    try {
      const totalPaise = BigInt(Math.round(finalTotal * 100));
      const receipt = `rcpt_${Date.now()}`;

      const [razorpayOrderId, keyId, scriptLoaded] = await Promise.all([
        razorpayBackend.createRazorpayOrder(totalPaise, receipt),
        razorpayBackend.getRazorpayKeyId(),
        loadRazorpayScript(),
      ]);

      if (!scriptLoaded) {
        throw new Error(
          "Failed to load Razorpay. Check your internet connection.",
        );
      }

      setLoading(false);

      const rzp = new window.Razorpay({
        key: keyId,
        amount: Number(totalPaise),
        currency: "INR",
        order_id: razorpayOrderId,
        name: "AFLINO",
        description: "Order Payment",
        image: "/logo.png",
        theme: { color: "#006AFF" },
        prefill: {
          name: selectedAddress.name,
          contact: selectedAddress.phone,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setLoading(true);
          try {
            const verified = await razorpayBackend.verifyRazorpayPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
            );
            if (verified) {
              const newOrder: Order = buildOrder(
                orderId,
                productNames,
                today,
                "Paid & Processing",
              );
              addOrder(newOrder);
              clearCart();
              if (applyCoins && canUseCoins && coinDiscount > 0) {
                redeemCoins(userId, coinDiscount, orderId);
              }
              logWhatsApp("order_placed", selectedAddress.phone, orderId);
              logEmail(
                "order_confirmation",
                selectedAddress.phone,
                `Order ${orderId} Confirmed`,
                orderId,
              );
              onSuccess(newOrder);
            } else {
              setPaymentFailed(true);
              setRetryCount((c) => c + 1);
              setFailMessage(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch {
            setPaymentFailed(true);
            setRetryCount((c) => c + 1);
            setFailMessage("Could not verify payment. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentFailed(true);
            setRetryCount((c) => c + 1);
            setFailMessage(
              "Payment was cancelled. Your order is safe — you can retry anytime.",
            );
          },
        },
      });

      rzp.open();
    } catch (err: unknown) {
      setLoading(false);
      setPaymentFailed(true);
      setRetryCount((c) => c + 1);
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setFailMessage(msg);
    }
  }

  function buildOrder(
    orderId: string,
    productNames: string,
    today: string,
    status: Order["status"],
  ): Order {
    return {
      id: orderId,
      product: productNames,
      date: today,
      amount: `₹${finalTotal.toLocaleString("en-IN")}`,
      amountRaw: finalTotal,
      status,
      sellerEmail: "support@aflino.com",
      sellerName: "AFLINO Store",
      buyerName: selectedAddress?.name ?? "",
      buyerPhone: selectedAddress?.phone,
      buyerAddress: `${selectedAddress?.addressLine1}, ${selectedAddress?.city} - ${selectedAddress?.pincode}`,
      buyerState: selectedAddress?.state ?? "",
      buyerPincode: selectedAddress?.pincode ?? "",
      quantity: cartItems.reduce((s, i) => s + i.quantity, 0),
      unitPrice: finalTotal,
      gstRate: 18,
      hsnCode: "8517",
      discount: productDiscount,
      nonReturnable: isPincodeRemote(selectedAddress?.pincode ?? ""),
      indiaPostOrder: isPincodeRemote(selectedAddress?.pincode ?? ""),
    };
  }

  // ─── Razorpay not configured ───────────────────────────────────────────
  if (razorpayConfigured === false) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center px-4">
        <div
          className="bg-card rounded-3xl shadow-lg border-2 max-w-sm w-full p-8 text-center space-y-5"
          style={{ borderColor: "#F59E0B" }}
          data-ocid="checkout.razorpay_maintenance.panel"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Payment Gateway Under Maintenance
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our payment system is being configured. Please check back shortly
              or contact{" "}
              <a
                href="mailto:support@aflino.com"
                className="underline text-primary"
              >
                support@aflino.com
              </a>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-primary"
            data-ocid="checkout.continue_shopping.button"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !paymentFailed) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-6">
          Add some products before checking out.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm bg-primary"
          data-ocid="checkout.back_button"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // ─── Failed payment screen ─────────────────────────────────────────────
  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
        <div className="bg-card rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              Payment Failed
            </h2>
            <p className="text-sm font-semibold text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-3">
              🔒 Your order is safe — nothing was charged.
            </p>
            <p
              className="text-muted-foreground text-sm"
              data-ocid="checkout.error_state"
            >
              {failMessage}
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Retry attempt {retryCount} of 3
              </p>
            )}
          </div>
          {retryCount < 3 && (
            <button
              type="button"
              onClick={() => {
                setPaymentFailed(false);
                setFailMessage("");
                handlePlaceOrder();
              }}
              className="w-full py-3 rounded-xl font-bold text-white text-sm bg-primary"
              data-ocid="checkout.retry_payment.button"
            >
              Retry Payment
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setPaymentFailed(false);
              setFailMessage("");
              setPaymentMethod("upi");
            }}
            className="w-full py-3 rounded-xl font-semibold text-sm border border-border text-foreground hover:bg-muted"
            data-ocid="checkout.change_payment.button"
          >
            Change Payment Method
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 text-sm text-muted-foreground hover:underline"
            data-ocid="checkout.cancel_button"
          >
            Cancel & Return to Cart
          </button>
        </div>
      </div>
    );
  }

  const isOnline = paymentMethod !== "cod";

  // ─── Main checkout layout ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          data-ocid="checkout.back_button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground">Checkout</h1>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-green-600" />
          <span className="text-green-700 font-medium">Secure</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* ── SECTION 1: ADDRESS ──────────────────────────────────────── */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground text-base">
              Delivery Address
            </h2>
          </div>

          {/* Saved addresses */}
          {addresses.length > 0 && (
            <div
              className="divide-y divide-border"
              data-ocid="checkout.address.list"
            >
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <button
                    key={addr.id}
                    type="button"
                    className={`w-full text-left px-5 py-4 flex gap-3 cursor-pointer transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-muted/40"}`}
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setDefault(addr.id);
                    }}
                    data-ocid={`checkout.address.card.${addr.id}`}
                  >
                    {/* Radio */}
                    <div className="mt-0.5">
                      <div
                        className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-primary bg-primary" : "border-border bg-background"}`}
                        style={{ width: 18, height: 18 }}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            addr.label === "Home"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : addr.label === "Office"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {addr.label === "Home" ? (
                            <Home className="inline w-3 h-3 mr-0.5" />
                          ) : addr.label === "Office" ? (
                            <Building2 className="inline w-3 h-3 mr-0.5" />
                          ) : null}
                          {addr.label}
                        </span>
                        <span className="font-semibold text-sm text-foreground truncate">
                          {addr.name}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        📞 {addr.phone}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(addr);
                        }}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                        data-ocid={`checkout.address.edit.${addr.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAddress(addr.id);
                          if (selectedAddressId === addr.id)
                            setSelectedAddressId(
                              addresses.filter((a) => a.id !== addr.id)[0]
                                ?.id ?? null,
                            );
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                        data-ocid={`checkout.address.delete.${addr.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Add new address toggle */}
          <div className="px-5 py-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                if (showAddForm && !editingAddressId) {
                  setShowAddForm(false);
                  setAddrForm(EMPTY_ADDR_FORM);
                  setAddrErrors({});
                } else {
                  setEditingAddressId(null);
                  setAddrForm(EMPTY_ADDR_FORM);
                  setAddrErrors({});
                  setShowAddForm(true);
                }
              }}
              className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
              data-ocid="checkout.add_address.button"
            >
              {showAddForm && !editingAddressId ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add New Address
                </>
              )}
            </button>
          </div>

          {/* Inline address form */}
          {showAddForm && (
            <div className="px-5 pb-5 space-y-4 border-t border-border bg-muted/20">
              <p className="pt-4 text-sm font-semibold text-foreground">
                {editingAddressId ? "Edit Address" : "Add New Address"}
              </p>

              {/* Label */}
              <div className="flex gap-2">
                {(["Home", "Office", "Other"] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddrForm((f) => ({ ...f, label: lbl }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${addrForm.label === lbl ? "bg-primary text-white border-primary" : "bg-background text-foreground border-border hover:border-primary"}`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="addr-firstname"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    First Name *
                  </label>
                  <input
                    id="addr-firstname"
                    type="text"
                    value={addrForm.firstName}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    placeholder="Rahul"
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                    data-ocid="checkout.addr_firstname.input"
                  />
                  {addrErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">
                      {addrErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="addr-middlename"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    Middle Name
                  </label>
                  <input
                    id="addr-middlename"
                    type="text"
                    value={addrForm.middleName}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, middleName: e.target.value }))
                    }
                    placeholder="Kumar (optional)"
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
                <div>
                  <label
                    htmlFor="addr-lastname"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    Last Name *
                  </label>
                  <input
                    id="addr-lastname"
                    type="text"
                    value={addrForm.lastName}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    placeholder="Sharma"
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                    data-ocid="checkout.addr_lastname.input"
                  />
                  {addrErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">
                      {addrErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile + Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="addr-mobile"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="addr-mobile"
                    type="tel"
                    value={addrForm.mobile}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, mobile: e.target.value }))
                    }
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                    data-ocid="checkout.addr_mobile.input"
                  />
                  {addrErrors.mobile && (
                    <p className="text-xs text-red-500 mt-1">
                      {addrErrors.mobile}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="addr-pincode"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    Pincode *
                    <span className="text-primary ml-1 font-normal">
                      (auto-detects city/state)
                    </span>
                  </label>
                  <input
                    id="addr-pincode"
                    type="text"
                    value={addrForm.pincode}
                    onChange={(e) => handleAddrPincodeChange(e.target.value)}
                    placeholder="400001"
                    maxLength={6}
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                    data-ocid="checkout.addr_pincode.input"
                  />
                  {addrErrors.pincode && (
                    <p className="text-xs text-red-500 mt-1">
                      {addrErrors.pincode}
                    </p>
                  )}
                </div>
              </div>

              {/* City auto-filled */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="addr-city"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    City *
                  </label>
                  <input
                    id="addr-city"
                    type="text"
                    value={addrForm.city}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, city: e.target.value }))
                    }
                    placeholder="Mumbai"
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                    data-ocid="checkout.addr_city.input"
                  />
                  {addrErrors.city && (
                    <p className="text-xs text-red-500 mt-1">
                      {addrErrors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="addr-state"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    State
                  </label>
                  <input
                    id="addr-state"
                    type="text"
                    value={addrForm.state}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, state: e.target.value }))
                    }
                    placeholder="Maharashtra"
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
              </div>

              {/* Full address */}
              <div>
                <label
                  htmlFor="addr-fulladdress"
                  className="block text-xs font-medium text-muted-foreground mb-1"
                >
                  Full Address *
                </label>
                <textarea
                  id="addr-fulladdress"
                  value={addrForm.fullAddress}
                  onChange={(e) =>
                    setAddrForm((f) => ({ ...f, fullAddress: e.target.value }))
                  }
                  placeholder="Flat / House No, Street, Locality, Area"
                  rows={2}
                  className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none bg-background"
                  data-ocid="checkout.addr_fulladdress.textarea"
                />
                {addrErrors.fullAddress && (
                  <p className="text-xs text-red-500 mt-1">
                    {addrErrors.fullAddress}
                  </p>
                )}
              </div>

              {/* Landmark + Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="addr-landmark"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    Landmark (optional)
                  </label>
                  <input
                    id="addr-landmark"
                    type="text"
                    value={addrForm.landmark}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, landmark: e.target.value }))
                    }
                    placeholder="Near Metro Station"
                    className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  />
                </div>
                <div>
                  <label
                    htmlFor="addr-country"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      id="addr-country"
                      value={addrForm.country}
                      onChange={(e) =>
                        setAddrForm((f) => ({ ...f, country: e.target.value }))
                      }
                      className="w-full border border-border rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background appearance-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Default toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addrForm.isDefault}
                  onChange={(e) =>
                    setAddrForm((f) => ({ ...f, isDefault: e.target.checked }))
                  }
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">
                  Set as default address
                </span>
              </label>

              {/* Save button */}
              <button
                type="button"
                onClick={handleSaveAddress}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-ocid="checkout.save_address.button"
              >
                {editingAddressId ? "Update Address" : "Save Address"}
              </button>
            </div>
          )}
        </div>

        {/* ── SECTION 2: DELIVERY INFO ─────────────────────────────────── */}
        {selectedAddress && (
          <div
            className="bg-card rounded-2xl shadow-sm border border-border p-5"
            data-ocid="checkout.delivery.panel"
          >
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground text-base">
                Delivery Details
              </h2>
            </div>

            {eta ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Estimated delivery to
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {selectedAddress.city}, {selectedAddress.state} —{" "}
                      {selectedAddress.pincode}
                    </p>
                    <p className="text-base font-bold text-foreground mt-1">
                      {eta.deliveryDateMin} – {eta.deliveryDateMax}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {eta.isFree ? (
                      <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                        FREE Delivery
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                        ₹{deliveryCharge} Delivery
                      </span>
                    )}
                    {eta.minDays <= 2 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                        <Zap className="w-3 h-3" /> Fast Delivery
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">
                  <BadgeCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>
                    Dispatched from AFLINO Fulfilment Centre · {eta.zone}{" "}
                    delivery zone ({eta.label})
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Enter a valid pincode to see delivery date
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 3: PAYMENT METHOD ────────────────────────────────── */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground text-base">
              Payment Method
            </h2>
          </div>

          <div className="p-5 space-y-3">
            {/* Prepaid incentive banner */}
            {isOnline && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <Star className="w-4 h-4 text-green-600 shrink-0 fill-green-600" />
                <p className="text-sm font-semibold text-green-800">
                  Save ₹{PREPAID_DISCOUNT} with Prepaid Payment 🎉
                </p>
              </div>
            )}

            {/* UPI */}
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
              data-ocid="checkout.payment.upi"
            >
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={() => setPaymentMethod("upi")}
                className="accent-primary"
              />
              <Smartphone className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-sm text-foreground">
                  UPI
                </span>
                <p className="text-xs text-muted-foreground">
                  GPay, PhonePe, Paytm, BHIM & more
                </p>
              </div>
              {paymentMethod === "upi" && (
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              )}
            </label>

            {/* Card */}
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
              data-ocid="checkout.payment.card"
            >
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
                className="accent-primary"
              />
              <CreditCard className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-sm text-foreground">
                  Credit / Debit Card
                </span>
                <p className="text-xs text-muted-foreground">
                  Visa, Mastercard, RuPay, Amex
                </p>
              </div>
              {paymentMethod === "card" && (
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              )}
            </label>

            {/* Net Banking */}
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "netbanking" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
              data-ocid="checkout.payment.netbanking"
            >
              <input
                type="radio"
                name="payment"
                value="netbanking"
                checked={paymentMethod === "netbanking"}
                onChange={() => setPaymentMethod("netbanking")}
                className="accent-primary"
              />
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-sm text-foreground">
                  Net Banking
                </span>
                <p className="text-xs text-muted-foreground">
                  All major Indian banks supported
                </p>
              </div>
              {paymentMethod === "netbanking" && (
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              )}
            </label>

            {/* COD */}
            {isCODAvailable(itemTotal) && (
              <label
                className={`flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "cod" ? "border-orange-400 bg-orange-50/50" : "border-border hover:border-muted-foreground/30"}`}
                data-ocid="checkout.payment.cod"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-orange-500"
                  />
                  <Banknote className="w-4 h-4 text-orange-600 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-foreground">
                      Cash on Delivery
                    </span>
                    {codFeeAmount > 0 ? (
                      <p className="text-xs text-orange-600">
                        +₹{codFeeAmount} COD handling fee
                      </p>
                    ) : (
                      <p className="text-xs text-green-600">
                        FREE COD on this order
                      </p>
                    )}
                  </div>
                  {paymentMethod === "cod" && (
                    <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground ml-6 mt-1">
                  Why this fee? To ensure safe and verified delivery to your
                  doorstep.
                </p>
              </label>
            )}
          </div>
        </div>

        {/* ── SECTION 4: COUPON ────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-5">
          <h2 className="font-bold text-foreground text-base mb-3">
            Apply Coupon
          </h2>
          {appliedCoupon ? (
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                  {appliedCoupon} — ₹{couponDiscount} OFF
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponDiscount(0);
                  setCouponCode("");
                }}
                className="text-xs text-red-500 hover:underline px-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code (e.g. AFLINO50)"
                className="flex-1 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                data-ocid="checkout.coupon.input"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shrink-0"
                data-ocid="checkout.coupon.apply"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* ── AFLINO REWARDS ────────────────────────────────────────────── */}
        <div
          className="bg-card rounded-2xl shadow-sm border border-amber-200 overflow-hidden"
          data-ocid="checkout.coins.panel"
        >
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <Gift className="w-5 h-5 text-white" />
            <span className="font-bold text-white text-sm tracking-wide">
              AFLINO Rewards
            </span>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-amber-600">
                {coinBalance}
              </span>
              <span className="text-sm text-muted-foreground">
                {coinBalance === 1 ? "Coin" : "Coins"} available{" "}
                <span className="text-xs text-muted-foreground/70">
                  (1 Coin = ₹1)
                </span>
              </span>
            </div>
            {coinBalance === 0 && (
              <p className="text-xs text-muted-foreground bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                💡 Earn coins by submitting photo reviews on your purchases!
              </p>
            )}
            {coinBalance > 0 && !canUseCoins && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                You have {coinBalance} Coins. Min {MIN_COINS_TO_REDEEM} coins
                required to apply.
              </p>
            )}
            {canUseCoins && (
              <label
                className="flex items-start gap-3 cursor-pointer group"
                data-ocid="checkout.coins.checkbox"
              >
                <input
                  type="checkbox"
                  checked={applyCoins}
                  onChange={(e) => setApplyCoins(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-amber-500 shrink-0"
                />
                <div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-amber-700 transition-colors">
                    Apply Coins for Discount
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Saves ₹
                    {Math.min(coinBalance, itemTotal).toLocaleString("en-IN")}{" "}
                    on this order
                  </p>
                </div>
              </label>
            )}
            {applyCoins && canUseCoins && (
              <div className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2.5 border border-green-200 font-medium flex items-center gap-1.5">
                🎉 ₹{coinDiscount.toLocaleString("en-IN")} coin discount
                applied!
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 5: ORDER SUMMARY ──────────────────────────────────── */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground text-base">
              Order Summary
            </h2>
          </div>

          {/* Cart items */}
          <div
            className="divide-y divide-border"
            data-ocid="checkout.cart.list"
          >
            {cartItems.map((item, i) => (
              <div
                key={item.cartItemId}
                className="px-5 py-3 flex justify-between items-center"
                data-ocid={`checkout.cart.item.${i + 1}`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.productTitle}
                  </p>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground">
                      {item.variant.size} / {item.variant.color}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="px-5 py-4 space-y-2.5 border-t border-border bg-muted/10">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Item Total</span>
              <span className="text-foreground">
                ₹{itemTotal.toLocaleString("en-IN")}
              </span>
            </div>
            {productDiscount > 0 && (
              <div className="flex justify-between text-sm font-medium text-green-600">
                <span>Discount</span>
                <span>-₹{productDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm font-medium text-green-600">
                <span>Coupon Discount ({appliedCoupon})</span>
                <span>-₹{couponDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Delivery Charges</span>
              {deliveryCharge === 0 ? (
                <span className="text-green-600 font-medium">FREE</span>
              ) : (
                <span>+₹{deliveryCharge}</span>
              )}
            </div>
            {codFeeAmount > 0 && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>COD Handling Fee</span>
                <span>+₹{codFeeAmount}</span>
              </div>
            )}
            {prepaidDiscount > 0 && (
              <div className="flex justify-between text-sm font-medium text-green-600">
                <span>Prepaid Discount</span>
                <span>-₹{prepaidDiscount}</span>
              </div>
            )}
            {coinDiscount > 0 && (
              <div className="flex justify-between text-sm font-medium text-green-600">
                <span>AFLINO Coins</span>
                <span>-₹{coinDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border pt-2.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground text-base">
                  Final Payable Amount
                </span>
                <span className="font-extrabold text-xl text-primary">
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Savings badge */}
            {totalSavings > 0 && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-center">
                <p className="text-sm font-bold text-green-700">
                  You saved ₹{totalSavings.toLocaleString("en-IN")} on this
                  order 🎉
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── CONVERSION BOOST ──────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <p className="text-sm text-red-700 font-medium">
              Only a few items left in stock — order now!
            </p>
          </div>
          {eta && eta.minDays <= 2 && (
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
              <Zap className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm text-primary font-medium">
                Fast delivery available to your location
              </p>
            </div>
          )}
        </div>

        {/* ── TRUST STRIP + CTA ────────────────────────────────────────── */}
        <div className="space-y-3">
          {/* Trust strip */}
          <div className="flex items-center justify-center gap-2 bg-muted/40 rounded-xl px-4 py-2.5 border border-border">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground">
              Secure Checkout · SSL Encrypted · 100% Safe
            </span>
            <Wifi className="w-4 h-4 text-primary shrink-0" />
          </div>

          {/* Place Order button */}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={loading || !selectedAddress}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-base flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-transform disabled:opacity-60"
            style={{
              background: loading
                ? "#99C2FF"
                : paymentMethod === "cod"
                  ? "#f97316"
                  : "#006AFF",
            }}
            data-ocid="checkout.submit_button"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : paymentMethod === "cod" ? (
              <>
                <Truck className="w-5 h-5" />
                Place Order · ₹{finalTotal.toLocaleString("en-IN")}
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Place Order · ₹{finalTotal.toLocaleString("en-IN")}
              </>
            )}
          </button>

          {!selectedAddress && (
            <p className="text-center text-xs text-red-500">
              Please select or add a delivery address to continue
            </p>
          )}
        </div>

        {/* Spacer for mobile bottom nav */}
        <div className="h-6" />
      </div>

      <IndiaPostNonReturnableModal
        isOpen={showIndiaPostWarning}
        pincode={selectedAddress?.pincode ?? ""}
        onAccept={() => {
          setUserAcceptedNonReturnable(true);
          setShowIndiaPostWarning(false);
          handlePlaceOrder();
        }}
        onCancel={() => setShowIndiaPostWarning(false)}
      />
    </div>
  );
}
