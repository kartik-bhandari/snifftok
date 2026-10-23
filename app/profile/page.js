"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag, Heart, LogOut,
  ChevronRight, Package, ArrowRight, User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";

// ── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size = "md" }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const sz = size === "lg"
    ? "w-28 h-28 text-3xl"
    : "w-20 h-20 text-2xl";

  return (
    <div className={`${sz} rounded-full bg-[#0A0A0A] text-white flex items-center justify-center font-wordmark tracking-widest shadow-lg shrink-0`}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-[#F5F5F5] rounded-2xl p-4 flex flex-col items-center gap-1.5">
      <Icon className="w-4 h-4 text-[#8A8A8A]" />
      <span className="text-xl font-bold text-[#0A0A0A]">{value}</span>
      <span className="text-[10px] text-[#8A8A8A] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function MenuRow({ label, icon: Icon, href, onClick, danger, description }) {
  const cls = `flex items-center justify-between px-4 py-3.5 hover:bg-[#F5F5F5] active:bg-[#EFEFEF] transition-colors rounded-2xl cursor-pointer ${
    danger ? "text-red-500" : "text-[#0A0A0A]"
  }`;
  const inner = (
    <>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-red-50" : "bg-[#F0F0F0]"}`}>
          <Icon className={`w-4 h-4 ${danger ? "text-red-400" : "text-[#5A5A5A]"}`} />
        </div>
        <div>
          <p className="text-sm font-medium leading-tight">{label}</p>
          {description && <p className="text-xs text-[#8A8A8A] mt-0.5">{description}</p>}
        </div>
      </div>
      {!danger && <ChevronRight className="w-4 h-4 text-[#CACACA] shrink-0" />}
    </>
  );

  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={`w-full ${cls}`}>{inner}</button>;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { cart, wishlist } = useStore();
  const [orderCount, setOrderCount] = useState(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Fetch real order count for logged-in user
  useEffect(() => {
    if (!user) return;
    fetch("/api/storefront/orders/mine", {
      headers: { "X-Requested-With": "snifftok-web" },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setOrderCount(data.data?.length ?? 0))
      .catch(() => setOrderCount(0));
  }, [user]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#EFEFEF] flex items-center justify-center pt-20">
        <span className="w-6 h-6 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  return (
    <>
      <title>My Profile — snifftok</title>
      <main className="min-h-screen bg-[#EFEFEF] pb-40 md:pb-12 pt-20 md:pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Desktop two-column / Mobile single-column ── */}
          <div className="md:grid md:grid-cols-[340px_1fr] md:gap-6 lg:grid-cols-[380px_1fr] lg:gap-8 space-y-4 md:space-y-0">

            {/* ══ LEFT COLUMN ══════════════════════════════════════════ */}
            <div className="space-y-4">

              {/* Profile hero */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl p-6 shadow-xs border border-[#EBEBEB]"
              >
                {/* Mobile: centered | Desktop: left-aligned row */}
                <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left md:gap-5">
                  <Avatar name={user.name} size="lg" />
                  <div className="mt-4 md:mt-0">
                    <h1 className="font-wordmark text-[#0A0A0A] text-2xl md:text-3xl leading-tight">
                      {user.name}
                    </h1>
                    <p className="text-[#8A8A8A] text-sm mt-1">{user.email}</p>
                    {memberSince && (
                      <p className="text-[10px] text-[#CACACA] tracking-wide uppercase mt-2">
                        Member since {memberSince}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="grid grid-cols-3 gap-3"
              >
                <StatCard label="In Bag"   value={cart.length}     icon={ShoppingBag} />
                <StatCard label="Wishlist" value={wishlist.length}  icon={Heart} />
                <StatCard label="Orders"   value={orderCount ?? "—"} icon={Package} />
              </motion.div>

              {/* Fragrance CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="bg-[#0A0A0A] rounded-3xl p-6 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-white text-sm font-semibold mb-1">Explore Fragrances</p>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Discover your next signature scent
                  </p>
                </div>
                <Link
                  href="/categories"
                  className="bg-white text-[#0A0A0A] text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-[#F0F0F0] transition-colors shrink-0"
                >
                  Browse <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>

            {/* ══ RIGHT COLUMN ═════════════════════════════════════════ */}
            <div className="space-y-4">

              {/* Account menu */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-3xl shadow-xs border border-[#EBEBEB] overflow-hidden"
              >
                <div className="px-3 py-3 space-y-0.5">
                  <p className="text-[10px] font-semibold text-[#8A8A8A] uppercase tracking-wider px-4 pt-1 pb-2">
                    My Account
                  </p>
                  <MenuRow
                    label="My Orders"
                    description="Track and view past purchases"
                    icon={Package}
                    href="/orders"
                  />
                  <MenuRow
                    label="My Wishlist"
                    description="Saved fragrances"
                    icon={Heart}
                    href="/wishlist"
                  />
                  <MenuRow
                    label="Account Details"
                    description="Edit name and contact info"
                    icon={User}
                    href="/profile/account-details"
                  />
                </div>
              </motion.div>

              {/* Sign out */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.18 }}
                className="bg-white rounded-3xl shadow-xs border border-[#EBEBEB] px-3 py-3"
              >
                <MenuRow label="Sign out" icon={LogOut} onClick={logout} danger />
              </motion.div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
