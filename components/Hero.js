"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const scrollToShop = (e) => {
    e.preventDefault();
    const target = document.getElementById("new-arrivals");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      // Section not yet rendered (API still loading) — scroll down by viewport height
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full h-[88vh] sm:h-[90vh] min-h-[600px] max-h-[900px] overflow-hidden select-none">
      {/* Full-bleed background */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/hero.png"
          alt="snifftok luxury fragrance campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-[1.02] transition-transform duration-[8s] ease-out"
          style={{ transform: loaded ? "scale(1)" : "scale(1.04)" }}
        />
        {/* Rich layered overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50 pointer-events-none" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.25)_100%)] pointer-events-none" />
      </div>

      {/* Top badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="absolute top-24 sm:top-28 inset-x-0 flex justify-center z-20 pointer-events-none"
      >
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-xs bg-white/5">
          Artisanal Extraits · Grasse &amp; Dubai
        </span>
      </motion.div>

      {/* Central editorial headline */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-5 text-center pointer-events-none">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-white font-bold tracking-tight leading-[1.08]"
          style={{ fontSize: "clamp(2.4rem, 8vw, 5.5rem)" }}
        >
          Wear Your
          <br />
          <span className="italic font-light">Signature.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.65, ease: "easeOut" }}
          className="mt-4 text-white/70 text-[13px] sm:text-[15px] font-normal max-w-[280px] sm:max-w-[380px] leading-relaxed"
        >
          Curated luxury fragrances from the world&apos;s finest perfume houses — discover yours.
        </motion.p>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.6 }}
        className="absolute inset-x-0 bottom-14 sm:bottom-16 flex flex-col items-center gap-3 z-20 pointer-events-auto"
      >
        <a
          href="#new-arrivals"
          onClick={scrollToShop}
          id="hero-shop-now-link"
          className="group flex items-center gap-2.5 bg-white text-[#0A0A0A] text-[13px] sm:text-[14px] font-semibold px-7 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Shop the Collection
          <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </a>
      </motion.div>

      {/* Fade into next section */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#EFEFEF] to-transparent pointer-events-none" />
    </section>
  );
}
