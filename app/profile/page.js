"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, ShoppingBag, Heart, LogOut,
  ChevronRight, Package, Settings, ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";

function Avatar({ name }) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="w-20 h-20 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-2xl font-wordmark tracking-widest shadow-lg">
      {initials}
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-1.5 shadow-xs border border-[#EBEBEB]">
      <Icon className="w-4 h-4 text-[#8A8A8A]" />
      <span className="text-xl font-bold text-[#0A0A0A]">{value}</span>
      <span className="text-[10px] text-[#8A8A8A] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function MenuRow({ label, icon: Icon, href, onClick, danger }) {
  const cls = `flex items-center justify-between px-4 py-3.5 hover:bg-[#F5F5F5] active:bg-[#EFEFEF] transition-colors rounded-2xl cursor-pointer ${
    danger ? "text-red-500" : "text-[#0A0A0A]"
  }`;
  const inner = (
    <>
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${danger ? "text-red-400" : "text-[#8A8A8A]"}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {!danger && <ChevronRight className="w-4 h-4 text-[#CACACA]" />}
    </>
  );

  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={`w-full ${cls}`}>{inner}</button>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { cart, wishlist } = useStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#EFEFEF] flex items-center justify-center pt-20">
        <span className="w-6 h-6 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <title>My Profile — snifftok</title>
      <main className="min-h-screen bg-[#EFEFEF] pb-40 md:pb-16 pt-20">
        <div className="max-w-sm mx-auto px-4 space-y-4">

          {/* ── Profile Hero Card ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-xs border border-[#EBEBEB] text-center"
          >
            <Avatar name={user.name} />
            <h1 className="font-wordmark text-[#0A0A0A] text-2xl mt-4 mb-0.5">{user.name}</h1>
            <p className="text-[#8A8A8A] text-xs mb-1">{user.email}</p>
            <p className="text-[10px] text-[#CACACA] tracking-wide uppercase">
              Member since {memberSince}
            </p>
          </motion.div>

          {/* ── Stats Row ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="grid grid-cols-3 gap-3"
          >
            <StatCard label="In Bag" value={cart.length} icon={ShoppingBag} />
            <StatCard label="Wishlist" value={wishlist.length} icon={Heart} />
            <StatCard label="Orders" value={user.orders?.length || 0} icon={Package} />
          </motion.div>

          {/* ── Menu ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="bg-white rounded-3xl shadow-xs border border-[#EBEBEB] overflow-hidden divide-y divide-[#F0F0F0]"
          >
            <div className="px-2 py-2 space-y-0.5">
              <MenuRow label="My Orders" icon={Package} href="#" />
              <MenuRow label="My Wishlist" icon={Heart} href="/wishlist" />
              <MenuRow label="Account Details" icon={Settings} href="#" />
            </div>
          </motion.div>

          {/* ── Fragrance CTA ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-[#0A0A0A] rounded-3xl p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-white text-sm font-semibold mb-0.5">Explore Fragrances</p>
              <p className="text-white/40 text-xs">Discover your next signature scent</p>
            </div>
            <Link
              href="/categories"
              className="bg-white text-[#0A0A0A] text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-[#F0F0F0] transition-colors shrink-0"
            >
              Browse <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* ── Logout ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="bg-white rounded-3xl shadow-xs border border-[#EBEBEB] px-2 py-2"
          >
            <MenuRow label="Sign out" icon={LogOut} onClick={logout} danger />
          </motion.div>

        </div>
      </main>
    </>
  );
}
