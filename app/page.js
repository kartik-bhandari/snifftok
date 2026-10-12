import React from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import productsData from "@/data/products.json";

export default function HomePage() {
  const newArrivals = productsData.filter((p) => p.isNewArrival);
  const bestSellers = productsData.filter((p) => p.isBestSeller);
  const testers = productsData.filter((p) => p.isTester || p.variants?.tester);

  return (
    <div className="flex flex-col w-full pb-16 sm:pb-20">
      {/* 1. Full-screen Hero */}
      <Hero />

      {/* 2. "New arrivals" Section (Reference 2x2 Grid on Mobile, Responsive Grid on Desktop) */}
      <section id="new-arrivals" className="w-full max-w-7xl mx-auto pt-6 sm:pt-10 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 scroll-mt-[72px] sm:scroll-mt-20">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 px-0.5">
          <div>
            <h1 className="text-[18px] sm:text-[24px] font-bold text-[#0A0A0A] tracking-tight">
              New arrivals
            </h1>
            <p className="text-[12px] sm:text-[14px] text-[#8A8A8A] hidden sm:block mt-0.5">
              Limited-run extraits composed with rare absolutes and aged essences.
            </p>
          </div>

          <Link
            href="/#new-arrivals"
            className="bg-white hover:bg-white/80 active:scale-95 text-[#0A0A0A] text-[12px] sm:text-[13px] font-medium px-4 sm:px-5 py-2 rounded-full shadow-xs border border-white/60 transition-transform"
          >
            Discover more
          </Link>
        </div>

        {/* Mobile View: Exactly 4 products (2x2 grid matching reference Screenshot 2 & 3) */}
        <div className="grid grid-cols-2 gap-3.5 sm:hidden">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Tablet / Desktop View: Full Responsive Grid */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. Feature Section: "Best sellers" */}
      <FeatureSection
        id="best-sellers"
        title="Best sellers"
        products={bestSellers}
        discoverHref="/#best-sellers"
      />

      {/* 4. Feature Section: "Testers & Samples" */}
      <FeatureSection
        id="testers"
        title="Testers & Samples"
        products={testers}
        discoverHref="/#testers"
      />

      {/* Separation before footer: large on mobile to prevent dock collision, compact on desktop */}
      <div className="h-44 sm:h-28 md:h-12 w-full" />

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}
