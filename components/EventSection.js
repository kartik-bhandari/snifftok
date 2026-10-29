import { Sparkles } from "lucide-react";
import ProductCard from "@/components/ProductCard";

/**
 * Special event / offer section on the home page — title, subtitle and
 * products are chosen in the admin panel (Event Section page).
 */
export default function EventSection({ section }) {
  const { title, subtitle, products } = section;

  return (
    <section
      id="event"
      aria-labelledby="event-title"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 scroll-mt-[72px] sm:scroll-mt-20"
    >
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#fff4e6] via-[#fdeee9] to-[#f6e7f3] border border-white/70 shadow-xs p-5 sm:p-7 lg:p-8">
        {/* Soft glow accents */}
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 w-64 h-64 rounded-full bg-[#ffd9a8]/50 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-[#f5c6dc]/40 blur-3xl" />

        {/* Header */}
        <div className="relative mb-5 sm:mb-7">
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase text-[#9a4b12] bg-white/70 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            Limited time
          </span>
          <h2 id="event-title" className="font-wordmark text-[#0A0A0A] text-[34px] sm:text-[48px] leading-none mt-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[13px] sm:text-[15px] text-[#5a4a44] mt-2 max-w-xl leading-snug">{subtitle}</p>
          )}
        </div>

        {/* Products — swipeable row on mobile, grid from tablet up */}
        <div className="relative -mx-5 px-5 sm:mx-0 sm:px-0 flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-pl-5 sm:scroll-pl-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible lg:grid-cols-4 lg:gap-8">
          {products.map((product) => (
            <div key={product._id} className="w-[44%] shrink-0 snap-start sm:w-auto">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
