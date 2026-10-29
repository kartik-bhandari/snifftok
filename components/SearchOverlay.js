"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import WhatsAppRequestBanner from "@/components/WhatsAppRequestBanner";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function formatPaise(paise) {
  if (!paise) return null;
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

const NOTE_TIERS = [
  ["top",   "top note"],
  ["heart", "heart note"],
  ["base",  "base note"],
];

/** First note containing `q` (lowercased), e.g. { note: "Lemon", tier: "top note" } */
function findNote(product, q) {
  for (const [key, tier] of NOTE_TIERS) {
    const note = (product.notes?.[key] ?? []).find((n) => n?.toLowerCase().includes(q));
    if (note) return { note, tier };
  }
  return null;
}

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Most common notes across the catalogue, for the suggestion chips — so every
 * suggestion is guaranteed to find something. Entries typed as one string
 * ("Bergamot, Apple and Black Currant") are split into single notes.
 */
function popularNotes(products, limit = 10) {
  const counts = new Map();   // lowercase note → { label, count }
  for (const p of products) {
    const seen = new Set();   // count each note once per product
    for (const [key] of NOTE_TIERS) {
      for (const raw of p.notes?.[key] ?? []) {
        for (const part of String(raw).split(/,|&|\band\b/i)) {
          const label = part.trim();
          const k = label.toLowerCase();
          if (!label || label.length > 30 || seen.has(k)) continue;
          seen.add(k);
          const entry = counts.get(k) ?? { label: titleCase(label), count: 0 };
          entry.count += 1;
          counts.set(k, entry);
        }
      }
    }
  }
  const picked = [];
  for (const { label } of [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))) {
    // "Calabrian Bergamot" is already covered by "Bergamot" — searching matches inside notes
    const lower = label.toLowerCase();
    if (picked.some((p) => new RegExp(`\\b${p.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower))) continue;
    picked.push(label);
    if (picked.length === limit) break;
  }
  return picked;
}

function NoteChips({ notes, onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {notes.map((note) => (
        <button
          key={note}
          type="button"
          onClick={() => onPick(note)}
          className="text-[13px] font-medium text-[#0A0A0A] bg-white hover:bg-[#0A0A0A] hover:text-white px-3.5 py-1.5 rounded-full shadow-xs transition-colors active:scale-95"
        >
          {note}
        </button>
      ))}
    </div>
  );
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
    fetch(`${API}/api/storefront/products?limit=200`)
      .then((r) => r.json())
      .then((data) => setProducts(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isSearchOpen]);

  const suggestions = useMemo(() => popularNotes(products), [products]);
  const hasQuery = query.trim().length > 0;

  // Sort alphabetically, then filter by name, brand or notes.
  // Name/brand matches come first; note-only matches follow, tagged with the note.
  // Nothing is listed until the shopper types — the full catalogue lives at /shop.
  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));

    const byName = [];
    const byNote = [];
    for (const product of sorted) {
      if (product.name?.toLowerCase().includes(q) || product.brand?.toLowerCase().includes(q)) {
        byName.push({ product, noteMatch: null });
      } else {
        const noteMatch = findNote(product, q);
        if (noteMatch) byNote.push({ product, noteMatch });
      }
    }
    return [...byName, ...byNote];
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
                  placeholder="Search by name, brand or note…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white rounded-full pl-10 pr-10 py-3 text-[14px] text-[#0A0A0A] placeholder-[#8A8A8A] shadow-xs outline-none focus:ring-1 focus:ring-[#0A0A0A]"
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                    aria-label="Clear search"
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

            {/* Before typing: note suggestions + link to the full catalogue */}
            {!hasQuery && (
              <div className="flex-1 pt-2 space-y-7">
                <section aria-labelledby="note-suggestions">
                  <p id="note-suggestions" className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A8A] mb-1">
                    Search by note
                  </p>
                  <p className="text-[13px] text-[#555555] mb-3">
                    Don&apos;t know the name? Search for a note you love and we&apos;ll find the bottles that have it.
                  </p>
                  {loading && suggestions.length === 0 ? (
                    <div className="flex flex-wrap gap-2" aria-busy="true">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <span key={i} className="h-8 w-20 rounded-full bg-white/70 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <NoteChips notes={suggestions} onPick={setQuery} />
                  )}
                </section>

                <Link
                  href="/shop"
                  onClick={() => setIsSearchOpen(false)}
                  className="group flex items-center justify-between bg-white rounded-[18px] px-4 py-3.5 hover:shadow-sm transition-shadow"
                >
                  <span>
                    <span className="block text-[14px] font-semibold text-[#0A0A0A]">Browse all fragrances</span>
                    <span className="block text-[12px] text-[#8A8A8A]">See the full collection, A to Z</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#0A0A0A] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}

            {/* Results */}
            {hasQuery && (
            <div className="flex-1 pt-2">
              {/* Section header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8A8A]">
                  {`${displayed.length} result${displayed.length !== 1 ? "s" : ""} for "${query.trim()}"`}
                </span>
                {loading && <Loader2 className="w-3.5 h-3.5 text-[#8A8A8A] animate-spin" />}
              </div>

              {!loading && displayed.length === 0 && (
                <div className="pt-10 pb-8 text-center text-[#8A8A8A]">
                  <p className="text-[15px] font-medium text-[#0A0A0A]">
                    No fragrances found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-[12px] mt-1 mb-4">Try a different name or brand — or one of these notes:</p>
                  <div className="flex justify-center">
                    <NoteChips notes={suggestions.slice(0, 6)} onPick={setQuery} />
                  </div>
                  <WhatsAppRequestBanner compact className="mt-8 max-w-md mx-auto" />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayed.map(({ product: p, noteMatch }) => {
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
                        {noteMatch && (
                          // Why this matched when the name doesn't contain the query
                          <span className="inline-block max-w-full truncate mt-1 text-[10px] font-semibold text-[#0A0A0A] bg-[#F0F0F0] px-2 py-0.5 rounded-full">
                            {noteMatch.note} · {noteMatch.tier}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#8A8A8A] shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
