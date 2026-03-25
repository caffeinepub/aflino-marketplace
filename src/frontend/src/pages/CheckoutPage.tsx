declare global {
  interface Window {
    Razorpay: any;
  }
}

import { useCart } from "@/context/CartContext";
import { type Order, useOrderTracking } from "@/context/OrderTrackingContext";
import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logWhatsApp } from "../utils/communicationLogger";
import { razorpayBackend } from "../utils/razorpayBackend";

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

interface Props {
  onBack: () => void;
  onSuccess: (order: Order) => void;
}

export default function CheckoutPage({ onBack, onSuccess }: Props) {
  const { cartItems, clearCart } = useCart();
  const { addOrder } = useOrderTracking();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failMessage, setFailMessage] = useState("");
  const [razorpayConfigured, setRazorpayConfigured] = useState<boolean | null>(
    null,
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  useEffect(() => {
    razorpayBackend
      .getRazorpayKeyId()
      .then((key) => setRazorpayConfigured(!!key && key.length > 0))
      .catch(() => setRazorpayConfigured(false));
  }, []);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim() || !/^[0-9]{10}$/.test(form.phone))
      errs.phone = "Valid 10-digit phone required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.pincode.trim() || !/^[0-9]{6}$/.test(form.pincode))
      errs.pincode = "Valid 6-digit pincode required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validate()) return;
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);
    setPaymentFailed(false);

    try {
      const totalPaise = BigInt(Math.round(total * 100));
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

      const productNames = cartItems.map((i) => i.productTitle).join(", ");
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const today = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

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
          name: form.name,
          contact: form.phone,
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
              const newOrder: Order = {
                id: orderId,
                product: productNames,
                date: today,
                amount: `₹${total.toLocaleString("en-IN")}`,
                amountRaw: total,
                status: "Paid & Processing",
                sellerEmail: "support@aflino.com",
                sellerName: "AFLINO Store",
                buyerName: form.name,
                buyerAddress: `${form.address}, ${form.city} - ${form.pincode}`,
                buyerState: form.state,
                buyerPincode: form.pincode,
                quantity: cartItems.reduce((s, i) => s + i.quantity, 0),
                unitPrice: total,
                gstRate: 18,
                hsnCode: "8517",
                discount: 0,
              };
              addOrder(newOrder);
              clearCart();
              logWhatsApp("order_placed", form.phone, orderId);
              onSuccess(newOrder);
            } else {
              setPaymentFailed(true);
              setFailMessage(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch {
            setPaymentFailed(true);
            setFailMessage("Could not verify payment. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. Your cart is safe.");
          },
        },
      });

      rzp.open();
    } catch (err: any) {
      setLoading(false);
      setPaymentFailed(true);
      setFailMessage(err?.message || "Something went wrong. Please try again.");
    }
  }

  // Razorpay standby mode
  if (razorpayConfigured === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div
          className="bg-white rounded-3xl shadow-lg border-2 max-w-sm w-full p-8 text-center space-y-5"
          style={{ borderColor: "#F59E0B" }}
          data-ocid="checkout.razorpay_maintenance.panel"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment Gateway Under Maintenance
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Our payment system is being configured. Please check back shortly
              or contact support at{" "}
              <a
                href="mailto:support@aflino.com"
                className="underline"
                style={{ color: "#006AFF" }}
              >
                support@aflino.com
              </a>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: "#006AFF" }}
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-6">
          Add some products before checking out.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ background: "#006AFF" }}
          data-ocid="checkout.back_button"
        >
          Browse Products
        </button>
      </div>
    );
  }

  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h2>
          <p
            className="text-gray-500 text-sm mb-6"
            data-ocid="checkout.error_state"
          >
            {failMessage}
          </p>
          <button
            type="button"
            onClick={() => {
              setPaymentFailed(false);
              setFailMessage("");
            }}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm mb-3"
            style={{ background: "#006AFF" }}
            data-ocid="checkout.try_again_button"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
            data-ocid="checkout.cancel_button"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          data-ocid="checkout.back_button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Cart Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" style={{ color: "#006AFF" }} />
            Order Summary
          </h2>
          <div className="space-y-3" data-ocid="checkout.cart.list">
            {cartItems.map((item, i) => (
              <div
                key={item.cartItemId}
                className="flex justify-between items-center"
                data-ocid={`checkout.cart.item.${i + 1}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.productTitle}
                  </p>
                  {item.variant && (
                    <p className="text-xs text-gray-400">
                      {item.variant.size} / {item.variant.color}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-lg" style={{ color: "#006AFF" }}>
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">Delivery Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="chk-name"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Full Name *
              </label>
              <input
                id="chk-name"
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Rahul Sharma"
                data-ocid="checkout.name.input"
              />
              {errors.name && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="checkout.name_error"
                >
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="chk-phone"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Phone *
              </label>
              <input
                id="chk-phone"
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="9876543210"
                maxLength={10}
                data-ocid="checkout.phone.input"
              />
              {errors.phone && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="checkout.phone_error"
                >
                  {errors.phone}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="chk-address"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Full Address *
              </label>
              <textarea
                id="chk-address"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                placeholder="Flat/House No, Street, Locality"
                rows={2}
                data-ocid="checkout.address.textarea"
              />
              {errors.address && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="checkout.address_error"
                >
                  {errors.address}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="chk-city"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                City *
              </label>
              <input
                id="chk-city"
                type="text"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Mumbai"
                data-ocid="checkout.city.input"
              />
              {errors.city && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="checkout.city_error"
                >
                  {errors.city}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="chk-state"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                State *
              </label>
              <input
                id="chk-state"
                type="text"
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="Maharashtra"
                data-ocid="checkout.state.input"
              />
              {errors.state && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="checkout.state_error"
                >
                  {errors.state}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="chk-pincode"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Pincode *
              </label>
              <input
                id="chk-pincode"
                type="text"
                value={form.pincode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, pincode: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                placeholder="400001"
                maxLength={6}
                data-ocid="checkout.pincode.input"
              />
              {errors.pincode && (
                <p
                  className="text-xs text-red-500 mt-1"
                  data-ocid="checkout.pincode_error"
                >
                  {errors.pincode}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment note */}
        <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
          <CreditCard
            className="w-5 h-5 mt-0.5 shrink-0"
            style={{ color: "#006AFF" }}
          />
          <div>
            <p className="text-sm font-semibold text-blue-800">
              Secure Payment via Razorpay
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Supports UPI, Cards, Net Banking, Wallets. 100% secure &amp;
              encrypted.
            </p>
          </div>
        </div>

        {/* Place Order Button */}
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform disabled:opacity-70"
          style={{ background: loading ? "#99C2FF" : "#006AFF" }}
          data-ocid="checkout.submit_button"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" /> Pay ₹
              {total.toLocaleString("en-IN")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
