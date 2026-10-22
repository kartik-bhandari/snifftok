"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function ProductCard({ product }) {
  const { isInWishlist, toggleWishlist } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Images: API returns [{url, publicId, ...}], old JSON was plain strings
  const rawImages = product.images ?? []
  const images = rawImages.length > 0
    ? rawImages.map(img => (typeof img === 'string' ? img : img.url))
    : ["/images/products/santal.png"]
  const isWishlisted = isInWishlist(product.slug)

  // Price: API returns paise in variants[].pricing.unitPriceExclDelivery
  // Old JSON used variants.bottle.sizes[0].price (string like "₹5,800")
  function formatPaise(paise) {
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  const displayPrice = (() => {
    const vars = product.variants ?? []
    // Prefer the cheapest bottle, then tester
    const bottles = vars.filter(v => v.type === 'bottle')
    const testers = vars.filter(v => v.type === 'tester')
    const pick    = bottles[0] ?? testers[0] ?? vars[0]
    if (pick?.pricing?.unitPriceExclDelivery) {
      return formatPaise(pick.pricing.unitPriceExclDelivery)
    }
    // Legacy JSON fallback
    return (
      product.variants?.bottle?.sizes?.[1]?.price ||
      product.variants?.bottle?.sizes?.[0]?.price ||
      product.variants?.tester?.sizes?.[0]?.price ||
      "Price on request"
    )
  })()

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handleDotClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex(idx);
  };


  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  // Determine current image: if user hovered on desktop and hasn't manually clicked dots, show second image
  const displayedImage = isHovered && images.length > 1 && activeImageIndex === 0 ? images[1] : images[activeImageIndex] || images[0];
  const isExternal = displayedImage?.startsWith('http')

  return (
    <div
      className="flex flex-col group select-none transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 4:5 Portrait Image Container with 16px radius */}
      <div className="relative aspect-[4/5] w-full rounded-[16px] sm:rounded-[18px] overflow-hidden bg-[#E2E2E2] shadow-xs group-hover:shadow-md transition-shadow">
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative">
          <Image
            src={displayedImage}
            alt={product.name}
            fill
            unoptimized={isExternal}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-104"
          />
        </Link>

        {/* Top-Right Bookmark Icon */}
        <button
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#0A0A0A] bg-white/40 hover:bg-white/80 backdrop-blur-xs active:scale-90 transition-all z-10"
        >
          <Bookmark
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              isWishlisted
                ? "fill-[#0A0A0A] stroke-[#0A0A0A]"
                : "stroke-[#0A0A0A] fill-white/40 drop-shadow-sm"
            }`}
          />
        </button>

        {/* Bottom-Center 3 Dots Carousel Indicator */}
        <div
          onClick={handleNextImage}
          className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5 z-10 cursor-pointer py-1"
        >
          {images.slice(0, 3).map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => handleDotClick(e, idx)}
              aria-label={`View image ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeImageIndex === idx ? "w-3 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Info Row: Name & Price */}
      <div className="pt-2.5 sm:pt-3 px-0.5">
        <Link
          href={`/product/${product.slug}`}
          className="text-[13px] sm:text-[14px] font-medium leading-snug text-[#0A0A0A] truncate capitalize hover:underline underline-offset-2 block"
        >
          {product.name}
        </Link>
        <span className="text-[12px] sm:text-[13px] text-[#8A8A8A] font-normal tracking-tight mt-0.5 block">
          {displayPrice}
        </span>
      </div>
    </div>
  );
}
