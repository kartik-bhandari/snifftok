"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function formatPaise(paise) {
  if (!paise) return null;
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export default function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen } = useStore();
  const [query, setQuery]         = useState("");
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const inputRef = useRef(null);

  // Focus input when opened, clear query when closed
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isSearchOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && isSearchOpen) setIsSearchOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSearchOpen, setIsSearchOpen]);

  // Fetch all products once when overlay opens
  useEffect(() => {
    if (!isSearchOpen || products.length > 0) return;
    setLoading(true);
    fetch(`${API}/api/products?limit=200&sort=name`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isSearchOpen]);

  // Sort alphabetically, then filter by name or brand
  const displayed = useMemo(() => {
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const getPrice = (p) => {
    const variant = (p.variants ?? []).find(
      (v) => v.type === "bottle" && v.pricing?.unitPriceExclDelivery
    ) ?? (p.variants ?? []).find((v) => v.pricing?.unitPriceExclDelivery);
    return formatPaise(variant?.pricing?.unitPriceExclDelivery);
  };

  const getImage = (p) => {
    const img = p.images?.[0];
    return typeof img === "string" ? img : img?.url ?? null;
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-6 overflow-y-auto pointer-events-auto">
          {/* Backdrop on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs hidden sm:block"
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full sm:max-w-2xl bg-[#EFEFEF] sm:rounded-[32px] sm:shadow-2xl overflow-y-auto min-h-screen sm:min-h-0 sm:max-h-[85vh] sm:mt-16 flex flex-col p-5 sm:p-8 select-none z-10"
          >
            {/* Search Bar */}
            <div className="flex items-center gap-3 pb-4 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type="text"
                  id="search-input"
                  placeholder="Search by name or brand…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white rounded-full pl-10 pr-10 py-3 text-[14px] text-[#0A0A0A] placeholder-[#8A8A8A] shadow-xs outline-none focus:ring-1 focus:ring-[#0A0A0A]"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#0A0A0A]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-[13px] font-medium text-[#0A0A0A] hover:opacity-75 px-2 py-2 active:scale-95"
              >
                Cancel
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 pt-2">
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A8A]">
                  {query.trim()
                    ? `${displayed.length} result${displayed.length !== 1 ? "s" : ""} for "${query.trim()}"`
                    : `All Fragrances (${displayed.length})`}
                </span>
                {loading && <Loader2 className="w-3.5 h-3.5 text-[#8A8A8A] animate-spin" />}
              </div>

              {!loading && displayed.length === 0 && (
                <div className="pt-12 pb-8 text-center text-[#8A8A8A]">
                  <p className="text-[15px] font-medium text-[#0A0A0A]">
                    No fragrances found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[12px] mt-1">Try a different name or brand.</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayed.map((p) => {
                  const image = getImage(p);
                  const price = getPrice(p);
                  return (
                    <Link
                      key={p._id ?? p.slug}
                      href={`/product/${p.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 bg-white p-3 rounded-[18px] hover:shadow-sm transition-shadow"
                    >
                      <div className="relative w-14 h-16 rounded-[12px] overflow-hidden bg-[#F0F0F0] shrink-0">
                        {image ? (
                          <Image
                            src={image}
                            alt={p.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#E8E8E8]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {p.brand && (
                          <span className="text-[10px] text-[#8A8A8A] uppercase font-semibold tracking-wide">
                            {p.brand}
                          </span>
                        )}
                        <h4 className="text-[13px] font-bold text-[#0A0A0A] capitalize truncate leading-snug">
                          {p.name}
                        </h4>
                        {price && (
                          <p className="text-[12px] text-[#8A8A8A] font-medium mt-0.5">{price}</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#8A8A8A] shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
