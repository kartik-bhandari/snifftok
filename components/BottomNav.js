"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Compass, User, Search, LayoutGrid, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/context/StoreContext";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsSearchOpen } = useStore();
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hello snifftok, I would like to inquire about fragrance recommendations."
  )}`;

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname === "/categories") return "categories";
    if (pathname === "/profile" || pathname === "/wishlist" || pathname === "/orders") return "profile";
    return "explore";
  };

  const activeTab = getActiveTab();

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="fixed bottom-6 left-0 right-0 z-40 pointer-events-none flex justify-center items-center px-3 md:hidden"
    >
          <div className="pointer-events-auto flex items-center justify-center gap-3 w-full max-w-[420px]">

            {/* ── LEFT: Categories Button ── */}
            <button
              id="bottomnav-categories-btn"
              onClick={() => router.push("/categories")}
              aria-label="Browse Categories"
              className={`w-[52px] h-[52px] min-[390px]:w-[56px] min-[390px]:h-[56px] rounded-full flex items-center justify-center shadow-xl border-[3px] transition-all shrink-0 hover:scale-105 active:scale-95 ${
                activeTab === "categories"
                  ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                  : "bg-white border-[#2F80FF] text-[#0A0A0A]"
              }`}
            >
              <LayoutGrid className="w-5 h-5 min-[390px]:w-[22px] min-[390px]:h-[22px] stroke-[2.2]" />
            </button>

            {/* ── CENTRE: Frosted Pill — Explore · Search · Profile ── */}
            <nav
              aria-label="Main Navigation"
              className="glass-pill rounded-full h-[52px] min-[390px]:h-[56px] flex-1 px-5 min-[390px]:px-7 flex items-center justify-between shadow-xl border border-white/70"
            >
              {/* Explore */}
              <button
                id="bottomnav-explore-btn"
                onClick={() => {
                  if (pathname === "/") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    router.push("/");
                  }
                }}
                aria-label="Explore shop"
                className={`flex items-center justify-center transition-all active:scale-90 p-1 ${
                  activeTab === "explore"
                    ? "text-[#0A0A0A]"
                    : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                }`}
              >
                <Compass
                  className={`w-5 h-5 min-[390px]:w-[22px] min-[390px]:h-[22px] stroke-[2.2] ${
                    activeTab === "explore" ? "stroke-[2.8]" : ""
                  }`}
                />
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-black/10 rounded-full" />

              {/* Search */}
              <button
                id="bottomnav-search-btn"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search fragrances"
                className="flex items-center justify-center text-[#8A8A8A] hover:text-[#0A0A0A] transition-all active:scale-90 p-1"
              >
                <Search className="w-5 h-5 min-[390px]:w-[22px] min-[390px]:h-[22px] stroke-[2.2]" />
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-black/10 rounded-full" />

              {/* Profile */}
              <button
                id="bottomnav-profile-btn"
                onClick={() => router.push("/profile")}
                aria-label="Profile & Wishlist"
                className={`flex items-center justify-center transition-all active:scale-90 p-1 ${
                  activeTab === "profile"
                    ? "text-[#0A0A0A]"
                    : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                }`}
              >
                <User
                  className={`w-5 h-5 min-[390px]:w-[22px] min-[390px]:h-[22px] stroke-[2.2] ${
                    activeTab === "profile" ? "fill-[#0A0A0A] stroke-[#0A0A0A]" : ""
                  }`}
                />
              </button>
            </nav>

            {/* ── RIGHT: WhatsApp Button ── */}
            <a
              id="whatsapp-chat-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with snifftok concierge on WhatsApp"
              className="w-[52px] h-[52px] min-[390px]:w-[56px] min-[390px]:h-[56px] rounded-full bg-[#0A0A0A] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform shrink-0"
            >
              <MessageCircle className="w-5 h-5 min-[390px]:w-6 min-[390px]:h-6 fill-white stroke-none" />
            </a>

          </div>
        </motion.div>
  );
}
