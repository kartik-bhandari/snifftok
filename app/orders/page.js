"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ChevronRight, Search, Loader2,
  Clock, CheckCircle2, Truck, PackageCheck, XCircle, AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(paise) {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_META = {
  pending:    { label: "Pending",    color: "text-amber-600   bg-amber-50   border-amber-200",  Icon: Clock          },
  confirmed:  { label: "Confirmed",  color: "text-blue-600    bg-blue-50    border-blue-200",   Icon: CheckCircle2   },
  processing: { label: "Processing", color: "text-purple-600  bg-purple-50  border-purple-200", Icon: Package        },
  shipped:    { label: "Shipped",    color: "text-indigo-600  bg-indigo-50  border-indigo-200", Icon: Truck          },
  delivered:  { label: "Delivered",  color: "text-emerald-600 bg-emerald-50 border-emerald-200",Icon: PackageCheck   },
  cancelled:  { label: "Cancelled",  color: "text-rose-600    bg-rose-50    border-rose-200",   Icon: XCircle        },
};

function StatusChip({ status }) {
  const meta = STATUS_META[status] ?? { label: status, color: "text-gray-500 bg-gray-50 border-gray-200", Icon: AlertCircle };
  const { label, color, Icon } = meta;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Order Card ─────────────────────────────────────────────────────────────────
function OrderCard({ order, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-white rounded-[20px] p-5 shadow-xs cursor-pointer hover:shadow-sm active:scale-[0.99] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-bold text-[#0A0A0A]">{order.orderNumber}</p>
            <StatusChip status={order.status} />
          </div>
          <p className="text-[12px] text-[#8A8A8A] mt-0.5">{fmtDate(order.createdAt)}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[15px] font-bold text-[#0A0A0A]">{fmt(order.total)}</p>
          <p className="text-[11px] text-[#8A8A8A]">{order.items.length} {order.items.length === 1 ? "item" : "items"}</p>
        </div>
      </div>

      {/* Item preview */}
      <div className="mt-3 pt-3 border-t border-[#F0F0F0]">
        {order.items.slice(0, 2).map((item, i) => (
          <p key={i} className="text-[12px] text-[#555] capitalize">
            {item.name}
            <span className="text-[#8A8A8A]"> · {item.variantType === 'tester' ? 'Decant' : 'Bottle'} {item.sizeMl}ml × {item.quantity}</span>
          </p>
        ))}
        {order.items.length > 2 && (
          <p className="text-[12px] text-[#8A8A8A]">+{order.items.length - 2} more</p>
        )}
      </div>

      <div className="flex items-center gap-1 mt-3 text-[12px] text-[#8A8A8A]">
        <span>View details</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );
}

// ── Order Detail View ──────────────────────────────────────────────────────────
function OrderDetail({ order, onBack }) {
  const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentStep = steps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.22 }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Header */}
      <div className="bg-white rounded-[20px] p-5 shadow-xs mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-[#8A8A8A] uppercase font-semibold tracking-wider">Order</p>
            <p className="text-[20px] font-bold text-[#0A0A0A]">{order.orderNumber}</p>
            <p className="text-[12px] text-[#8A8A8A] mt-0.5">Placed on {fmtDate(order.createdAt)}</p>
          </div>
          <StatusChip status={order.status} />
        </div>

        {/* Progress stepper */}
        {!isCancelled && (
          <div className="mt-5 pt-5 border-t border-[#F5F5F5]">
            <div className="flex items-center gap-0">
              {steps.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                const meta = STATUS_META[step];
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        done ? "bg-[#0A0A0A] border-[#0A0A0A]" : "bg-white border-[#D0D0D0]"
                      } ${active ? "ring-4 ring-[#0A0A0A]/10" : ""}`}>
                        {done && <meta.Icon className="w-3 h-3 text-white" />}
                      </div>
                      <p className={`text-[9px] font-semibold uppercase tracking-wider text-center leading-tight ${
                        done ? "text-[#0A0A0A]" : "text-[#BCBCBC]"
                      }`}>{meta.label}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`h-[2px] flex-1 mb-5 transition-all ${i < currentStep ? "bg-[#0A0A0A]" : "bg-[#E8E8E8]"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-[20px] p-5 shadow-xs mb-4">
        <p className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider mb-3">Items</p>
        <div className="divide-y divide-[#F5F5F5]">
          {order.items.map((item, i) => (
            <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#0A0A0A] capitalize">{item.name}</p>
                <p className="text-[11px] text-[#8A8A8A] capitalize mt-0.5">
                  {item.variantType === 'tester' ? 'Decant' : 'Bottle'} · {item.sizeMl}ml × {item.quantity}
                  {item.brand && ` · ${item.brand}`}
                </p>
              </div>
              <p className="text-[13px] font-bold text-[#0A0A0A] shrink-0">{fmt(item.lineTotal)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-[#F0F0F0] pt-3 mt-3 space-y-1.5">
          <div className="flex justify-between text-[12px] text-[#8A8A8A]">
            <span>Subtotal</span><span>{fmt(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[12px] text-[#8A8A8A]">
            <span>Delivery</span><span>{fmt(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between text-[15px] font-bold text-[#0A0A0A] pt-1.5 border-t border-[#F0F0F0]">
            <span>Total</span><span>{fmt(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      <div className="bg-white rounded-[20px] p-5 shadow-xs mb-4">
        <p className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider mb-2">Delivery Address</p>
        <p className="text-[13px] text-[#333] leading-relaxed">
          {order.address.line1}
          {(order.address.city || order.address.state) && (
            <>, {[order.address.city, order.address.state].filter(Boolean).join(", ")}</>
          )}
          <br />
          Pincode: {order.address.pincode} · {order.address.country}
        </p>
      </div>

      {/* Help */}
      <p className="text-[12px] text-center text-[#8A8A8A] px-4">
        Questions? Reach us on{" "}
        <a href="https://wa.me/919999999999" className="underline">WhatsApp</a>
        {" "}or email{" "}
        <a href="mailto:support@snifftok.com" className="underline">support@snifftok.com</a>
      </p>
    </motion.div>
  );
}

// ── Guest Lookup ───────────────────────────────────────────────────────────────
function GuestLookup() {
  const [email, setEmail]         = useState("");
  const [orderNum, setOrderNum]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [result, setResult]       = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!email.trim() || !orderNum.trim()) { setError("Both fields are required"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(
        `/api/storefront/orders/lookup?email=${encodeURIComponent(email.trim())}&orderNumber=${encodeURIComponent(orderNum.trim())}`,
        { headers: { "X-Requested-With": "snifftok-web" }, credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) return <OrderDetail order={result} onBack={() => setResult(null)} />;

  return (
    <div className="max-w-[420px] mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-white shadow-xs flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7 text-[#8A8A8A]" />
        </div>
        <h2 className="text-[18px] font-bold text-[#0A0A0A]">Track Your Order</h2>
        <p className="text-[13px] text-[#8A8A8A] mt-1">Enter the email you used at checkout and your order number.</p>
      </div>

      <form onSubmit={handleLookup} className="bg-white rounded-[20px] p-5 shadow-xs space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="px-3.5 py-2.5 rounded-[12px] border border-[#E0E0E0] text-[14px] outline-none focus:border-[#0A0A0A] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Order Number</label>
          <input
            type="text" value={orderNum} onChange={e => setOrderNum(e.target.value)}
            placeholder="ORD-20241023-0001"
            className="px-3.5 py-2.5 rounded-[12px] border border-[#E0E0E0] text-[14px] outline-none focus:border-[#0A0A0A] transition-colors"
          />
        </div>
        {error && <p className="text-[12px] text-rose-500 bg-rose-50 rounded-[10px] px-3 py-2">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full py-3 rounded-full bg-[#0A0A0A] text-white text-[13px] font-semibold hover:bg-black/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Looking up…</> : "Find Order"}
        </button>
      </form>

      <p className="text-center text-[12px] text-[#8A8A8A] mt-5">
        Have an account?{" "}
        <Link href="/login" className="underline text-[#0A0A0A]">Sign in</Link>{" "}
        to see all your orders.
      </p>
    </div>
  );
}

// ── Logged-in Orders List ──────────────────────────────────────────────────────
function MyOrdersList() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/storefront/orders/mine", {
          headers: { "X-Requested-With": "snifftok-web" },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setOrders(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (selected) {
    return <OrderDetail order={selected} onBack={() => setSelected(null)} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-white rounded-[20px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <p className="text-[14px] text-[#0A0A0A] font-medium">Could not load orders</p>
        <p className="text-[12px] text-[#8A8A8A] mt-1">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-white shadow-xs flex items-center justify-center mb-5">
          <Package className="w-9 h-9 text-[#8A8A8A] stroke-[1.5]" />
        </div>
        <h2 className="text-[18px] font-bold text-[#0A0A0A]">No orders yet</h2>
        <p className="text-[13px] text-[#8A8A8A] mt-1 max-w-[240px]">
          Once you place an order it will appear here.
        </p>
        <Link
          href="/"
          className="mt-6 px-7 py-2.5 rounded-full bg-[#0A0A0A] text-white text-[13px] font-semibold hover:bg-black/90 active:scale-95 transition-all"
        >
          Browse Fragrances
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {orders.map(order => (
          <OrderCard key={order._id} order={order} onClick={() => setSelected(order)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // While auth loads, show skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] pt-24 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-[20px] animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full pt-20 sm:pt-24">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 flex-1 pb-10">
        {/* Page Header */}
        <div className="pb-5 mb-6 border-b border-[#E0E0E0] flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs hover:bg-[#EBEBEB] active:scale-90 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[20px] sm:text-[24px] font-bold text-[#0A0A0A] tracking-tight">
              {user ? "My Orders" : "Track Order"}
            </h1>
            {user && (
              <p className="text-[12px] text-[#8A8A8A] mt-0.5">
                Signed in as {user.email}
              </p>
            )}
          </div>
        </div>

        {/* Content — logged in shows order list, guest shows lookup form */}
        {user ? <MyOrdersList /> : <GuestLookup />}
      </div>

      <Footer />
    </div>
  );
}
