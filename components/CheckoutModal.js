"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { X, CheckCircle, ChevronRight, Loader2, Package } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { openRazorpayCheckout } from "@/lib/razorpayCheckout";
import { takeResumeCheckout } from "@/lib/checkoutResume";

export default function CheckoutModal() {
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsCartOpen,
    clearCart,
    shippingInfo,
    totalAmountFormatted,
    subtotalFormatted,
  } = useStore();

  const { user } = useAuth();

  // Back from signing in to check out — reopen checkout (not on the login
  // page itself, which signs in and then reloads the page they came from)
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/login")) return;
    if (user && cart.length && takeResumeCheckout()) setIsCheckoutOpen(true);
  }, [pathname, user, cart.length, setIsCheckoutOpen]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(null); // { orderNumber, paid, needsAttention }
  // Order created but not paid yet (Razorpay window closed or payment failed)
  const [awaiting, setAwaiting] = useState(null); // { orderId, orderNumber, total, error }

  // Pre-fill from user if logged in
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name:  f.name  || user.name  || "",
        email: f.email || user.email || "",
      }));
    }
  }, [user, isCheckoutOpen]);

  const close = () => {
    setIsCheckoutOpen(false);
    setPlaced(null);
    setAwaiting(null);
    setErrors({});
  };

  const API_HEADERS = { "Content-Type": "application/json", "X-Requested-With": "snifftok-web" };

  /** Order is paid / placed — empty the bag and show the success screen */
  const finish = (result) => {
    setAwaiting(null);
    setPlaced(result);
    clearCart();
    setIsCartOpen(false);
  };

  /** Open Razorpay for an order, then verify the payment with the API */
  const pay = async ({ orderId, orderNumber, total, razorpay }) => {
    const outcome = await openRazorpayCheckout(razorpay, {
      orderNumber,
      prefill: { name: form.name.trim(), email: form.email.trim(), contact: form.phone.replace(/\s/g, "") },
    });

    if (outcome.status !== "paid") {
      setAwaiting({ orderId, orderNumber, total, error: outcome.error });
      return;
    }

    const res = await fetch(`/api/storefront/orders/${orderId}/verify-payment`, {
      method: "POST", headers: API_HEADERS, credentials: "include",
      body: JSON.stringify(outcome.response),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // The webhook will still confirm a genuine payment — tell them where to look
      setAwaiting({ orderId, orderNumber, total, error: data.message || "We couldn't confirm the payment yet." });
      return;
    }
    finish({ orderNumber, paid: true, needsAttention: data.needsAttention });
  };

  /** "Pay now" after closing the Razorpay window */
  const retryPayment = async () => {
    if (!awaiting) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/storefront/orders/${awaiting.orderId}/pay`, {
        method: "POST", headers: API_HEADERS, credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (data.paid) return finish({ orderNumber: awaiting.orderNumber, paid: true });
      if (!res.ok) throw new Error(data.message || "Couldn't start the payment.");
      await pay(data);
    } catch (err) {
      setAwaiting((a) => a && { ...a, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Full name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())   e.phone   = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid 10-digit Indian mobile number";
    if (!form.line1.trim())   e.line1   = "Address is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      // What's in the bag — prices and totals are calculated by the API
      const items = cart.map((item) => ({
        productId:   item.productId ?? item.id ?? item._id,
        name:        item.name,
        brand:       item.brand ?? "",
        sku:         item.sku ?? undefined,   // older carts have none — API falls back to product + size
        variantType: item.variantType ?? "bottle",
        sizeMl:      parseInt(item.ml) || 0,
        image:       item.image ?? "",
        quantity:    item.quantity,
      }));

      const body = {
        customer: {
          name:  form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim().replace(/\s/g, ""),
        },
        address: {
          line1:   form.line1.trim(),
          city:    form.city.trim(),
          state:   form.state.trim(),
          pincode: form.pincode.trim(),
          country: "India",
        },
        items,
      };

      const res = await fetch("/api/storefront/orders", {
        method:  "POST",
        headers: API_HEADERS,
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order");

      // Prepaid only — the order is placed once the payment goes through
      await pay(data);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, props = {}) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={`checkout-${key}`} className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">
        {label}
      </label>
      <input
        id={`checkout-${key}`}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={`w-full px-3.5 py-2.5 rounded-[12px] border text-[14px] bg-white outline-none transition-colors
          ${errors[key] ? "border-rose-400 bg-rose-50" : "border-[#E0E0E0] focus:border-[#0A0A0A]"}`}
        {...props}
      />
      {errors[key] && <p className="text-[11px] text-rose-500">{errors[key]}</p>}
    </div>
  );

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Sheet / Modal */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative w-full sm:max-w-[480px] max-h-[92vh] bg-[#F5F5F5] rounded-t-[28px] sm:rounded-[28px] overflow-hidden flex flex-col shadow-2xl z-10"
          >
            {/* Handle bar (mobile) */}
            <div className="sm:hidden mx-auto mt-3 w-10 h-1 rounded-full bg-[#D0D0D0] shrink-0" />

            {/* Header */}
            <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0">
              <h2 className="text-[17px] font-bold text-[#0A0A0A]">
                {placed ? "Order Placed!" : "Checkout"}
              </h2>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-[#EBEBEB] active:scale-90 transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── SUCCESS STATE ── */}
            {placed ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10 text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-[22px] font-bold text-[#0A0A0A] tracking-tight">Thank you!</p>
                  <p className="text-[14px] text-[#666] mt-1">
                    Payment received — your order is confirmed.
                  </p>
                </div>
                <div className="bg-white rounded-[16px] px-6 py-4 w-full">
                  <p className="text-[12px] text-[#8A8A8A] uppercase tracking-wider font-semibold">Order Number</p>
                  <p className="text-[18px] font-bold text-[#0A0A0A] mt-0.5">{placed.orderNumber}</p>
                </div>
                <p className="text-[13px] text-[#8A8A8A] max-w-[280px]">
                  {placed.needsAttention
                    ? "Your payment came in after the order had expired and an item has since sold out. We'll refund you in full — or message us on WhatsApp."
                    : "We'll pack it up and send tracking details to your email."}
                </p>
                <button
                  onClick={close}
                  className="mt-2 px-8 py-3 rounded-full bg-[#0A0A0A] text-white text-[13px] font-semibold hover:bg-black/90 active:scale-95 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            ) : awaiting ? (
              /* ── PAYMENT NOT COMPLETED ── */
              <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10 text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                  <Package className="w-9 h-9 text-amber-500 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-[#0A0A0A] tracking-tight">Payment not completed</p>
                  <p className="text-[13px] text-[#666] mt-1">
                    Your order isn&apos;t placed until the payment goes through. We&apos;ll hold your items for 30 minutes.
                  </p>
                </div>
                {awaiting.error && (
                  <p className="text-[12px] text-rose-600 bg-rose-50 rounded-[12px] px-4 py-2 w-full">{awaiting.error}</p>
                )}
                <button
                  onClick={retryPayment}
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#0A0A0A] text-white text-[14px] font-semibold hover:bg-black/90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Pay ₹{Math.round(awaiting.total / 100).toLocaleString("en-IN")} now
                </button>
                <button onClick={close} className="text-[12px] text-[#8A8A8A] hover:text-[#0A0A0A] underline underline-offset-2">
                  Cancel
                </button>
              </div>
            ) : (
              /* ── FORM STATE ── */
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="px-5 pb-5 space-y-4">
                  {/* Order summary strip */}
                  <div className="bg-white rounded-[16px] p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-[#8A8A8A]" />
                      <span className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
                        {cart.length} {cart.length === 1 ? "item" : "items"} in your bag
                      </span>
                    </div>
                    {cart.map((item) => (
                      <div key={item.itemKey} className="flex justify-between text-[13px]">
                        <span className="text-[#444] capitalize truncate max-w-[200px]">
                          {item.name} <span className="text-[#8A8A8A]">×{item.quantity}</span>
                        </span>
                        <span className="font-medium text-[#0A0A0A] shrink-0 ml-2">{item.price}</span>
                      </div>
                    ))}
                    <div className="border-t border-[#F0F0F0] pt-2 mt-2 space-y-1">
                      <div className="flex justify-between text-[12px] text-[#8A8A8A]">
                        <span>Subtotal</span><span>{subtotalFormatted}</span>
                      </div>
                      <div className="flex justify-between text-[12px] text-[#8A8A8A]">
                        <span>Delivery</span><span>{shippingInfo.formattedShipping}</span>
                      </div>
                      <div className="flex justify-between text-[14px] font-bold text-[#0A0A0A] pt-1">
                        <span>Total</span><span>{totalAmountFormatted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="bg-white rounded-[16px] p-4 space-y-3">
                    <p className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">Contact</p>
                    {field("name",  "Full Name",     { placeholder: "Arjun Sharma", autoComplete: "name" })}
                    {field("email", "Email",         { placeholder: "arjun@example.com", type: "email", autoComplete: "email" })}
                    {field("phone", "Mobile Number", { placeholder: "9876543210", type: "tel", inputMode: "numeric", maxLength: 10 })}
                  </div>

                  {/* Delivery address */}
                  <div className="bg-white rounded-[16px] p-4 space-y-3">
                    <p className="text-[12px] font-semibold text-[#8A8A8A] uppercase tracking-wider">Delivery Address</p>
                    {field("line1",   "Address",  { placeholder: "Flat 4B, Marina Towers, MG Road", autoComplete: "street-address" })}
                    <div className="grid grid-cols-2 gap-3">
                      {field("city",  "City",  { placeholder: "Mumbai", autoComplete: "address-level2" })}
                      {field("state", "State", { placeholder: "Maharashtra", autoComplete: "address-level1" })}
                    </div>
                    {field("pincode", "Pincode", { placeholder: "400001", inputMode: "numeric", maxLength: 6, autoComplete: "postal-code" })}
                  </div>

                  {errors.submit && (
                    <p className="text-[13px] text-rose-500 text-center bg-rose-50 rounded-[12px] px-4 py-3">
                      {errors.submit}
                    </p>
                  )}
                </div>

                {/* Sticky CTA */}
                <div className="sticky bottom-0 px-5 py-4 bg-[#F5F5F5] border-t border-[#E8E8E8]">
                  <button
                    type="submit"
                    disabled={loading}
                    id="place-order-btn"
                    className="w-full py-3.5 rounded-full bg-[#0A0A0A] text-white text-[13px] font-semibold tracking-wider uppercase hover:bg-black/90 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</>
                    ) : (
                      <>Place Order <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-[#8A8A8A] mt-2">Cash on delivery · No prepayment required</p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
