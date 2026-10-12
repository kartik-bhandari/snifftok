"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Compass, User, MapPin, Search, LayoutGrid, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsSearchOpen, setIsMenuOpen } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("explore");

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hello snifftok, I would like to inquire about fragrance recommendations."
  )}`;

  useEffect(() => {
    // If not on home page, show bottom nav immediately
    if (pathname !== "/") {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      // Appear after scrolling past the hero (~300px)
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="fixed bottom-6 left-0 right-0 z-40 pointer-events-none flex justify-center items-center px-3 md:hidden"
        >
          {/* Centered Symmetrical Bar: [Blue Action Button] [Frosted 4-Icon Pill] [WhatsApp Concierge Button] */}
          <div className="pointer-events-auto flex items-center justify-center gap-2.5 sm:gap-3.5 max-w-full">
            {/* 1. Left Action Button with Signature #2F80FF Blue Ring */}
            <button
              id="bottomnav-category-btn"
              onClick={() => {
                if (pathname !== "/") {
                  router.push("/");
                } else {
                  setIsMenuOpen(true);
                }
              }}
              className="w-[52px] h-[52px] min-[390px]:w-[56px] min-[390px]:h-[56px] rounded-full bg-white text-[#0A0A0A] flex items-center justify-center shadow-xl border-[3px] border-[#2F80FF] hover:scale-105 active:scale-95 transition-transform shrink-0"
              aria-label="Category / Menu action"
            >
              <LayoutGrid className="w-5 h-5 min-[390px]:w-6 min-[390px]:h-6 stroke-[2.2] text-[#0A0A0A]" />
            </button>

            {/* 2. Frosted Glass Pill with 4 Icons */}
            <nav
              aria-label="Bottom Navigation"
              className="glass-pill rounded-full h-[52px] min-[390px]:h-[56px] px-4 min-[390px]:px-6 sm:px-7 flex items-center justify-between gap-5 min-[390px]:gap-7 sm:gap-8 shadow-xl border border-white/70 shrink-0"
            >
              {/* 1. Explore (Compass) */}
              <button
                id="bottomnav-explore-btn"
                onClick={() => {
                  setActiveTab("explore");
                  if (pathname === "/") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    router.push("/");
                  }
                }}
                className={`flex items-center justify-center transition-colors active:scale-90 p-1 ${
                  activeTab === "explore" ? "text-[#0A0A0A]" : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                }`}
                aria-label="Explore"
              >
                <Compass className="w-5 h-5 min-[390px]:w-[22px] min-[390px]:h-[22px] stroke-[2.2]" />
              </button>

              {/* 2. Account (User) */}
              <button
                id="bottomnav-account-btn"
                onClick={() => {
                  setActiveTab("account");
                  setIsMenuOpen(true);
                }}
                className={`flex items-center justify-center transition-colors active:scale-90 p-1 ${
                  activeTab === "account" ? "text-[#0A0A0A]" : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                }`}
                aria-label="Account"
              >
                <User
                  className={`w-5 h-5 min-[390px]:w-[22px] min-[390px]:h-[22px] ${
                    activeTab === "account" ? "fill-[#0A0A0A] stroke-[#0A0A0A]" : "stroke-[2.2]"
                  }`}
                />
              </button>

              {/* 3. Stores / Contact (MapPin) */}
              <button
                id="bottomnav-stores-btn"
                onClick={() => {
                  setActiveTab("stores");
                  const footerEl = document.getElementById("store-footer");
                  if (footerEl) {
                    footerEl.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/#store-footer");
                  }
                }}
                className={`flex items-center justify-center transition-colors active:scale-90 p-1 ${
                  activeTab === "stores" ? "text-[#0A0A0A]" : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                }`}
                aria-label="Boutique Stores & Contact"
              >
                <MapPin className="w-5 h-5 min-[390px]:w-[22px] min-[390px]:h-[22px] stroke-[2.2]" />
              </button>

              {/* 4. Search (Search) */}
              <button
                id="bottomnav-search-btn"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors active:scale-90 p-1"
                aria-label="Search Fragrances"
              >
                <Search className="w-5 h-5 min-[390px]:w-[22px] min-[390px]:h-[22px] stroke-[2.2]" />
              </button>
            </nav>

            {/* 3. Right WhatsApp Concierge Button */}
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
      )}
    </AnimatePresence>
  );
}
