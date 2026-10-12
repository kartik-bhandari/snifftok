"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import productsData from "@/data/products.json";

export default function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isSearchOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const filteredProducts = query.trim()
    ? productsData.filter((p) => {
        const q = query.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesCategory = p.notesCategory?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
        const matchesNotes = [
          ...(p.notes?.top || []),
          ...(p.notes?.heart || []),
          ...(p.notes?.base || []),
        ].some((n) => n.toLowerCase().includes(q));
        return matchesName || matchesBrand || matchesCategory || matchesNotes;
      })
    : [];

  const popularTags = ["Oud", "Musk", "Sandalwood", "Tuberose", "Amber", "Testers"];

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
            {/* Top Search Bar */}
            <div className="flex items-center gap-3 pb-4 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={inputRef}
                  type="text"
                  id="search-input"
                  placeholder="Search perfumes, notes, or creators..."
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

            {/* Quick Tags */}
            <div className="flex flex-wrap items-center gap-2 py-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A8A8A]">
                Trending:
              </span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="text-[11px] font-medium bg-white px-3 py-1.5 rounded-full text-[#0A0A0A] hover:bg-black hover:text-white transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="flex-1 pt-4 space-y-3">
              {query.trim() === "" ? (
                <div className="pt-12 pb-8 text-center text-[#8A8A8A]">
                  <p className="text-[14px] text-[#0A0A0A] font-medium">Type a fragrance name, olfactive note, or accords</p>
                  <p className="text-[12px] text-[#A0A0A0] mt-1">e.g. &ldquo;Oud&rdquo;, &ldquo;Sandalwood&rdquo;, &ldquo;Tester&rdquo;</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="pt-12 pb-8 text-center text-[#8A8A8A]">
                  <p className="text-[15px] font-medium text-[#0A0A0A]">No fragrances found for &ldquo;{query}&rdquo;</p>
                  <p className="text-[12px] mt-1">Try exploring by note like Amber, Musk, or Floral.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 bg-white p-3 rounded-[18px] hover:shadow-xs transition-shadow"
                    >
                      <div className="relative w-14 h-16 rounded-[12px] overflow-hidden bg-[#F0F0F0] shrink-0">
                        <Image
                          src={p.images?.[0] || "/images/products/santal.png"}
                          alt={p.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-[#8A8A8A] uppercase font-semibold">
                          {p.notesCategory} • {p.brand}
                        </span>
                        <h4 className="text-[14px] font-bold text-[#0A0A0A] capitalize truncate">
                          {p.name}
                        </h4>
                        <p className="text-[12px] text-[#8A8A8A] font-medium">
                          {p.variants?.bottle?.sizes?.[0]?.price || p.variants?.tester?.sizes?.[0]?.price}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#8A8A8A] shrink-0 pr-1" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
