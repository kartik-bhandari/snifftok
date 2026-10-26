"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function FeatureSection({ title, products, discoverHref = "#", id, preferDecant = false }) {
  const { isInWishlist, toggleWishlist } = useStore();

  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id={id} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-9 sm:my-12 scroll-mt-[72px] sm:scroll-mt-20">
      <div className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 lg:p-8 shadow-xs">
        {/* Header Row */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 px-0.5">
          <h2 className="text-[17px] sm:text-[21px] font-bold text-[#0A0A0A] tracking-tight">
            {title}
          </h2>

          <div className="flex items-center gap-2.5">
            {/* Desktop Carousel Controls */}
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-90 flex items-center justify-center text-[#0A0A0A] transition-all"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] active:scale-90 flex items-center justify-center text-[#0A0A0A] transition-all"
              >
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            <Link
              href={discoverHref}
              className="bg-[#0A0A0A] hover:bg-black/85 active:scale-95 text-white text-[11px] sm:text-[12px] font-medium tracking-wide px-4 py-2 rounded-full transition-transform shadow-xs"
            >
              Discover more
            </Link>
          </div>
        </div>

        {/* Horizontally Scrollable Row of Product Cards */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 sm:gap-6 pb-2 pt-1 no-scrollbar -mx-1 px-1 scroll-smooth"
        >
          {products.map((product) => {
            const isWishlisted = isInWishlist(product.slug);

            // Images: use the shared decant vial photo for decant cards so the
            // bottle photo isn't shown misleadingly; use product photo otherwise.
            const rawImg = product.images?.[0];
            const productImage = (typeof rawImg === "string" ? rawImg : rawImg?.url) || "/images/products/santal.png";
            const image = preferDecant ? "/images/decant-placeholder.png" : productImage;
            const isExternal = image.startsWith("http");

            // Price: prefer tester if preferDecant, else prefer bottle
            const vars = product.variants ?? [];
            const decants = vars.filter((v) => v.type === "tester");
            const bottles = vars.filter((v) => v.type === "bottle");
            const pick = preferDecant
              ? (decants[0] ?? bottles[0] ?? vars[0])
              : (bottles[0] ?? decants[0] ?? vars[0]);
            const price = pick?.pricing?.unitPriceExclDelivery
              ? `₹${Math.round(pick.pricing.unitPriceExclDelivery / 100).toLocaleString("en-IN")}`
              : (product.variants?.bottle?.sizes?.[0]?.price ?? "Price on request");

            return (
              <div
                key={product._id ?? product.id}
                className="flex-none w-[160px] sm:w-[210px] lg:w-[230px] flex flex-col group select-none transition-transform"
              >
                {/* Card Image */}
                <div className="relative aspect-[4/5] w-full rounded-[16px] sm:rounded-[18px] overflow-hidden bg-[#F0F0F0] shadow-xs group-hover:shadow-md transition-shadow">
                  <Link href={`/product/${product.slug}${preferDecant ? "?variant=decant" : ""}`} className="block w-full h-full relative">
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      unoptimized={isExternal}
                      sizes="(max-width: 640px) 160px, 230px"
                      className="object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
                    />
                  </Link>

                  {/* Decant badge — shown only in the decants section */}
                  {preferDecant && (
                    <div className="absolute bottom-2.5 left-2.5 z-10">
                      <span className="inline-flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Decant
                      </span>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    aria-label="Wishlist"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[#0A0A0A] bg-white/40 hover:bg-white/80 backdrop-blur-xs active:scale-90 transition-all z-10"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isWishlisted ? "fill-[#0A0A0A] stroke-[#0A0A0A]" : "stroke-[#0A0A0A]"
                      }`}
                    />
                  </button>
                </div>

                {/* Title & Price Row */}
                <div className="pt-2.5 flex items-start justify-between gap-1.5">
                  <div className="flex flex-col min-w-0 pr-1">
                    <Link
                      href={`/product/${product.slug}${preferDecant ? "?variant=decant" : ""}`}
                      className="text-[12px] sm:text-[13.5px] font-medium text-[#0A0A0A] truncate capitalize hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="text-[11px] sm:text-[12.5px] text-[#8A8A8A] font-normal tracking-tight mt-0.5">
                      {preferDecant ? "from " : ""}{price}
                    </span>
                  </div>


                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
