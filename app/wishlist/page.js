"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import Footer from "@/components/Footer";

export default function WishlistPage() {
  const { wishlist } = useStore();

  return (
    <div className="flex flex-col w-full pt-20 sm:pt-24 select-none min-h-screen justify-between">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pb-5 sm:pb-6 border-b border-[#E0E0E0]">
          <h1 className="text-[20px] sm:text-[26px] font-bold text-[#0A0A0A] tracking-tight">
            Curated Wardrobe
          </h1>
          <p className="text-[12px] sm:text-[14px] text-[#8A8A8A] mt-0.5">
            {wishlist.length} {wishlist.length === 1 ? "fragrance" : "fragrances"} saved to your personal vault
          </p>
        </div>

        {/* Content */}
        {wishlist.length === 0 ? (
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
            {wishlist.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-square bg-[#F5F5F5]">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#CECECE]">
                      <Bookmark className="w-10 h-10 stroke-[1.2]" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  {product.brand && (
                    <p className="text-[11px] text-[#8A8A8A] uppercase tracking-wide mb-0.5">
                      {product.brand}
                    </p>
                  )}
                  <p className="text-[13px] font-semibold text-[#0A0A0A] leading-tight line-clamp-2">
                    {product.name}
                  </p>
                  <p className="text-[12px] text-[#0A0A0A] font-medium mt-1">{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
