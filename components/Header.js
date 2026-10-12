"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, ShoppingBag, Plus, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

export default function Header() {
  const pathname = usePathname();
  const {
    isMenuOpen,
    setIsMenuOpen,
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
    setIsFragranceGuideOpen,
    wishlist,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSubpage = pathname !== "/";
  const hasFrostedHeader = isSubpage || isScrolled;

  const scrollToSection = (e, id) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${id}`);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        hasFrostedHeader
          ? "bg-[#EFEFEF]/85 backdrop-blur-md border-b border-[#0A0A0A]/5 shadow-xs py-1"
          : "bg-transparent py-0 pointer-events-none"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2 flex items-center justify-between pointer-events-auto">
        {/* Left: Frosted Pill with Morphing Toggle & Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="glass-pill rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-2.5 transition-all shadow-sm">
            <button
              id="menu-toggle-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-7 h-7 rounded-full bg-[#E5E5E5] hover:bg-[#DCDCDC] active:scale-95 flex items-center justify-center text-[#0A0A0A] transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-4 h-4 stroke-[2.2]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Plus className="w-4 h-4 stroke-[2.2]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="font-wordmark text-[17px] sm:text-[19px] tracking-tight text-[#0A0A0A] select-none hover:opacity-85 transition-opacity"
            >
              snifftok
            </Link>
          </div>
        </div>

        {/* Center: Desktop Navigation Links Pill (Strictly centered on md+ screens) */}
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
          <nav aria-label="Desktop Primary Navigation" className="glass-pill rounded-full px-6 py-2 flex items-center gap-6 text-[13px] font-medium text-[#0A0A0A] shadow-sm">
            <Link
              href="/#new-arrivals"
              onClick={(e) => scrollToSection(e, "new-arrivals")}
              className="hover:text-[#8A8A8A] transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              href="/#best-sellers"
              onClick={(e) => scrollToSection(e, "best-sellers")}
              className="hover:text-[#8A8A8A] transition-colors"
            >
              Best Sellers
            </Link>
            <Link
              href="/#testers"
              onClick={(e) => scrollToSection(e, "testers")}
              className="hover:text-[#8A8A8A] transition-colors"
            >
              Testers & Samples
            </Link>
            <button
              onClick={() => setIsFragranceGuideOpen(true)}
              className="hover:text-[#8A8A8A] transition-colors"
            >
              Fragrance Guide
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 text-[#8A8A8A] hover:text-[#0A0A0A] pl-2 border-l border-[#0A0A0A]/10 transition-colors"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Search</span>
            </button>
          </nav>
        </div>

        {/* Right: Wishlist & Bag icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            id="header-wishlist-btn"
            className="h-9 px-2.5 sm:px-3 rounded-full glass-pill flex items-center justify-center gap-1.5 text-[#0A0A0A] hover:bg-white active:scale-95 transition-all relative"
            aria-label="Wishlist"
          >
            <Bookmark
              className={`w-4 h-4 ${
                wishlistCount > 0 ? "fill-[#0A0A0A] stroke-[#0A0A0A]" : "stroke-[#0A0A0A]"
              }`}
            />
            {wishlistCount > 0 && (
              <span className="text-[11px] font-semibold text-[#0A0A0A]">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart / Bag Button */}
          <button
            id="header-bag-btn"
            onClick={() => setIsCartOpen(true)}
            className="h-9 px-3 sm:px-3.5 rounded-full glass-pill flex items-center justify-center gap-2 text-[#0A0A0A] hover:bg-white active:scale-95 transition-all relative"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[#0A0A0A]" />
            <span className="text-[12px] font-semibold text-[#0A0A0A] hidden sm:inline">
              Bag
            </span>
            {cartCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#0A0A0A] text-white text-[10px] font-semibold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
