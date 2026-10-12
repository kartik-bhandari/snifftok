"use client";

import React from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import Footer from "@/components/Footer";
import productsData from "@/data/products.json";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useStore();

  const wishlistedProducts = productsData.filter((p) =>
    wishlist.some((w) => w.slug === p.slug)
  );

  return (
    <div className="flex flex-col w-full pt-20 sm:pt-24 select-none min-h-screen justify-between">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 sm:pb-6 border-b border-[#E0E0E0]">
          <div>
            <h1 className="text-[20px] sm:text-[26px] font-bold text-[#0A0A0A] tracking-tight">
              Curated Wardrobe
            </h1>
            <p className="text-[12px] sm:text-[14px] text-[#8A8A8A] mt-0.5">
              {wishlistedProducts.length} {wishlistedProducts.length === 1 ? "fragrance" : "fragrances"} saved to your personal vault
            </p>
          </div>
          <Link
            href="/"
            className="text-[12px] sm:text-[13px] font-medium text-[#0A0A0A] bg-white px-4 py-2 rounded-full border border-white/60 shadow-xs hover:bg-[#0A0A0A] hover:text-white transition-all"
          >
            Explore Fragrances
          </Link>
        </div>

        {/* Content */}
        {wishlistedProducts.length === 0 ? (
          <div className="py-24 sm:py-32 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center text-[#8A8A8A] mb-4 shadow-xs">
              <Bookmark className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
            </div>
            <h2 className="text-[16px] sm:text-[19px] font-bold text-[#0A0A0A]">
              Your curation is empty
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#8A8A8A] max-w-[280px] sm:max-w-[340px] mt-1.5 leading-relaxed">
              Tap the bookmark icon on any perfume card to curate your personal fragrance wardrobe.
            </p>
            <Link
              href="/"
              className="mt-6 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-[#0A0A0A] text-white text-[13px] sm:text-[14px] font-medium hover:bg-black/90 active:scale-95 transition-all shadow-sm"
            >
              Browse Perfumes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8 pt-6 pb-12">
            {wishlistedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
