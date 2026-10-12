"use client";

import React from "react";
import Image from "next/image";

export default function Hero() {
  const scrollToShop = (e) => {
    e.preventDefault();
    const target = document.getElementById("new-arrivals");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full h-[86vh] sm:h-[82vh] min-h-[580px] max-h-[840px] overflow-hidden select-none">
      {/* Full-bleed background hero visual */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/hero.png"
          alt="snifftok luxury fragrance campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Soft vertical gradient overlay for subtle atmosphere & contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-[#EFEFEF]/50 pointer-events-none" />
      </div>

      {/* Lower third: Centered underlined "Shop now" text link with editorial subtitle on desktop */}
      <div className="absolute inset-x-0 bottom-16 sm:bottom-20 flex flex-col items-center justify-center z-20 pointer-events-auto px-4 text-center">
        <span className="hidden sm:inline-block text-[12px] font-semibold uppercase tracking-widest text-[#0A0A0A]/80 mb-2 drop-shadow-xs">
          Artisanal Extraits • Grasse & Dubai
        </span>
        <a
          href="#new-arrivals"
          onClick={scrollToShop}
          id="hero-shop-now-link"
          className="text-[#0A0A0A] text-[15px] sm:text-[17px] font-medium underline underline-offset-6 tracking-tight hover:opacity-75 active:scale-95 transition-all"
        >
          Shop now
        </a>
      </div>

      {/* Soft gradient fade into the peek of the next section */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#EFEFEF] to-transparent pointer-events-none" />
    </section>
  );
}
