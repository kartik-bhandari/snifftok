import React from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import WhatsAppRequestBanner from "@/components/WhatsAppRequestBanner";
import { fetchProducts } from "@/lib/products"
import EventSection from "@/components/EventSection";
import { fetchEventSection } from "@/lib/eventSection";

export default async function HomePage() {
  // Fetch products from the live API
  const [newRes, bestRes, testersRes, eventSection] = await Promise.all([
    fetchProducts({ tag: "new",         limit: 8 }),
    fetchProducts({ tag: "best-seller", limit: 8 }),
    fetchProducts({ type: "tester",     limit: 8 }),
    fetchEventSection(),   // null when switched off in the admin panel
  ]);

  const newArrivals = newRes.data   ?? [];
  const bestSellers = bestRes.data  ?? [];
  const testers     = testersRes.data ?? [];

  // If there are no tagged products yet, fall back to showing the latest
  const fallback = newArrivals.length === 0 && bestSellers.length === 0 && testers.length === 0;
  const latestRes = fallback ? await fetchProducts({ limit: 8 }) : null;
  const latest    = latestRes?.data ?? [];

  const displayNew  = newArrivals.length > 0 ? newArrivals : latest;
  const displayBest = bestSellers.length > 0 ? bestSellers : [];
  const displayTest = testers.length > 0     ? testers     : [];

  return (
    <div className="flex flex-col w-full pb-16 sm:pb-20">
      {/* 1. Full-screen Hero */}
      <Hero />

      {/* 1b. Event / offer section — only while switched on in the admin panel */}
      {eventSection && <EventSection section={eventSection} />}

      {/* 2. Best sellers */}
      {displayBest.length > 0 && (
        <FeatureSection
          id="best-sellers"
          title="Best sellers"
          products={displayBest}
          discoverHref="/shop/best-sellers"
        />
      )}

      {/* Can't find it? Ask on WhatsApp — right after Best sellers */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WhatsAppRequestBanner />
      </div>

      {/* 3. "New arrivals" Section */}
      {displayNew.length > 0 && (
        <section id="new-arrivals" className="w-full max-w-7xl mx-auto pt-6 sm:pt-10 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 scroll-mt-[72px] sm:scroll-mt-20">
          <div className="flex items-center justify-between pb-4 sm:pb-6 px-0.5">
            <div>
              <h2 className="text-[18px] sm:text-[24px] font-bold text-[#0A0A0A] tracking-tight">
                {newArrivals.length > 0 ? "New arrivals" : "Products"}
              </h2>
              <p className="text-[12px] sm:text-[14px] text-[#8A8A8A] hidden sm:block mt-0.5">
                Limited-run extraits composed with rare absolutes and aged essences.
              </p>
            </div>
            <Link
              href="/shop/new-arrivals"
              className="bg-white hover:bg-white/80 active:scale-95 text-[#0A0A0A] text-[12px] sm:text-[13px] font-medium px-4 sm:px-5 py-2 rounded-full shadow-xs border border-white/60 transition-transform"
            >
              Discover more
            </Link>
          </div>

          {/* Mobile: 2×2 grid */}
          <div className="grid grid-cols-2 gap-3.5 sm:hidden">
            {displayNew.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Tablet / Desktop */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {displayNew.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. Decants */}
      {displayTest.length > 0 && (
        <FeatureSection
          id="testers"
          title="Decants"
          products={displayTest}
          discoverHref="/shop/decants"
          preferDecant={true}
        />
      )}

      {/* Empty state — no products yet */}
      {displayNew.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <p className="text-[32px] mb-3">🌸</p>
          <h2 className="text-xl font-semibold text-[#0A0A0A] mb-2">Coming soon</h2>
          <p className="text-[#8A8A8A] text-sm">
            Our collection is being curated. Check back soon.
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
}
